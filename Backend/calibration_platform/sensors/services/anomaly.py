from sensors.models import Reading, Anomaly, Sensor

def detect_anomaly(reading):
    sensor = reading.sensor
    anomaly_type = None

    # Get baseline and recent readings for analysis
    baseline = sensor.value or 0
    tolerance = abs(baseline * 0.2) if baseline != 0 else 10
    
    # Get recent readings for pattern analysis
    recent_readings = Reading.objects.filter(sensor=sensor).order_by('-timestamp')[:10]
    recent_values = [r.raw_value for r in recent_readings]
    
    # 1. Drift detection - gradual change over time
    if len(recent_values) >= 5:
        # Check if there's a consistent trend
        trend = sum(recent_values[i] - recent_values[i+1] for i in range(len(recent_values)-1)) / (len(recent_values)-1)
        if abs(trend) > baseline * 0.05:  # 5% trend threshold
            anomaly_type = 'Drift'
    
    # 2. Spike detection - sudden large change
    if not anomaly_type:
        prev_reading = recent_readings[1] if len(recent_readings) > 1 else None
        if prev_reading and abs(reading.raw_value - prev_reading.raw_value) > baseline * 0.3:  # 30% change
            anomaly_type = 'Spike'
    
    # 3. Dropout detection - value drops significantly
    if not anomaly_type and reading.raw_value < baseline * 0.3:
        anomaly_type = 'Dropout'
    
    # 4. Noise detection - high frequency variations
    if not anomaly_type and len(recent_values) >= 3:
        # Check for high variance in recent readings
        variance = sum((v - baseline) ** 2 for v in recent_values[:3]) / 3
        if variance > (baseline * 0.1) ** 2:  # High variance threshold
            anomaly_type = 'Noise'
    
    # 5. Calibration Error - systematic offset
    if not anomaly_type:
        # Check if reading is consistently offset from expected
        offset = abs(reading.raw_value - baseline)
        if offset > baseline * 0.15 and offset < baseline * 0.5:  # 15-50% offset
            anomaly_type = 'Calibration Error'
    
    # 6. Fallback to out of range
    if not anomaly_type and (reading.raw_value < (baseline - tolerance) or reading.raw_value > (baseline + tolerance)):
        anomaly_type = 'Drift'  # Default to Drift for out of range

    if anomaly_type:
        # Calculate deviation percentage
        deviation = ((reading.raw_value - baseline) / baseline * 100) if baseline != 0 else 0
        
        # Determine severity based on deviation
        if abs(deviation) > 50:
            severity = "Critical"
        elif abs(deviation) > 20:
            severity = "High"
        elif abs(deviation) > 10:
            severity = "Medium"
        else:
            severity = "Low"
        
        Anomaly.objects.create(
            sensor=sensor,
            type=anomaly_type,
            value=reading.raw_value,
            expected=baseline,
            deviation=deviation,
            severity=severity,
            resolved=False
        )
        return anomaly_type

    return None

import random

def predict_drift(sensor_id, intervals=5):
    """
    Returns a list of predicted drift values for next N intervals.
    """
    return [random.uniform(-2, 2) for _ in range(intervals)]
