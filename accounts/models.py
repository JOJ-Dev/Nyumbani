from django.db import models
from django.contrib.auth.models import AbstractUser
from phonenumber_field.modelfields import PhoneNumberField
import random 
from datetime import timedelta
from django.utils import timezone


class User(AbstractUser):
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    ID_Number = models.CharField(max_length=200)
    phone_number = PhoneNumberField(blank=True)
    isLandlord = models.BooleanField(default=True)
    #For OTP VERIFICATION
    otp = models.CharField(max_length=6, blank=True, null=True)
    otp_exp = models.DateTimeField(blank=True, null=True) 
    otp_verified = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['isLandlord','ID_Number','first_name', 'last_name']

    def __str__(self):
        return {self.first_name, self.last_name}
    
    def generate_otp(self):
        self.otp = str(random.randint(100000, 999999))  # Generate 6-digit OTP
        self.otp_exp = timezone.now() + timedelta(minutes=10)
        self.otp_verified = False
        self.save()
    
class Appartment(models.Model):
    AppartmentName = models.CharField(max_length=200)
    Houses = models.CharField(max_length=200)
    Location = models.CharField(max_length=200)

class Landlord(User):
    Appartment = models.ForeignKey(Appartment, on_delete=models.CASCADE)

class Tenant(User):
    Appartment = models.OneToOneField(Appartment, on_delete=models.CASCADE)
    negotiatedHousePrice = models.CharField(max_length=200)
    House_Number = models.CharField(max_length=200)
    DateOfEntry = models.DateField(auto_now_add=True)
    DeadlineOfPayment = models.DateField(auto_now=False)
    rentBalance = models.CharField(max_length=200)
    PaidAmount = models.CharField(max_length=200)
