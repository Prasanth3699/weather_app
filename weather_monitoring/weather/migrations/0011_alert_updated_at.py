# Generated by Django 5.1.2 on 2024-10-20 12:36

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("weather", "0010_alert_is_active"),
    ]

    operations = [
        migrations.AddField(
            model_name="alert",
            name="updated_at",
            field=models.DateTimeField(auto_now=True),
        ),
    ]
