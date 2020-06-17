from django_countries import countries
from django.db.models import Q
from django.conf import settings
from django.core.exceptions import ObjectDoesNotExist
from django.http import Http404
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django.template.loader import render_to_string, get_template
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from rest_framework.generics import (
    ListAPIView, RetrieveAPIView, CreateAPIView,
    UpdateAPIView, DestroyAPIView
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST
from core.models import Item, OrderItem, Order, Category
from .serializers import (
    ItemSerializer, OrderSerializer, ItemDetailSerializer, AddressSerializer, CategorySerializer, CategoryDetailSerializer
)
from core.models import Item, OrderItem, Order, Address, Coupon, Refund, UserProfile
from rest_auth.registration.views import SocialLoginView
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from rest_framework.decorators import api_view
from allauth.account.models import EmailConfirmation, EmailConfirmationHMAC
from rest_framework.exceptions import NotFound
from django.core.mail import EmailMessage, EmailMultiAlternatives   
from django.http import HttpResponse
from django.template import loader

import stripe

stripe.api_key = settings.STRIPE_SECRET_KEY


class VerifyEmailView(APIView):

    def get(self, request, *args, **kwargs):
        username = Token.objects.get(key=request.query_params.get('token', None)).user.username
        user = UserProfile.objects.filter(user__username__startswith=username)[0]
        user.email_verification = True
        user.save()
        template = loader.get_template('email_success.html')
        context = {
            'token': request.query_params.get('token', None),
        }
        return HttpResponse(template.render(context, request))


class ConfirmEmailView(APIView):
    permission_classes = [IsAuthenticated, ]

    def get(self, request, *args, **kwargs):
        token = request.query_params.get('token', None)
        user = Token.objects.get(key=token).user
        template = render_to_string('email_template.txt', {'name': user.username, 'token': token})
        email = EmailMessage(
            'Super-sonic-jet-administration',
            template,
            settings.EMAIL_HOST_USER,
            [user.email]
        )
        email.fail_silently = False
        email.send()
        return Response(request.query_params, status=HTTP_200_OK)


@api_view()
def null_view(request):
    return Response(status=HTTP_400_BAD_REQUEST)


@api_view()
def complete_view(request):
    return Response("Email account is activated")


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2Adapter


class UserIDView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({'userID': request.user.id}, status=HTTP_200_OK)


class UserVerificationView(APIView):
    permission_classes = (IsAuthenticated,)

    def get(self, request, *args, **kwargs):
        return Response({'verification': UserProfile.objects.get(user__id=request.user.id).email_verification}, status=HTTP_200_OK)


class CategoryListView(ListAPIView):
    permission_classes = (AllowAny,)
    serializer_class = CategorySerializer
    queryset = Category.objects.all()


class CategoryDetailView(RetrieveAPIView):
    permission_classes = (AllowAny,)
    serializer_class = CategoryDetailSerializer
    queryset = Category.objects.all()


class ItemListView(ListAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ItemSerializer
    queryset = Item.objects.all()


class ItemDetailView(RetrieveAPIView):
    permission_classes = (AllowAny,)
    serializer_class = ItemDetailSerializer
    queryset = Item.objects.all()


class OrderItemDeleteView(DestroyAPIView):
    permission_classes = (IsAuthenticated, )
    queryset = OrderItem.objects.all()


class AddToCartView(APIView):
    permission_classes = (IsAuthenticated, )

    def post(self, request, *args, **kwargs):
        slug = request.data.get('slug', None)
        if slug is None:
            return Response({"message": "Invalid request"}, status=HTTP_400_BAD_REQUEST)

        item = get_object_or_404(Item, slug=slug)
        order_item_qs = OrderItem.objects.filter(
            item=item,
            user=request.user,
            ordered=False
        )
        if order_item_qs.exists():
            return Response({"message": "Already added"}, status=HTTP_400_BAD_REQUEST)
        else:
            order_item = OrderItem.objects.create(
                item=item,
                user=request.user,
                ordered=False
            )
            order_item.save()

        order_qs = Order.objects.filter(user=request.user, ordered=False)
        if order_qs.exists():
            order = order_qs[0]
            if not order.items.filter(item__id=order_item.id).exists():
                order.items.add(order_item)
                return Response(status=HTTP_200_OK)
            
        else:
            ordered_date = timezone.now()
            order = Order.objects.create(
                user=request.user, ordered_date=ordered_date)
            order.items.add(order_item)
        return Response(status=HTTP_200_OK)


class OrderDetailView(RetrieveAPIView):
    serializer_class = OrderSerializer
    permission_classes = (IsAuthenticated,)

    def get_object(self):
        try:
            order = Order.objects.get(user=self.request.user, ordered=False)
            return order
        except ObjectDoesNotExist:
            raise Http404("You do not have an active order")
            # return Response({"message": "You do not have an active order"}, status=HTTP_400_BAD_REQUEST)


class OrderDoneView(APIView):

    def post(self, request, *args, **kwargs):
        try:
            token = request.data.get('token', None)
            user = Token.objects.get(key=token).user
            order = Order.objects.get(user=user, ordered=False)
            userprofile = UserProfile.objects.get(user=user)
            shipping_address_id = request.data.get('selectedShippingAddress')

            shipping_address = Address.objects.get(id=shipping_address_id)
            order_items = order.items.all()
            order_items.update(ordered=True)
            for item in order_items:
                item.save()
            order.ordered = True
            order.shipping_address = shipping_address
            # order.ref_code = create_ref_code()
            order.save()
            html_content = get_template('order_total.html').render({'order': OrderSerializer(order).data, 'client': user})
            msg = EmailMultiAlternatives(
                'Super-sonic-jet-administration',
                'text_content',
                settings.EMAIL_HOST_USER,
                ["supersjorders@gmail.com"])
            msg.attach_alternative(html_content, "text/html")
            msg.send()
            return Response(status=HTTP_200_OK)
        except ObjectDoesNotExist:
            raise Http404("Invalid data received")


class AddCouponView(APIView):
    def post(self, request, *args, **kwargs):
        code = request.data.get('code', None)
        if code is None:
            return Response({"message": "Invalid data received"}, status=HTTP_400_BAD_REQUEST)
        order = Order.objects.get(
            user=self.request.user, ordered=False)
        coupon = get_object_or_404(Coupon, code=code)
        order.coupon = coupon
        order.save()
        return Response(status=HTTP_200_OK)


class CountryListView(APIView):
    def get(self, request, *args, **kwargs):
        return Response(countries, status=HTTP_200_OK)


class AddressListView(ListAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = AddressSerializer

    def get_queryset(self):
        address_type = self.request.query_params.get('address_type', None)
        qs = Address.objects.all()
        if address_type is None:
            return qs
        return qs.filter(user=self.request.user, address_type=address_type)


class AddressCreateView(CreateAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = AddressSerializer
    queryset = Address.objects.all()


class AddressUpdateView(UpdateAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = AddressSerializer
    queryset = Address.objects.all()


class AddressDeleteView(DestroyAPIView):
    permission_classes = (IsAuthenticated, )
    queryset = Address.objects.all()


class OrderListView(ListAPIView):
    permission_classes = (IsAuthenticated, )
    serializer_class = OrderSerializer

    def get_queryset(self):
        return Order.objects.filter(user=self.request.user, ordered=True)
