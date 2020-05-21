from .views import ItemListView
from django.urls import path

urlpatterns = [
    path('products/', ItemListView.as_view(), name='product-list'),
]
