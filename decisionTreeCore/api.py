import xmltodict
from datetime import datetime
from django.conf import settings
from rest_framework import permissions, viewsets
from os import mkdir
from decisionTreeCore.models import Experiment
from decisionTreeCore.task import gdt_run
from .serializers import ExperimentSerializer
from shutil import copyfile
from os.path import abspath


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
        prepare_files(experiment, username, config_file_path, data_file_path)
        change_xml_params(experiment)
        gdt_run.delay(experiment.result_directory_path + "/" + experiment.config_file_name, experiment.id)


def prepare_files(experiment: Experiment, username: str, config_file_path: str, data_file_path: str):
    path = settings.BASE_USERS_DIR + username + "/" + str(experiment.id) + "_" + experiment.name
    mkdir(path)
    mkdir(path + '/out')
    new_config_path = path + "/" + experiment.config_file_name
    new_data_path = path + "/" + experiment.data_file_name
    copyfile(config_file_path, new_config_path)
    copyfile(data_file_path + ".names", new_data_path + ".names")
    copyfile(data_file_path + ".data", new_data_path + ".data")
    copyfile(data_file_path + ".test", new_data_path + ".test")
    experiment.result_directory_path = path
    experiment.save()
    experiment.refresh_from_db()


# todo dokonczyc parsownie i okreslenie sciezek
def change_xml_params(experiment: Experiment):
    config_file_name = experiment.result_directory_path + "/" + experiment.config_file_name
    with open(config_file_name, "r") as file:
        read_lines = file.read().replace('\n', '')
    config = xmltodict.parse(read_lines)
    config['MLPExperiment']['MLPClassification']['@OutputFolder'] = abspath(experiment.result_directory_path) + '/out'
    config['MLPExperiment']['MLPClassification']['MLPDatasets']['MLPDataset']['@Name'] = experiment.data_file_name
    config['MLPExperiment']['MLPClassification']['MLPDatasets']['MLPDataset'][
        '@Path2Stem'] = abspath(experiment.result_directory_path) + '/' + experiment.data_file_name

    unparsed = xmltodict.unparse(config, pretty=True)

    with open(config_file_name, "w") as file:
        file.write(unparsed)
