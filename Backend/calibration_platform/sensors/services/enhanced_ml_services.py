import numpy as np
import pandas as pd
import joblib
import os
from django.conf import settings
from sensors.models import Sensor, Reading, Anomaly, Calibration
from .model_training import ModelTrainer

class EnhancedMLServices:
    def __init__(self):
        self.models_dir = os.path.join(settings.BASE_DIR, 'trained_models')
        self.trainer = ModelTrainer()
    
    def predict_anomaly_with_trained_model(self, sensor_id, reading_value, timestamp=None):
        """
        Use trained anomaly detection model to predict if a reading is anomalous
        """
        try:
            sensor = Sensor.objects.get(id=sensor_id)
            model_path = os.path.join(self.models_dir, f'anomaly_model_{sensor.name}_{sensor_id}.joblib')
            
            if not os.path.exists(model_path):
                # Fallback to basic detection if no trained model
                return self._basic_anomaly_detection(sensor, reading_value)
            
            # Load trained model
            model = joblib.load(model_path)
            
            # Prepare features
            if timestamp is None:
                from django.utils import timezone
                timestamp = timezone.now()
            
            # Create feature vector: [value, hour, day_of_week]
            features = np.array([[
                reading_value,
                timestamp.hour,
                timestamp.weekday()
            ]])
            
            # Predict
            prediction = model.predict(features)[0]
            anomaly_score = model.decision_function(features)[0]
            
            is_anomaly = prediction == -1
            confidence = abs(anomaly_score)
            
            return {
                'is_anomaly': is_anomaly,
                'confidence': float(confidence),
                'anomaly_score': float(anomaly_score),
                'model_used': 'trained_isolation_forest'
            }
            
        except Exception as e:
            # Fallback to basic detection
            return self._basic_anomaly_detection(sensor, reading_value)
    
    def _basic_anomaly_detection(self, sensor, reading_value):
        """
        Basic anomaly detection as fallback
        """
        baseline = sensor.value or 0
        tolerance = abs(baseline * 0.2) if baseline != 0 else 10
        
        is_anomaly = reading_value < (baseline - tolerance) or reading_value > (baseline + tolerance)
        deviation = ((reading_value - baseline) / baseline * 100) if baseline != 0 else 0
        
        return {
            'is_anomaly': is_anomaly,
            'confidence': abs(deviation) / 10,  # Simple confidence based on deviation
            'anomaly_score': deviation,
            'model_used': 'basic_threshold'
        }
    
    def predict_drift_with_trained_model(self, sensor_id, future_points=5):
        """
        Use trained drift prediction model to predict future drift
        """
        try:
            sensor = Sensor.objects.get(id=sensor_id)
            model_path = os.path.join(self.models_dir, f'drift_model_{sensor.name}_{sensor_id}.joblib')
            
            if not os.path.exists(model_path):
                # Fallback to simple prediction
                return self._simple_drift_prediction(sensor_id, future_points)
            
            # Load trained model
            model = joblib.load(model_path)
            
            # Get recent readings
            recent_readings = Reading.objects.filter(sensor=sensor).order_by('-timestamp')[:10]
            
            if len(recent_readings) < 3:
                return self._simple_drift_prediction(sensor_id, future_points)
            
            # Prepare features for prediction
            values = [r.raw_value for r in recent_readings]
            timestamps = [r.timestamp for r in recent_readings]
            
            # Calculate features
            baseline = sensor.value or np.mean(values[:3])
            rolling_mean = np.mean(values[:5])
            rolling_std = np.std(values[:5])
            time_since_start = (timestamps[0] - timestamps[-1]).total_seconds() / 3600
            
            # Predict future drift
            predictions = []
            current_features = np.array([[
                values[0],  # Current value
                rolling_mean,
                rolling_std,
                time_since_start
            ]])
            
            for i in range(future_points):
                drift_pred = model.predict(current_features)[0]
                predictions.append(float(drift_pred))
                
                # Update features for next prediction (simplified)
                current_features[0][0] += drift_pred * baseline / 100  # Update value
                current_features[0][3] += 1  # Update time
            
            return {
                'predictions': predictions,
                'model_used': 'trained_linear_regression',
                'confidence': 0.8  # Could be calculated from model performance
            }
            
        except Exception as e:
            return self._simple_drift_prediction(sensor_id, future_points)
    
    def _simple_drift_prediction(self, sensor_id, future_points=5):
        """
        Simple drift prediction as fallback
        """
        sensor = Sensor.objects.get(id=sensor_id)
        readings = Reading.objects.filter(sensor=sensor).order_by('timestamp')
        values = np.array([r.raw_value for r in readings])
        
        if len(values) < 3:
            return {'predictions': [0] * future_points, 'model_used': 'no_data'}
        
        # Linear trend
        x = np.arange(len(values))
        coef = np.polyfit(x, values, 1)
        slope = coef[0]
        last_value = values[-1]
        
        baseline = sensor.value or last_value
        predictions = []
        
        for i in range(future_points):
            predicted_value = last_value + slope * (i + 1)
            drift = ((predicted_value - baseline) / baseline * 100) if baseline != 0 else 0
            predictions.append(float(drift))
        
        return {
            'predictions': predictions,
            'model_used': 'simple_linear_trend'
        }
    
    def apply_adaptive_calibration_with_trained_model(self, sensor_id, raw_value):
        """
        Use trained calibration model to correct sensor readings
        """
        try:
            sensor = Sensor.objects.get(id=sensor_id)
            model_path = os.path.join(self.models_dir, f'calibration_model_{sensor.name}_{sensor_id}.joblib')
            
            if not os.path.exists(model_path):
                # Fallback to basic calibration
                return self._basic_calibration(sensor_id, raw_value)
            
            # Load trained model
            model = joblib.load(model_path)
            
            # Predict corrected value
            corrected_value = model.predict(np.array([[raw_value]]))[0]
            
            return {
                'corrected_value': float(corrected_value),
                'correction_factor': float(corrected_value - raw_value),
                'model_used': 'trained_linear_regression'
            }
            
        except Exception as e:
            return self._basic_calibration(sensor_id, raw_value)
    
    def _basic_calibration(self, sensor_id, raw_value):
        """
        Basic calibration as fallback
        """
        sensor = Sensor.objects.get(id=sensor_id)
        baseline = sensor.value or raw_value
        
        # Simple linear correction
        correction_factor = (baseline - raw_value) * 0.1  # 10% correction
        corrected_value = raw_value + correction_factor
        
        return {
            'corrected_value': float(corrected_value),
            'correction_factor': float(correction_factor),
            'model_used': 'basic_linear'
        }
    
    def auto_train_models_if_needed(self, sensor_id):
        """
        Automatically retrain models if they're outdated or don't exist
        """
        sensor = Sensor.objects.get(id=sensor_id)
        
        # Check if models exist and are recent
        model_files = [
            f'anomaly_model_{sensor.name}_{sensor_id}.joblib',
            f'drift_model_{sensor.name}_{sensor_id}.joblib',
            f'calibration_model_{sensor.name}_{sensor_id}.joblib'
        ]
        
        needs_training = []
        
        for model_file in model_files:
            model_path = os.path.join(self.models_dir, model_file)
            
            if not os.path.exists(model_path):
                needs_training.append(model_file.split('_')[0])
            else:
                # Check if model is older than 7 days
                from datetime import datetime, timedelta
                model_age = datetime.now() - datetime.fromtimestamp(os.path.getctime(model_path))
                if model_age > timedelta(days=7):
                    needs_training.append(model_file.split('_')[0])
        
        # Train needed models
        results = {}
        if 'anomaly' in needs_training:
            results['anomaly'] = self.trainer.train_anomaly_detection_model(sensor_id)
        if 'drift' in needs_training:
            results['drift'] = self.trainer.train_drift_prediction_model(sensor_id)
        if 'calibration' in needs_training:
            results['calibration'] = self.trainer.train_calibration_model(sensor_id)
        
        return results
