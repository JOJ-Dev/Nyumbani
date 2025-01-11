from django.urls import path, include
from Base import views

urlpatterns = [
    path('', views.index, name='index'),
]