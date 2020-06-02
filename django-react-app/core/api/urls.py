from django.urls import path
from .views import (
    ItemListView,
    ItemDetailView,
    AddToCartView,
    OrderDetailView,
    PaymentView,
    GoogleLogin,
    OrderItemDeleteView,
    OrderQuantityUpdateView,
    ConfirmEmailView,
    VerifyEmailView

)

urlpatterns = [
    path('products/', ItemListView.as_view(), name='product-list'),
    path('products/<pk>/', ItemDetailView.as_view(), name='product-detail'),
    path('add-to-cart/', AddToCartView.as_view(), name='add-to-cart'),
    path('order-summary/', OrderDetailView.as_view(), name='order-summary'),
    path('checkout/', PaymentView.as_view(), name='checkout'),
    path('google/', GoogleLogin.as_view(), name='google_login'),
    path('order-items/<pk>/delete/', OrderItemDeleteView.as_view(), name='order-item-delete'),
    path('order-item/update-quantity/',
         OrderQuantityUpdateView.as_view(), name='order-item-update-quantity'),
    path('verify/', ConfirmEmailView.as_view(), name='confirm-email'),
    path('verify-last/', VerifyEmailView.as_view(), name='verify-email'),
]
