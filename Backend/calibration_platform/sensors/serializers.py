from rest_framework import serializers
from .models import Sensor, Reading, Calibration, Anomaly, Report


# ---------- SENSOR SERIALIZER ----------
class SensorSerializer(serializers.ModelSerializer):
    # Match frontend naming (camelCase in React)
    lastUpdated = serializers.DateTimeField(source="last_updated", format="%Y-%m-%dT%H:%M:%SZ")

    class Meta:
        model = Sensor
        fields = ["id", "name", "type", "value", "unit", "status", "lastUpdated", "drift"]


# ---------- READING SERIALIZER ----------
class ReadingSerializer(serializers.ModelSerializer):
    sensor_name = serializers.CharField(source="sensor.name", read_only=True)
    type = serializers.CharField(source="sensor.type", read_only=True)
    unit = serializers.CharField(source="sensor.unit", read_only=True)
    lastUpdated = serializers.DateTimeField(source="timestamp", read_only=True)

    # Computed fields
    status = serializers.SerializerMethodField()
    drift = serializers.SerializerMethodField()

    class Meta:
        model = Reading
        fields = [
            "id",
            "sensor",
            "sensor_name",
            "type",
            "raw_value",     # use the correct model field
            "unit",
            "status",
            "drift",
            "lastUpdated",
        ]
        extra_kwargs = {
            "sensor": {"write_only": True},
        }

    def get_status(self, obj):
        """Assign status based on anomalies/drift"""
        if obj.sensor.value is not None and abs(obj.raw_value - obj.sensor.value) > 3:
            return "critical"
        return "online"

    def get_drift(self, obj):
        """Simple drift calculation (baseline = sensor.value)"""
        baseline = obj.sensor.value or 1
        return round((obj.raw_value - baseline) / baseline * 100, 2)



# ---------- CALIBRATION SERIALIZER ----------
class CalibrationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Calibration
        fields = '__all__'


class AnomalySerializer(serializers.ModelSerializer):
    sensor_name = serializers.CharField(source="sensor.name", read_only=True)

    class Meta:
        model = Anomaly
        fields = "__all__"


# ---------- REPORT SERIALIZER ----------
class ReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = Report
        fields = '__all__'
