from django.core.management.base import BaseCommand
from sensors.services.model_training import ModelTrainer
from sensors.models import Sensor

class Command(BaseCommand):
    help = 'Train AI/ML models for sensor data'

    def add_arguments(self, parser):
        parser.add_argument(
            '--sensor-id',
            type=int,
            help='Train models for specific sensor ID',
        )
        parser.add_argument(
            '--model-type',
            type=str,
            choices=['anomaly', 'drift', 'calibration', 'all'],
            default='all',
            help='Type of model to train',
        )
        parser.add_argument(
            '--all-sensors',
            action='store_true',
            help='Train models for all sensors',
        )

    def handle(self, *args, **options):
        trainer = ModelTrainer()
        
        if options['all_sensors']:
            self.stdout.write('Training models for all sensors...')
            results = trainer.train_all_models()
            
            for sensor_name, sensor_results in results.items():
                self.stdout.write(f'\n=== {sensor_name} ===')
                for model_type, result in sensor_results.items():
                    if result['status'] == 'success':
                        self.stdout.write(
                            self.style.SUCCESS(f'{model_type}: {result["message"]}')
                        )
                    else:
                        self.stdout.write(
                            self.style.ERROR(f'{model_type}: {result["message"]}')
                        )
        
        elif options['sensor_id']:
            sensor_id = options['sensor_id']
            model_type = options['model_type']
            
            try:
                sensor = Sensor.objects.get(id=sensor_id)
                self.stdout.write(f'Training {model_type} model for sensor: {sensor.name}')
                
                if model_type == 'all':
                    results = trainer.train_all_models(sensor_id)
                    for model_type, result in results[sensor.name].items():
                        if result['status'] == 'success':
                            self.stdout.write(
                                self.style.SUCCESS(f'{model_type}: {result["message"]}')
                            )
                        else:
                            self.stdout.write(
                                self.style.ERROR(f'{model_type}: {result["message"]}')
                            )
                else:
                    if model_type == 'anomaly':
                        result = trainer.train_anomaly_detection_model(sensor_id)
                    elif model_type == 'drift':
                        result = trainer.train_drift_prediction_model(sensor_id)
                    elif model_type == 'calibration':
                        result = trainer.train_calibration_model(sensor_id)
                    
                    if result['status'] == 'success':
                        self.stdout.write(
                            self.style.SUCCESS(f'{model_type}: {result["message"]}')
                        )
                    else:
                        self.stdout.write(
                            self.style.ERROR(f'{model_type}: {result["message"]}')
                        )
                        
            except Sensor.DoesNotExist:
                self.stdout.write(
                    self.style.ERROR(f'Sensor with ID {sensor_id} not found')
                )
        
        else:
            self.stdout.write(
                self.style.ERROR('Please specify --sensor-id or --all-sensors')
            )
        
        # Show model info
        self.stdout.write('\n=== Trained Models ===')
        models_info = trainer.get_model_info()
        if models_info:
            for model in models_info:
                self.stdout.write(
                    f'{model["model_type"]} - {model["sensor_name"]} '
                    f'({model["size_kb"]}KB, {model["created_at"]})'
                )
        else:
            self.stdout.write('No trained models found')
