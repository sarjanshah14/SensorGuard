from django.db import models
from django.utils import timezone

# ---------- SENSOR MODEL ----------
class Sensor(models.Model):
    SENSOR_TYPES = [
        ('Temperature', 'Temperature'),
        ('Pressure', 'Pressure'),
        ('Humidity', 'Humidity'),
        ('Vibration', 'Vibration'),
        ('Flow', 'Flow'),
    ]

    STATUS_CHOICES = [
        ('online', 'Online'),
        ('warning', 'Warning'),
        ('critical', 'Critical'),
        ('offline', 'Offline'),
    ]

    name = models.CharField(max_length=100)
    type = models.CharField(max_length=20, choices=SENSOR_TYPES)
    value = models.FloatField(default=0.0)
    unit = models.CharField(max_length=20)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="online")
    last_updated = models.DateTimeField(auto_now=True)
    drift = models.FloatField(default=0.0)
    

    def __str__(self):
        return f"{self.name} ({self.type})"


# ---------- READING MODEL ----------
class Reading(models.Model):
    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='readings')
    raw_value = models.FloatField()
    timestamp = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.sensor.name} - {self.raw_value} at {self.timestamp}"


# ---------- CALIBRATION MODEL ----------
class Calibration(models.Model):
    CALIBRATION_METHODS = [
        ('linear', 'Linear'),
        ('polynomial', 'Polynomial'),
        ('custom', 'Custom'),
    ]

    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='calibrations')
    method = models.CharField(max_length=50, choices=CALIBRATION_METHODS)
    params = models.JSONField(default=dict)  # Works in SQLite
    corrected_value = models.FloatField()
    applied_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sensor.name} calibration ({self.method})"


# ---------- ANOMALY MODEL ----------
class Anomaly(models.Model):
    ANOMALY_TYPES = [
        ('Drift', 'Drift'),
        ('Spike', 'Spike'),
        ('Dropout', 'Dropout'),
        ('Noise', 'Noise'),
        ('Calibration Error', 'Calibration Error'),
    ]

    SEVERITY_CHOICES = [
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High'),
        ('Critical', 'Critical'),
    ]

    sensor = models.ForeignKey("Sensor", on_delete=models.CASCADE, related_name="anomalies")
    type = models.CharField(max_length=50, choices=ANOMALY_TYPES)
    value = models.FloatField()
    expected = models.FloatField()
    deviation = models.FloatField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES)
    resolved = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sensor.name} - {self.type} ({self.severity})"



# ---------- REPORT MODEL ----------
class Report(models.Model):
    REPORT_TYPES = [
        ('csv', 'CSV'),
        ('excel', 'Excel'),
        ('pdf', 'PDF'),
    ]

    sensor = models.ForeignKey(Sensor, on_delete=models.CASCADE, related_name='reports')
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    file_path = models.CharField(max_length=200)  # Path to saved file
    generated_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.sensor.name} report ({self.report_type})"
