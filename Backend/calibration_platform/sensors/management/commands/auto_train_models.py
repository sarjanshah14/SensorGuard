from django.core.management.base import BaseCommand
from sensors.services.ml_analytics import MLAnalyticsService
import time

class Command(BaseCommand):
    help = 'Automatically train ML models in the background'

    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=3600,  # 1 hour default
            help='Training interval in seconds (default: 3600)',
        )
        parser.add_argument(
            '--run-once',
            action='store_true',
            help='Run training once and exit',
        )

    def handle(self, *args, **options):
        analytics_service = MLAnalyticsService()
        interval = options['interval']
        run_once = options['run_once']
        
        self.stdout.write(
            self.style.SUCCESS(f'Starting automatic model training (interval: {interval}s)')
        )
        
        try:
            while True:
                self.stdout.write('Checking for models that need training...')
                
                # Get current statistics
                stats = analytics_service.get_ml_statistics()
                self.stdout.write(f'Current models: {stats["total_models"]} total, {stats["active_models"]} active')
                
                # Auto-train models
                results = analytics_service.auto_train_models_if_needed()
                
                if results:
                    self.stdout.write('Training results:')
                    for result in results:
                        if 'error' in result:
                            self.stdout.write(
                                self.style.ERROR(f'Error: {result["error"]}')
                            )
                        else:
                            sensor_name = result.get('sensor_name', 'Unknown')
                            model_type = result.get('model_type', 'Unknown')
                            training_result = result.get('result', {})
                            
                            if training_result.get('status') == 'success':
                                self.stdout.write(
                                    self.style.SUCCESS(f'{sensor_name} - {model_type}: {training_result.get("message", "Trained successfully")}')
                                )
                            else:
                                self.stdout.write(
                                    self.style.WARNING(f'{sensor_name} - {model_type}: {training_result.get("message", "Training failed")}')
                                )
                else:
                    self.stdout.write('No models need training at this time.')
                
                if run_once:
                    break
                
                self.stdout.write(f'Waiting {interval} seconds until next training cycle...')
                time.sleep(interval)
                
        except KeyboardInterrupt:
            self.stdout.write(
                self.style.SUCCESS('\nAutomatic training stopped by user.')
            )
        except Exception as e:
            self.stdout.write(
                self.style.ERROR(f'Error in automatic training: {e}')
            )
