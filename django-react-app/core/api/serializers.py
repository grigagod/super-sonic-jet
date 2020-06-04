from django_countries.serializer_fields import CountryField
from rest_framework import serializers
from core.models import (
    Address, Item, Order, OrderItem, Coupon, Category
)


class StringSerializer(serializers.StringRelatedField):
    def to_internal_value(self, value):
        return value


class CouponSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        fields = (
            'id',
            'code',
            'amount'
        )


class ItemSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = (
            'id',
            'title',
            'price',
            'discount_price',
            'label',
            'slug',
            'size',
            'description',
            'image'
        )

    def get_label(self, obj):
        return obj.get_label_display()


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = (
            'id',
            'name',
            'image'
        )


class CategoryDetailSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = (
            'id',
            'items'
        )
    
    def get_items(self, obj):
        return ItemSerializer(obj.items.all(), many=True).data


class OrderItemSerializer(serializers.ModelSerializer):
    item = serializers.SerializerMethodField()
    final_price = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = (
            'id',
            'item',
            'final_price'
        )

    def get_item(self, obj):
        return ItemSerializer(obj.item).data

    def get_final_price(self, obj):
        return obj.get_final_price()


class OrderSerializer(serializers.ModelSerializer):
    order_items = serializers.SerializerMethodField()
    total = serializers.SerializerMethodField()
    coupon = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = (
            'id',
            'order_items',
            'ordered_date',
            'being_delivered',
            'received',
            'refund_requested',
            'refund_granted',
            'total',
            'coupon'
        )

    def get_order_items(self, obj):
        return OrderItemSerializer(obj.items.all(), many=True).data

    def get_total(self, obj):
        return obj.get_total()

    def get_coupon(self, obj):
        if obj.coupon is not None:
            return CouponSerializer(obj.coupon).data
        return None


class ItemDetailSerializer(serializers.ModelSerializer):
    label = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = (
            'id',
            'title',
            'price',
            'discount_price',
            'label',
            'slug',
            'size',
            'description',
            'image',
        )

    def get_category(self, obj):
        return obj.get_category_display()

    def get_label(self, obj):
        return obj.get_label_display()

    def get_variations(self, obj):
        return VariationSerializer(obj.variation_set.all(), many=True).data


class AddressSerializer(serializers.ModelSerializer):
    country = CountryField()

    class Meta:
        model = Address
        fields = (
            'id',
            'user',
            'street_address',
            'apartment_address',
            'country',
            'zip',
            'address_type',
            'default'
        )
