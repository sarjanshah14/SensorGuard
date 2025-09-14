# sensors/admin.py
from django.contrib import admin
from .models import Sensor, Reading, Calibration, Anomaly, Report

admin.site.register(Sensor)
admin.site.register(Reading)
admin.site.register(Calibration)
admin.site.register(Anomaly)
admin.site.register(Report)
