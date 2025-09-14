import numpy as np
from sklearn.ensemble import IsolationForest
from sensors.models import Reading, Sensor, Anomaly

def ml_anomaly_detection(sensor_id):
    sensor = Sensor.objects.get(id=sensor_id)
    readings = Reading.objects.filter(sensor=sensor).order_by('timestamp')
    values = np.array([r.raw_value for r in readings]).reshape(-1, 1)
    
    if len(values) < 5:
        return []  # Not enough data

    clf = IsolationForest(contamination=0.1, random_state=42)
    clf.fit(values)
    predictions = clf.predict(values)  # -1 = anomaly, 1 = normal

    anomalies = []
    for i, r in enumerate(readings):
        if predictions[i] == -1:
            # Calculate deviation from expected value
            expected = sensor.value or 0
            deviation = ((r.raw_value - expected) / expected * 100) if expected != 0 else 0
            severity = "High" if abs(deviation) > 15 else "Medium"
            
            # Determine anomaly type based on pattern
            anomaly_type = "Drift"  # Default
            if abs(deviation) > 50:
                anomaly_type = "Spike"
            elif r.raw_value < expected * 0.3:
                anomaly_type = "Dropout"
            elif abs(deviation) > 20 and abs(deviation) < 50:
                anomaly_type = "Noise"
            elif abs(deviation) > 10 and abs(deviation) < 20:
                anomaly_type = "Calibration Error"
            
            anomaly = Anomaly.objects.create(
                sensor=sensor,
                type=anomaly_type,
                value=r.raw_value,
                expected=expected,
                deviation=deviation,
                severity=severity,
                resolved=False
            )
            anomalies.append(anomaly)
    return anomalies
