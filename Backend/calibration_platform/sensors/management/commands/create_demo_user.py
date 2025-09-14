from django.core.management.base import BaseCommand
from django.contrib.auth.models import User

class Command(BaseCommand):
    help = 'Create a demo user for testing authentication'

    def handle(self, *args, **options):
        # Create demo user if it doesn't exist
        username = 'demo'
        email = 'demo@sensorguard.com'
        password = 'password123'
        
        if User.objects.filter(username=username).exists():
            self.stdout.write(
                self.style.WARNING(f'User "{username}" already exists')
            )
        else:
            user = User.objects.create_user(
                username=username,
                email=email,
                password=password,
                first_name='Demo',
                last_name='User'
            )
            self.stdout.write(
                self.style.SUCCESS(f'Created demo user: {username}')
            )
            self.stdout.write(f'Email: {email}')
            self.stdout.write(f'Password: {password}')
        
        # Create additional test users
        test_users = [
            {
                'username': 'admin',
                'email': 'admin@sensorguard.com',
                'password': 'admin123',
                'first_name': 'Admin',
                'last_name': 'User'
            },
            {
                'username': 'testuser',
                'email': 'test@sensorguard.com',
                'password': 'test123',
                'first_name': 'Test',
                'last_name': 'User'
            }
        ]
        
        for user_data in test_users:
            if not User.objects.filter(username=user_data['username']).exists():
                User.objects.create_user(**user_data)
                self.stdout.write(
                    self.style.SUCCESS(f'Created user: {user_data["username"]}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'User "{user_data["username"]}" already exists')
                )
