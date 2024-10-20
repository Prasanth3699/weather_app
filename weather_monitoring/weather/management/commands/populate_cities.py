from django.core.management.base import BaseCommand
from weather.models import City

class Command(BaseCommand):
    help = 'Populates the database with initial cities'

    def handle(self, *args, **kwargs):
        city_names = ['Delhi', 'Mumbai', 'Chennai', 'Bangalore', 'Kolkata', 'Hyderabad']
        for name in city_names:
            City.objects.get_or_create(name=name)
        self.stdout.write(self.style.SUCCESS('Successfully populated cities.'))
