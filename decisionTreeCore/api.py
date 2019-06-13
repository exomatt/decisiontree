import xmltodict
from datetime import datetime
from django.conf import settings
from rest_framework import permissions, viewsets
from os import mkdir
from decisionTreeCore.models import Experiment
from decisionTreeCore.task import gdt_run
from .serializers import ExperimentSerializer
from shutil import copyfile


# Experiments Viewset

class ExperimentViewSet(viewsets.ModelViewSet):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    serializer_class = ExperimentSerializer

    def get_queryset(self):
        return self.request.user.experiment.all()

    def perform_create(self, serializer):
        experiment = serializer.save(user=self.request.user, status="Created")
        user = self.request.user
        username = user.username
        config_file_path = settings.BASE_USERS_DIR + username + "/" + experiment.config_file_name
        data_file_path = settings.BASE_USERS_DIR + username + "/" + experiment.data_file_name
        # parse()
        new_experiment = prepare_files(experiment, username, config_file_path, data_file_path)
        # gdt_run.delay(config_file_path, new_experiment.id)


def prepare_files(experiment: Experiment, username: str, config_file_path: str, data_file_path: str) -> Experiment:
    path = settings.BASE_USERS_DIR + username + "/" + str(experiment.id) + "_" + experiment.name
    mkdir(path)
    new_config_path = path + "/" + experiment.config_file_name
    new_data_path = path + "/" + experiment.data_file_name
    copyfile(config_file_path, new_config_path)
    copyfile(data_file_path + ".names", new_data_path + ".names")
    copyfile(data_file_path + ".data", new_data_path + ".data")
    copyfile(data_file_path + ".test", new_data_path + ".test")
    experiment.result_directory_path = path
    experiment.config_file_name = new_config_path
    experiment.data_file_name = new_data_path
    experiment_save = experiment.save()
    return experiment_save


# todo dokonczyc parsownie i okreslenie sciezek
def parse(filename, username, change):
    path = settings.BASE_USERS_DIR + username + "/" + filename
    with open(path, "r") as file:
        readlines = file.read().replace('\n', '')
    parse = xmltodict.parse(readlines)
    print(parse)

    unparse = xmltodict.unparse(parse, pretty=True)

    print(unparse)

    with open(path, "w") as file:
        file.write(unparse)
