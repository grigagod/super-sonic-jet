# Generated by Django 2.2.10 on 2020-05-28 17:41

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0002_itemvariation_variation'),
    ]

    operations = [
        migrations.AlterField(
            model_name='itemvariation',
            name='attachment',
            field=models.ImageField(blank=True, upload_to=''),
        ),
    ]
