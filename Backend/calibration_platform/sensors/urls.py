from django.urls import path
from .views import (
    SensorListCreateAPIView, SensorDetailAPIView, SensorDashboardAPIView,
    ReadingListCreateAPIView, ReadingHistoryAPIView,
    CalibrationApplyAPIView, CalibrationHistoryAPIView,
    AnomalyListCreateAPIView, AnomalyDetectAPIView,
    ReportGenerateAPIView, SimulateReadingAPIView, DriftPredictionAPIView,
    ModelTrainingAPIView, EnhancedAnomalyDetectionAPIView, 
    EnhancedDriftPredictionAPIView, EnhancedCalibrationAPIView, AutoTrainModelsAPIView,
    MLAnalyticsAPIView, CalibrationSchedulerAPIView,
    CustomTokenObtainPairView, UserRegistrationAPIView, UserProfileAPIView,
    ChangePasswordAPIView, LogoutAPIView
)

urlpatterns = [
    # Sensors
    path("sensors/", SensorListCreateAPIView.as_view(), name="sensor-list-create"),
    path("sensors/<int:pk>/", SensorDetailAPIView.as_view(), name="sensor-detail"),
    path("sensors/dashboard/", SensorDashboardAPIView.as_view(), name="sensor-dashboard"),

    # Readings
    path('readings/', ReadingListCreateAPIView.as_view(), name='reading-list-create'),
    path('readings/history/', ReadingHistoryAPIView.as_view(), name='reading-history'),

    # Calibration
    path('calibration/apply/', CalibrationApplyAPIView.as_view(), name='calibration-apply'),
    path('calibration/history/', CalibrationHistoryAPIView.as_view(), name='calibration-history'),

    # Anomalies
    path("anomalies/", AnomalyListCreateAPIView.as_view(), name="anomaly-list"),
    path('anomalies/detect/', AnomalyDetectAPIView.as_view(), name='anomaly-detect'),

    # Reports
    path('reports/generate/', ReportGenerateAPIView.as_view(), name='report-generate'),
    path('readings/simulate/', SimulateReadingAPIView.as_view(), name='simulate-reading'),
    path('predictions/', DriftPredictionAPIView.as_view(), name='drift-predictions'),
    
    # Model Training & Enhanced ML
    path('ml/train/', ModelTrainingAPIView.as_view(), name='model-training'),
    path('ml/anomaly/detect/', EnhancedAnomalyDetectionAPIView.as_view(), name='enhanced-anomaly-detection'),
    path('ml/drift/predict/', EnhancedDriftPredictionAPIView.as_view(), name='enhanced-drift-prediction'),
    path('ml/calibration/apply/', EnhancedCalibrationAPIView.as_view(), name='enhanced-calibration'),
    path('ml/auto-train/', AutoTrainModelsAPIView.as_view(), name='auto-train-models'),
    path('ml/analytics/', MLAnalyticsAPIView.as_view(), name='ml-analytics'),
    path('ml/calibration-schedule/', CalibrationSchedulerAPIView.as_view(), name='calibration-scheduler'),
    
    # Authentication
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/register/', UserRegistrationAPIView.as_view(), name='user-registration'),
    path('auth/profile/', UserProfileAPIView.as_view(), name='user-profile'),
    path('auth/change-password/', ChangePasswordAPIView.as_view(), name='change-password'),
    path('auth/logout/', LogoutAPIView.as_view(), name='logout'),
]
