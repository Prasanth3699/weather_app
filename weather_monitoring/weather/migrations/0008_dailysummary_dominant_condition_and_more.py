# Generated by Django 5.1.2 on 2024-10-19 09:10

from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("weather", "0007_rename_average_temp_dailysummary_avg_humidity_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="dailysummary",
            name="dominant_condition",
            field=models.CharField(default="Unknown", max_length=50),
        ),
        migrations.AddField(
            model_name="dailysummary",
            name="dominant_reasoning",
            field=models.CharField(default="", max_length=255),
        ),
    ]
