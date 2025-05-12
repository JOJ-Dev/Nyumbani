from .models import *

def Check_House_Availability():
    if Tenant.House_Number > Appartment.Houses:
        return {"message":"The Appartment is not vacant"}
    else:                                   
        return 