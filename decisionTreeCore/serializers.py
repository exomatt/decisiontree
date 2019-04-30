from rest_framework import serializers

from decisionTreeCore.models import Experiment


# Experiment Serializer
class ExperimentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experiment
        fields = '__all__'
