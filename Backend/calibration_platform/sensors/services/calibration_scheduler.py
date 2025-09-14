from datetime import datetime, timedelta
from sensors.models import Sensor, Reading, Calibration
import numpy as np

class CalibrationScheduler:
    def __init__(self):
        pass
    
    def predict_calibration_schedule(self, sensor_id, drift_predictions):
        """
        Predict when calibration will be needed based on drift predictions
        """
        try:
            sensor = Sensor.objects.get(id=sensor_id)
            
            # Get recent calibration history
            recent_calibrations = Calibration.objects.filter(
                sensor=sensor
            ).order_by('-applied_at')[:5]
            
            # Calculate calibration frequency
            if recent_calibrations.count() > 1:
                time_diffs = []
                for i in range(1, recent_calibrations.count()):
                    diff = recent_calibrations[i-1].applied_at - recent_calibrations[i].applied_at
                    time_diffs.append(diff.total_seconds() / (24 * 60 * 60))  # Convert to days
                
                avg_calibration_interval = np.mean(time_diffs) if time_diffs else 30
            else:
                avg_calibration_interval = 30  # Default 30 days
            
            # Predict calibration dates based on drift predictions
            calibration_schedule = []
            current_date = datetime.now()
            
            for i, drift in enumerate(drift_predictions):
                days_from_now = (i + 1) * 2  # Assuming 2-day intervals
                prediction_date = current_date + timedelta(days=days_from_now)
                
                # Determine if calibration is needed
                if abs(drift) > 5:  # High drift threshold
                    priority = 'High' if abs(drift) > 10 else 'Medium'
                    
                    # Calculate optimal calibration date
                    if abs(drift) > 10:
                        # Urgent calibration needed
                        calibration_date = current_date + timedelta(days=max(1, days_from_now - 1))
                    else:
                        # Schedule within normal interval
                        calibration_date = prediction_date
                    
                    calibration_schedule.append({
                        'date': calibration_date.isoformat(),
                        'reason': f'Predicted drift: {drift:.1f}%',
                        'priority': priority,
                        'drift_value': drift,
                        'days_from_now': days_from_now,
                        'confidence': self._calculate_calibration_confidence(drift, sensor)
                    })
            
            # Add regular maintenance calibration if no urgent ones
            if not calibration_schedule:
                next_maintenance = current_date + timedelta(days=avg_calibration_interval)
                calibration_schedule.append({
                    'date': next_maintenance.isoformat(),
                    'reason': 'Regular maintenance calibration',
                    'priority': 'Low',
                    'drift_value': 0,
                    'days_from_now': avg_calibration_interval,
                    'confidence': 0.8
                })
            
            return {
                'sensor_name': sensor.name,
                'sensor_id': sensor_id,
                'calibration_schedule': calibration_schedule,
                'avg_interval_days': avg_calibration_interval,
                'last_calibration': recent_calibrations.first().applied_at.isoformat() if recent_calibrations.exists() else None,
                'total_calibrations': recent_calibrations.count()
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'sensor_id': sensor_id,
                'calibration_schedule': []
            }
    
    def _calculate_calibration_confidence(self, drift_value, sensor):
        """
        Calculate confidence in calibration recommendation
        """
        # Base confidence on drift magnitude and sensor type
        base_confidence = 0.7
        
        # Increase confidence for higher drift values
        drift_factor = min(abs(drift_value) / 20, 1.0)  # Max at 20% drift
        
        # Sensor type factors
        sensor_factors = {
            'Temperature': 0.9,
            'Pressure': 0.85,
            'Humidity': 0.8,
            'Vibration': 0.75,
            'Flow': 0.8
        }
        
        sensor_factor = sensor_factors.get(sensor.type, 0.8)
        
        # Calculate final confidence
        confidence = base_confidence + (drift_factor * 0.2) * sensor_factor
        
        return min(confidence, 0.95)  # Cap at 95%
    
    def get_calibration_recommendations(self, sensor_id):
        """
        Get comprehensive calibration recommendations for a sensor
        """
        try:
            sensor = Sensor.objects.get(id=sensor_id)
            
            # Get recent readings
            recent_readings = Reading.objects.filter(
                sensor=sensor,
                timestamp__gte=datetime.now() - timedelta(days=7)
            ).order_by('-timestamp')
            
            if recent_readings.count() < 5:
                return {
                    'status': 'insufficient_data',
                    'message': 'Not enough recent data for recommendations',
                    'sensor_id': sensor_id
                }
            
            # Calculate current drift
            values = [r.raw_value for r in recent_readings]
            baseline = sensor.value or np.mean(values[:3])
            current_drift = ((values[0] - baseline) / baseline * 100) if baseline != 0 else 0
            
            # Get drift trend
            if len(values) >= 3:
                recent_trend = np.polyfit(range(len(values[:5])), values[:5], 1)[0]
                trend_direction = 'increasing' if recent_trend > 0 else 'decreasing'
            else:
                trend_direction = 'stable'
            
            # Generate recommendations
            recommendations = []
            
            if abs(current_drift) > 10:
                recommendations.append({
                    'type': 'urgent',
                    'title': 'Immediate Calibration Required',
                    'description': f'Current drift is {current_drift:.1f}%, exceeding critical threshold',
                    'priority': 'High',
                    'action': 'Schedule calibration within 24 hours'
                })
            elif abs(current_drift) > 5:
                recommendations.append({
                    'type': 'recommended',
                    'title': 'Calibration Recommended',
                    'description': f'Current drift is {current_drift:.1f}%, approaching threshold',
                    'priority': 'Medium',
                    'action': 'Schedule calibration within 1 week'
                })
            
            if trend_direction == 'increasing' and abs(current_drift) > 2:
                recommendations.append({
                    'type': 'trend',
                    'title': 'Drift Trend Warning',
                    'description': 'Drift is increasing, monitor closely',
                    'priority': 'Medium',
                    'action': 'Increase monitoring frequency'
                })
            
            return {
                'sensor_name': sensor.name,
                'sensor_id': sensor_id,
                'current_drift': current_drift,
                'trend_direction': trend_direction,
                'recommendations': recommendations,
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            return {
                'error': str(e),
                'sensor_id': sensor_id
            }
