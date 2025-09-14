import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.linear_model import LinearRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, classification_report
import joblib
import os
from django.conf import settings
from sensors.models import Sensor, Reading, Anomaly, Calibration
from datetime import datetime, timedelta

class ModelTrainer:
    def __init__(self):
        self.models_dir = os.path.join(settings.BASE_DIR, 'trained_models')
        os.makedirs(self.models_dir, exist_ok=True)
    
    def train_anomaly_detection_model(self, sensor_id=None):
        """
        Train Isolation Forest model for anomaly detection
        """
        try:
            # Get training data
            if sensor_id:
                readings = Reading.objects.filter(sensor_id=sensor_id).order_by('timestamp')
                sensor_name = Sensor.objects.get(id=sensor_id).name
            else:
                # Train on all sensors
                readings = Reading.objects.all().order_by('timestamp')
                sensor_name = "all_sensors"
            
            if len(readings) < 10:
                return {"status": "error", "message": "Not enough data for training (need at least 10 readings)"}
            
            # Prepare features
            values = np.array([r.raw_value for r in readings]).reshape(-1, 1)
            
            # Add time-based features
            timestamps = [r.timestamp for r in readings]
            time_features = []
            for i, ts in enumerate(timestamps):
                # Hour of day, day of week, etc.
                hour = ts.hour
                day_of_week = ts.weekday()
                time_features.append([hour, day_of_week])
            
            time_features = np.array(time_features)
            
            # Combine value and time features
            X = np.hstack([values, time_features])
            
            # Train model
            model = IsolationForest(
                contamination=0.1,  # 10% of data expected to be anomalies
                random_state=42,
                n_estimators=100
            )
            
            model.fit(X)
            
            # Save model
            model_path = os.path.join(self.models_dir, f'anomaly_model_{sensor_name}_{sensor_id or "all"}.joblib')
            joblib.dump(model, model_path)
            
            # Test model on existing data
            predictions = model.predict(X)
            anomaly_count = np.sum(predictions == -1)
            
            return {
                "status": "success",
                "message": f"Anomaly detection model trained successfully",
                "model_path": model_path,
                "training_samples": len(readings),
                "detected_anomalies": int(anomaly_count),
                "sensor_id": sensor_id,
                "sensor_name": sensor_name
            }
            
        except Exception as e:
            return {"status": "error", "message": f"Training failed: {str(e)}"}
    
    def train_drift_prediction_model(self, sensor_id):
        """
        Train drift prediction model using time series data
        """
        try:
            sensor = Sensor.objects.get(id=sensor_id)
            readings = Reading.objects.filter(sensor=sensor).order_by('timestamp')
            
            if len(readings) < 20:
                return {"status": "error", "message": "Not enough data for drift prediction (need at least 20 readings)"}
            
            # Prepare time series data
            values = np.array([r.raw_value for r in readings])
            timestamps = np.array([r.timestamp for r in readings])
            
            # Calculate drift over time
            baseline = sensor.value or np.mean(values[:5])  # Use first 5 readings as baseline
            drift_values = ((values - baseline) / baseline * 100) if baseline != 0 else values
            
            # Create features: rolling mean, rolling std, time since start
            window_size = min(5, len(values) // 4)
            rolling_mean = pd.Series(values).rolling(window=window_size).mean().fillna(values[0])
            rolling_std = pd.Series(values).rolling(window=window_size).std().fillna(0)
            
            # Time features
            time_since_start = [(ts - timestamps[0]).total_seconds() / 3600 for ts in timestamps]  # hours
            
            # Prepare training data
            X = np.column_stack([
                values[:-1],  # Previous value
                rolling_mean[:-1],  # Rolling mean
                rolling_std[:-1],  # Rolling std
                time_since_start[:-1]  # Time feature
            ])
            
            y = drift_values[1:]  # Next drift value
            
            if len(X) < 10:
                return {"status": "error", "message": "Not enough data for training"}
            
            # Train model
            model = LinearRegression()
            model.fit(X, y)
            
            # Evaluate model
            y_pred = model.predict(X)
            mse = mean_squared_error(y, y_pred)
            
            # Save model
            model_path = os.path.join(self.models_dir, f'drift_model_{sensor.name}_{sensor_id}.joblib')
            joblib.dump(model, model_path)
            
            return {
                "status": "success",
                "message": f"Drift prediction model trained successfully",
                "model_path": model_path,
                "training_samples": len(X),
                "mse": float(mse),
                "sensor_id": sensor_id,
                "sensor_name": sensor.name
            }
            
        except Exception as e:
            return {"status": "error", "message": f"Training failed: {str(e)}"}
    
    def train_calibration_model(self, sensor_id):
        """
        Train adaptive calibration model
        """
        try:
            sensor = Sensor.objects.get(id=sensor_id)
            calibrations = Calibration.objects.filter(sensor=sensor).order_by('applied_at')
            
            if len(calibrations) < 5:
                return {"status": "error", "message": "Not enough calibration data (need at least 5 calibrations)"}
            
            # Get readings around calibration times
            calibration_data = []
            for cal in calibrations:
                # Get readings before and after calibration
                readings_before = Reading.objects.filter(
                    sensor=sensor,
                    timestamp__lt=cal.applied_at
                ).order_by('-timestamp')[:3]
                
                if readings_before:
                    raw_values = [r.raw_value for r in readings_before]
                    avg_raw = np.mean(raw_values)
                    
                    calibration_data.append({
                        'raw_value': avg_raw,
                        'corrected_value': cal.corrected_value,
                        'method': cal.method,
                        'timestamp': cal.applied_at
                    })
            
            if len(calibration_data) < 3:
                return {"status": "error", "message": "Not enough calibration data with readings"}
            
            # Prepare training data
            X = np.array([[cd['raw_value']] for cd in calibration_data])
            y = np.array([cd['corrected_value'] for cd in calibration_data])
            
            # Train model
            model = LinearRegression()
            model.fit(X, y)
            
            # Evaluate model
            y_pred = model.predict(X)
            mse = mean_squared_error(y, y_pred)
            
            # Save model
            model_path = os.path.join(self.models_dir, f'calibration_model_{sensor.name}_{sensor_id}.joblib')
            joblib.dump(model, model_path)
            
            return {
                "status": "success",
                "message": f"Calibration model trained successfully",
                "model_path": model_path,
                "training_samples": len(calibration_data),
                "mse": float(mse),
                "sensor_id": sensor_id,
                "sensor_name": sensor.name
            }
            
        except Exception as e:
            return {"status": "error", "message": f"Training failed: {str(e)}"}
    
    def train_all_models(self, sensor_id=None):
        """
        Train all models for a sensor or all sensors
        """
        results = {}
        
        if sensor_id:
            sensors = [Sensor.objects.get(id=sensor_id)]
        else:
            sensors = Sensor.objects.all()
        
        for sensor in sensors:
            sensor_results = {}
            
            # Train anomaly detection
            anomaly_result = self.train_anomaly_detection_model(sensor.id)
            sensor_results['anomaly_detection'] = anomaly_result
            
            # Train drift prediction
            drift_result = self.train_drift_prediction_model(sensor.id)
            sensor_results['drift_prediction'] = drift_result
            
            # Train calibration model
            calibration_result = self.train_calibration_model(sensor.id)
            sensor_results['calibration'] = calibration_result
            
            results[sensor.name] = sensor_results
        
        return results
    
    def get_model_info(self):
        """
        Get information about trained models
        """
        models_info = []
        
        for filename in os.listdir(self.models_dir):
            if filename.endswith('.joblib'):
                model_path = os.path.join(self.models_dir, filename)
                model = joblib.load(model_path)
                
                model_info = {
                    'filename': filename,
                    'model_type': filename.split('_')[0],
                    'sensor_name': filename.split('_')[2] if len(filename.split('_')) > 2 else 'unknown',
                    'created_at': datetime.fromtimestamp(os.path.getctime(model_path)),
                    'size_kb': round(os.path.getsize(model_path) / 1024, 2)
                }
                
                models_info.append(model_info)
        
        return models_info
