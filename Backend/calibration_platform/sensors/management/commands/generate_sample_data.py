from django.core.management.base import BaseCommand
from sensors.models import Sensor, Reading, Calibration, Anomaly
from django.utils import timezone
import random
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Generate sample data for training AI/ML models'

    def add_arguments(self, parser):
        parser.add_argument(
            '--sensor-id',
            type=int,
            help='Generate data for specific sensor ID',
        )
        parser.add_argument(
            '--readings-count',
            type=int,
            default=100,
            help='Number of readings to generate',
        )
        parser.add_argument(
            '--calibrations-count',
            type=int,
            default=10,
            help='Number of calibrations to generate',
        )

    def handle(self, *args, **options):
        sensor_id = options['sensor_id']
        readings_count = options['readings_count']
        calibrations_count = options['calibrations_count']
        
        if sensor_id:
            try:
                sensor = Sensor.objects.get(id=sensor_id)
                self.generate_data_for_sensor(sensor, readings_count, calibrations_count)
            except Sensor.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Sensor with ID {sensor_id} not found')
                )
        else:
            # Generate data for all sensors
            sensors = Sensor.objects.all()
            if not sensors.exists():
                self.stdout.write(
                    self.style.ERROR('No sensors found. Please create sensors first.')
                )
                return
            
            for sensor in sensors:
                self.generate_data_for_sensor(sensor, readings_count, calibrations_count)
    
    def generate_data_for_sensor(self, sensor, readings_count, calibrations_count):
        self.stdout.write(f'Generating data for sensor: {sensor.name}')
        
        # Generate readings with some realistic patterns
        base_value = sensor.value or 50.0
        current_time = timezone.now() - timedelta(days=30)  # Start 30 days ago
        
        readings_created = 0
        calibrations_created = 0
        
        for i in range(readings_count):
            # Add some realistic variation
            if sensor.type == 'Temperature':
                # Temperature varies with time of day
                hour = current_time.hour
                daily_variation = 5 * np.sin(2 * np.pi * hour / 24)
                noise = random.uniform(-2, 2)
                value = base_value + daily_variation + noise
            elif sensor.type == 'Pressure':
                # Pressure has less variation
                noise = random.uniform(-1, 1)
                value = base_value + noise
            elif sensor.type == 'Humidity':
                # Humidity varies more
                noise = random.uniform(-5, 5)
                value = max(0, min(100, base_value + noise))
            else:
                # Default variation
                noise = random.uniform(-3, 3)
                value = base_value + noise
            
            # Occasionally add anomalies
            if random.random() < 0.05:  # 5% chance of anomaly
                value += random.uniform(-20, 20)
            
            # Create reading
            Reading.objects.create(
                sensor=sensor,
                raw_value=round(value, 2),
                timestamp=current_time
            )
            readings_created += 1
            
            # Move time forward
            current_time += timedelta(minutes=random.randint(10, 60))
        
        # Generate calibrations
        calibration_times = []
        for i in range(calibrations_count):
            # Random time in the past 30 days
            cal_time = timezone.now() - timedelta(
                days=random.randint(1, 30),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            calibration_times.append(cal_time)
        
        calibration_times.sort()
        
        for i, cal_time in enumerate(calibration_times):
            # Get a reading near this time
            nearby_reading = Reading.objects.filter(
                sensor=sensor,
                timestamp__gte=cal_time - timedelta(hours=1),
                timestamp__lte=cal_time + timedelta(hours=1)
            ).first()
            
            if nearby_reading:
                # Create calibration with some correction
                correction = random.uniform(-2, 2)
                corrected_value = nearby_reading.raw_value + correction
                
                Calibration.objects.create(
                    sensor=sensor,
                    method=random.choice(['linear', 'polynomial', 'custom']),
                    params={'correction_factor': correction},
                    corrected_value=round(corrected_value, 2),
                    applied_at=cal_time
                )
                calibrations_created += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Created {readings_created} readings and {calibrations_created} calibrations'
            )
        )

# Add numpy import at the top
import numpy as np
