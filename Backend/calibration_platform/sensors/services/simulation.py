import random
from datetime import datetime
from sensors.models import Sensor, Reading

def generate_sensor_reading(sensor_id):
    """
    Generates a simulated reading for a given sensor.
    """
    try:
        sensor = Sensor.objects.get(id=sensor_id)
    except Sensor.DoesNotExist:
        return None

    # Simulate reading around sensor.value ± some noise
    base_value = sensor.value or 50  # Default to 50 if no baseline value
    noise = random.uniform(-5, 5)
    simulated_value = base_value + noise

    reading = Reading.objects.create(sensor=sensor, raw_value=simulated_value, timestamp=datetime.now())
    return reading
