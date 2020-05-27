from django.urls import path
from .views import (
    ItemListView,
    AddToCartView,
    OrderDetailView,
    PaymentView,
    GoogleLogin
)

urlpatterns = [
    path('products/', ItemListView.as_view(), name='product-list'),
    path('add-to-cart/', AddToCartView.as_view(), name='add-to-cart'),
    path('order-summary/', OrderDetailView.as_view(), name='order-summary'),
    path('checkout/', PaymentView.as_view(), name='checkout'),
    path('google/', GoogleLogin.as_view(), name='google_login')
]
