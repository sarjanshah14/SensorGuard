from django.core.management.base import BaseCommand
from sensors.models import Sensor, Anomaly
from django.utils import timezone
import random
from datetime import datetime, timedelta

class Command(BaseCommand):
    help = 'Generate sample anomalies with different types for testing'

    def add_arguments(self, parser):
        parser.add_argument(
            '--count',
            type=int,
            default=50,
            help='Number of anomalies to generate',
        )

    def handle(self, *args, **options):
        count = options['count']
        
        # Get all sensors
        sensors = Sensor.objects.all()
        if not sensors.exists():
            self.stdout.write(
                self.style.ERROR('No sensors found. Please create sensors first.')
            )
            return
        
        anomaly_types = ['Drift', 'Spike', 'Dropout', 'Noise', 'Calibration Error']
        severities = ['Low', 'Medium', 'High', 'Critical']
        
        anomalies_created = 0
        
        for i in range(count):
            # Random sensor
            sensor = random.choice(sensors)
            
            # Random anomaly type
            anomaly_type = random.choice(anomaly_types)
            
            # Random severity
            severity = random.choice(severities)
            
            # Generate realistic values based on sensor type
            base_value = sensor.value or 50.0
            
            if anomaly_type == 'Drift':
                # Drift: gradual change over time
                drift_factor = random.uniform(0.8, 1.2)
                value = base_value * drift_factor
                expected = base_value
                deviation = ((value - expected) / expected * 100) if expected != 0 else 0
                
            elif anomaly_type == 'Spike':
                # Spike: sudden large change
                spike_factor = random.uniform(1.5, 3.0) if random.random() > 0.5 else random.uniform(0.3, 0.7)
                value = base_value * spike_factor
                expected = base_value
                deviation = ((value - expected) / expected * 100) if expected != 0 else 0
                
            elif anomaly_type == 'Dropout':
                # Dropout: value drops to zero or very low
                value = random.uniform(0, base_value * 0.1)
                expected = base_value
                deviation = ((value - expected) / expected * 100) if expected != 0 else 0
                
            elif anomaly_type == 'Noise':
                # Noise: high frequency variations
                noise_factor = random.uniform(0.7, 1.3)
                value = base_value * noise_factor
                expected = base_value
                deviation = ((value - expected) / expected * 100) if expected != 0 else 0
                
            elif anomaly_type == 'Calibration Error':
                # Calibration Error: systematic offset
                offset = random.uniform(-base_value * 0.2, base_value * 0.2)
                value = base_value + offset
                expected = base_value
                deviation = ((value - expected) / expected * 100) if expected != 0 else 0
            
            # Random timestamp in the past 30 days
            timestamp = timezone.now() - timedelta(
                days=random.randint(0, 30),
                hours=random.randint(0, 23),
                minutes=random.randint(0, 59)
            )
            
            # Create anomaly
            anomaly = Anomaly.objects.create(
                sensor=sensor,
                type=anomaly_type,
                value=round(value, 2),
                expected=round(expected, 2),
                deviation=round(deviation, 2),
                severity=severity,
                resolved=random.choice([True, False]),
                timestamp=timestamp
            )
            
            anomalies_created += 1
            
            # Update sensor name for display
            anomaly.sensor_name = sensor.name
            anomaly.save()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Created {anomalies_created} sample anomalies with different types'
            )
        )
        
        # Show summary by type
        for anomaly_type in anomaly_types:
            count_by_type = Anomaly.objects.filter(type=anomaly_type).count()
            self.stdout.write(f'  {anomaly_type}: {count_by_type} anomalies')
