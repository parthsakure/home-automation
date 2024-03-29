# Generated by Django 4.1.5 on 2023-02-01 12:54

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('rooms', '0004_alter_home_id_alter_home_requests_alter_light_id_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='Device',
            fields=[
                ('name', models.CharField(max_length=200)),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('password', models.CharField(default=uuid.uuid4, max_length=500)),
                ('rooms', models.ManyToManyField(to='rooms.room')),
                ('user', models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
