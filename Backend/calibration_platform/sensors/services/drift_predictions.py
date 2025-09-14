import numpy as np
from sensors.models import Reading, Sensor

def simple_drift_prediction(sensor_id, future_points=5):
    sensor = Sensor.objects.get(id=sensor_id)
    readings = Reading.objects.filter(sensor=sensor).order_by('timestamp')
    values = np.array([r.raw_value for r in readings])
    
    if len(values) < 3:
        # Not enough data, return zeros
        return [0]*future_points

    # Linear trend
    x = np.arange(len(values))
    coef = np.polyfit(x, values, 1)  # slope, intercept
    slope = coef[0]
    last_value = values[-1]
    predictions = [last_value + slope*(i+1) for i in range(future_points)]
    return predictions
