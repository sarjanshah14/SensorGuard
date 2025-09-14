from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from .models import Sensor, Reading, Calibration, Anomaly, Report
from .serializers import (
    SensorSerializer,
    ReadingSerializer,
    CalibrationSerializer,
    AnomalySerializer,
    ReportSerializer
)
from .authentication import UserRegistrationSerializer, CustomTokenObtainPairSerializer, get_tokens_for_user
from .services.simulation import generate_sensor_reading
from .services.anomaly import predict_drift
from django.http import HttpResponse
from .services import report as report_service

# ---------------- SENSOR VIEWS ----------------
class SensorListCreateAPIView(generics.ListCreateAPIView):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer

# Retrieve, update, or delete a sensor
class SensorDetailAPIView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Sensor.objects.all()
    serializer_class = SensorSerializer


# ---------------- READING VIEWS ----------------
class ReadingListCreateAPIView(APIView):
    def post(self, request):
        serializer = ReadingSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)
        reading = serializer.save()

        sensor = reading.sensor
        ideal_value = sensor.value or 1
        actual_value = reading.raw_value

        # Calculate drift as percentage
        drift_percent = ((actual_value - ideal_value) / ideal_value) * 100

        # Use dynamic threshold based on sensor type
        threshold_map = {
            "Temperature": 3,
            "Pressure": 2,    # example: smaller threshold
            "Humidity": 2,    # example: smaller threshold
            "Vibration": 5,
            "Flow": 5,
        }
        threshold = threshold_map.get(sensor.type, 3)

        if abs(drift_percent) > threshold:
            severity = "High" if abs(drift_percent) <= 5 else "Critical"
            Anomaly.objects.create(
                sensor=sensor,
                type="Drift",
                value=actual_value,
                expected=ideal_value,
                deviation=drift_percent,
                severity=severity,
                resolved=False
            )

        return Response(ReadingSerializer(reading).data, status=201)




class ReadingHistoryAPIView(APIView):
    def get(self, request):
        sensor_name = request.query_params.get('sensor_name')
        start = request.query_params.get('from')
        end = request.query_params.get('to')

        readings = Reading.objects.all()
        if sensor_name:
            readings = readings.filter(sensor__name=sensor_name)
        if start and end:
            readings = readings.filter(timestamp__range=[start, end])

        serializer = ReadingSerializer(readings, many=True)
        return Response(serializer.data)



# ---------------- CALIBRATION VIEWS ----------------
class CalibrationApplyAPIView(APIView):
    def post(self, request):
        serializer = CalibrationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class CalibrationHistoryAPIView(APIView):
    def get(self, request):
        sensor_id = request.query_params.get('sensor_id')

        if sensor_id:
            calibrations = Calibration.objects.filter(sensor_id=sensor_id).order_by('-applied_at')
        else:
            calibrations = Calibration.objects.all().order_by('-applied_at')

        serializer = CalibrationSerializer(calibrations, many=True)
        return Response(serializer.data)



# ---------------- ANOMALY VIEWS ----------------
class AnomalyListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = AnomalySerializer

    def get_queryset(self):
        queryset = Anomaly.objects.all().order_by("-timestamp")
        sensor_name = self.request.query_params.get("sensor_name")
        if sensor_name:
            queryset = queryset.filter(sensor__name=sensor_name)
        return queryset



class AnomalyDetectAPIView(APIView):
    def post(self, request):
        # Placeholder for ML-based anomaly detection
        return Response({"message": "Anomaly detection will be implemented here."})


# ---------------- REPORT VIEWS ----------------
class ReportGenerateAPIView(APIView):
    def post(self, request):
        # Placeholder for report generation
        return Response({"message": "Report generation will be implemented here."})
    

# Removed duplicate classes - keeping the enhanced versions below

    
class ReportGenerateAPIView(APIView):
    def post(self, request):
        sensor_id = request.data.get('sensor_id')
        report_type = request.data.get('format', 'csv')  # default csv

        if report_type == 'csv':
            output, filename = report_service.generate_csv_report(sensor_id)
            response = HttpResponse(output, content_type='text/csv')
        elif report_type == 'excel':
            output, filename = report_service.generate_excel_report(sensor_id)
            response = HttpResponse(output, content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
        elif report_type == 'pdf':
            output, filename = report_service.generate_pdf_report(sensor_id)
            response = HttpResponse(output, content_type='application/pdf')
        else:
            return Response({"error": "Invalid format"}, status=400)

        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response



from .services.calibrations_ai import adaptive_calibration
from .services.anomaly_ml import ml_anomaly_detection
from .services.model_training import ModelTrainer
from .services.enhanced_ml_services import EnhancedMLServices
from .services.ml_analytics import MLAnalyticsService
from .services.calibration_scheduler import CalibrationScheduler

class SimulateReadingAPIView(APIView):
    def post(self, request):
        sensor_id = request.data.get('sensor_id')
        reading = generate_sensor_reading(sensor_id)
        if not reading:
            return Response({"error": "Sensor not found"}, status=404)

        # Apply adaptive calibration
        corrected_value = adaptive_calibration(sensor_id, reading.raw_value)
        Calibration.objects.create(sensor_id=sensor_id, method="adaptive", params={}, corrected_value=corrected_value)

        # Detect ML anomalies
        ml_anomaly_detection(sensor_id)

        serializer = ReadingSerializer(reading)
        return Response({
            "reading": serializer.data,
            "corrected_value": corrected_value
        }, status=201)
        
        
from .services.drift_predictions import simple_drift_prediction

class DriftPredictionAPIView(APIView):
    def get(self, request):
        sensor_id = request.query_params.get('sensor_id')
        predictions = simple_drift_prediction(sensor_id)
        return Response({"sensor_id": sensor_id, "predicted_drift": predictions})

from django.utils.timezone import now

class SensorDashboardAPIView(APIView):
    def get(self, request):
        sensors = Sensor.objects.all()
        data = []
        for sensor in sensors:
            latest = sensor.readings.order_by('-timestamp').first()
            if latest:
                serialized = ReadingSerializer(latest).data
                data.append(serialized)
        return Response(data)


# ---------------- MODEL TRAINING VIEWS ----------------
class ModelTrainingAPIView(APIView):
    def post(self, request):
        """Train models for a specific sensor or all sensors"""
        sensor_id = request.data.get('sensor_id')
        model_type = request.data.get('model_type', 'all')  # 'anomaly', 'drift', 'calibration', 'all'
        
        trainer = ModelTrainer()
        
        if model_type == 'all':
            results = trainer.train_all_models(sensor_id)
        else:
            if not sensor_id:
                return Response({"error": "sensor_id required for specific model training"}, status=400)
            
            if model_type == 'anomaly':
                results = trainer.train_anomaly_detection_model(sensor_id)
            elif model_type == 'drift':
                results = trainer.train_drift_prediction_model(sensor_id)
            elif model_type == 'calibration':
                results = trainer.train_calibration_model(sensor_id)
            else:
                return Response({"error": "Invalid model_type"}, status=400)
        
        return Response(results, status=200)
    
    def get(self, request):
        """Get information about trained models"""
        trainer = ModelTrainer()
        models_info = trainer.get_model_info()
        return Response({"models": models_info})


class EnhancedAnomalyDetectionAPIView(APIView):
    def post(self, request):
        """Use trained model for anomaly detection"""
        sensor_id = request.data.get('sensor_id')
        reading_value = request.data.get('reading_value')
        timestamp = request.data.get('timestamp')
        
        if not sensor_id or reading_value is None:
            return Response({"error": "sensor_id and reading_value required"}, status=400)
        
        ml_service = EnhancedMLServices()
        result = ml_service.predict_anomaly_with_trained_model(sensor_id, reading_value, timestamp)
        
        return Response(result)


class EnhancedDriftPredictionAPIView(APIView):
    def get(self, request):
        """Use trained model for drift prediction"""
        sensor_id = request.query_params.get('sensor_id')
        future_points = int(request.query_params.get('future_points', 5))
        
        if not sensor_id:
            return Response({"error": "sensor_id required"}, status=400)
        
        ml_service = EnhancedMLServices()
        result = ml_service.predict_drift_with_trained_model(sensor_id, future_points)
        
        return Response(result)


class EnhancedCalibrationAPIView(APIView):
    def post(self, request):
        """Use trained model for adaptive calibration"""
        sensor_id = request.data.get('sensor_id')
        raw_value = request.data.get('raw_value')
        
        if not sensor_id or raw_value is None:
            return Response({"error": "sensor_id and raw_value required"}, status=400)
        
        ml_service = EnhancedMLServices()
        result = ml_service.apply_adaptive_calibration_with_trained_model(sensor_id, raw_value)
        
        return Response(result)


class AutoTrainModelsAPIView(APIView):
    def post(self, request):
        """Automatically train models if needed"""
        sensor_id = request.data.get('sensor_id')
        
        if not sensor_id:
            return Response({"error": "sensor_id required"}, status=400)
        
        ml_service = EnhancedMLServices()
        results = ml_service.auto_train_models_if_needed(sensor_id)
        
        return Response(results)


class MLAnalyticsAPIView(APIView):
    def get(self, request):
        """Get ML analytics and statistics"""
        analytics_service = MLAnalyticsService()
        stats = analytics_service.get_ml_statistics()
        return Response(stats)
    
    def post(self, request):
        """Trigger automatic model training"""
        analytics_service = MLAnalyticsService()
        results = analytics_service.auto_train_models_if_needed()
        return Response({"training_results": results})


class CalibrationSchedulerAPIView(APIView):
    def get(self, request):
        """Get calibration schedule predictions for a sensor"""
        sensor_id = request.query_params.get('sensor_id')
        
        if not sensor_id:
            return Response({"error": "sensor_id required"}, status=400)
        
        scheduler = CalibrationScheduler()
        
        # Get drift predictions first
        ml_service = EnhancedMLServices()
        drift_result = ml_service.predict_drift_with_trained_model(int(sensor_id), 5)
        
        if 'predictions' in drift_result:
            schedule_result = scheduler.predict_calibration_schedule(int(sensor_id), drift_result['predictions'])
            return Response(schedule_result)
        else:
            return Response({"error": "Could not get drift predictions"}, status=400)
    
    def post(self, request):
        """Get calibration recommendations for a sensor"""
        sensor_id = request.data.get('sensor_id')
        
        if not sensor_id:
            return Response({"error": "sensor_id required"}, status=400)
        
        scheduler = CalibrationScheduler()
        recommendations = scheduler.get_calibration_recommendations(sensor_id)
        
        return Response(recommendations)


# ---------------- AUTHENTICATION VIEWS ----------------
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class UserRegistrationAPIView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            tokens = get_tokens_for_user(user)
            return Response({
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                },
                'tokens': tokens
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'date_joined': user.date_joined,
            'last_login': user.last_login,
        })
    
    def put(self, request):
        user = request.user
        data = request.data
        
        # Update user fields
        if 'first_name' in data:
            user.first_name = data['first_name']
        if 'last_name' in data:
            user.last_name = data['last_name']
        if 'email' in data:
            user.email = data['email']
        
        user.save()
        
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        })

class ChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')
        
        if not old_password or not new_password:
            return Response({'error': 'old_password and new_password are required'}, status=400)
        
        if not user.check_password(old_password):
            return Response({'error': 'Invalid old password'}, status=400)
        
        if len(new_password) < 8:
            return Response({'error': 'New password must be at least 8 characters long'}, status=400)
        
        user.set_password(new_password)
        user.save()
        
        return Response({'message': 'Password changed successfully'})

class LogoutAPIView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        # In a real implementation, you might want to blacklist the token
        # For now, we'll just return a success message
        return Response({'message': 'Logged out successfully'})