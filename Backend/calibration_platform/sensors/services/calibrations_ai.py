import numpy as np
from sklearn.linear_model import LinearRegression
from sensors.models import Calibration, Reading, Sensor

def adaptive_calibration(sensor_id, new_reading_value):
    """
    Applies adaptive calibration using past readings and corrections.
    Returns corrected value.
    """
    sensor = Sensor.objects.get(id=sensor_id)
    # Get past calibration data
    past_calibrations = Calibration.objects.filter(sensor=sensor)
    
    if past_calibrations.count() < 2:
        # Not enough data, apply default correction
        corrected_value = new_reading_value  # or some basic linear offset
    else:
        X = np.array([c.corrected_value for c in past_calibrations]).reshape(-1, 1)
        y = np.array([c.corrected_value for c in past_calibrations])
        model = LinearRegression().fit(X, y)
        corrected_value = model.predict(np.array([[new_reading_value]]))[0]
    
    return corrected_value
