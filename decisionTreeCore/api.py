import json
import os
from os import mkdir, listdir
from os.path import abspath, isfile, join
from shutil import copyfile, make_archive
from typing import List

import xmltodict
from django.conf import settings
from django.views.static import serve
from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from rest_framework.views import APIView

from decisionTree.celery import app
from decisionTreeCore.models import Experiment, Progress
from decisionTreeCore.task import gdt_run
from decisionTreeCore.utils import ExperimentUtils
from decisionTreeCore.utils.ExperimentUtils import ConfigFileSerializer, ConfigFile
from .serializers import ExperimentSerializer


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
        change_xml_params_and_model(experiment)
        gdt_run.delay(experiment.result_directory_path + "/" + experiment.config_file_name, experiment.id)

    # def perform_destroy(self, instance):


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
def change_xml_params_and_model(experiment: Experiment):
    config_file_name = experiment.result_directory_path + "/" + experiment.config_file_name
    with open(config_file_name, "r") as file:
        read_lines = file.read().replace('\n', '')
    config = xmltodict.parse(read_lines)
    config['MLPExperiment']['MLPClassification']['@OutputFolder'] = abspath(experiment.result_directory_path) + '/out'
    config['MLPExperiment']['MLPClassification']['MLPDatasets']['MLPDataset']['@Name'] = experiment.data_file_name
    config['MLPExperiment']['MLPClassification']['MLPDatasets']['MLPDataset'][
        '@Path2Stem'] = abspath(experiment.result_directory_path) + '/' + experiment.data_file_name
    # config['MLPExperiment']['MLPClassification']['@Runs'] = experiment.runs_number
    # change model fields base on file
    runs_ = config['MLPExperiment']['MLPClassification']['@Runs']
    # config['MLPExperiment']['MLPClassification']['@Runs'] = 3
    experiment.runs_number = runs_
    mlp_param_: List[dict] = config['MLPExperiment']['MLPClassification']['MLPClassifiers']['MLPClassifier']['MLPParam']
    progress = Progress(experiment=experiment)

    for i in mlp_param_:
        if i.get("@Name") is "maximumiterations":
            progress.iteration = i.get("@Value")
            break

    progress.save()
    experiment.progress = progress
    experiment.save()
    unparsed = xmltodict.unparse(config, pretty=True)
    with open(config_file_name, "w") as file:
        file.write(unparsed)


# EXPERIMENT RESULT API
class ExperimentResult(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    @staticmethod
    def get(request):
        experiment_id = request.query_params['id']
        run_number: int = int(request.query_params['runNumber'])
        error = ('Finished', 'Error')
        experiment = Experiment.objects.get(pk=experiment_id)
        if experiment.status not in error:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Experiment is not finished yet")
        path = experiment.result_directory_path + "/out/"
        only_files = [f for f in listdir(path) if isfile(join(path, f))]
        filename: str = ""
        for name in only_files:
            number_ = "RUN" + str(run_number)
            if number_ in name and name.endswith(".txt"):
                filename = name
                break
        tree = ExperimentUtils.get_tree(path + filename)
        tree_without_line = tree.replace("| ", "")
        obj = json.loads(tree_without_line)

        return Response(status=status.HTTP_200_OK, data=obj)


# EXPERIMENT CELERY CONTROL TASK API
class ExperimentTask(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    @staticmethod
    def get(request):
        experiment_id = request.query_params['id']
        experiment = Experiment.objects.get(pk=experiment_id)
        task_id = experiment.task_id
        experiment.status = "Canceled"
        experiment.save()
        app.control.revoke(task_id, terminate=True, signal='SIGKILL')
        return Response(status=status.HTTP_200_OK, data="Successfully delete task with id " + task_id)


# EXPERIMENT CELERY CONTROL TASK API
class ExperimentProgress(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    @staticmethod
    def get(request):
        experiment_id = request.query_params['id']
        experiment = Experiment.objects.get(pk=experiment_id)
        progress = experiment.progress
        all_iter = progress.iteration * experiment.runs_number
        actual_iter = progress.last_iter_number + progress.run_number * progress.iteration
        progress_percent = float(actual_iter / all_iter)
        time = (all_iter - actual_iter) * progress.mean_time
        progress_data = ExperimentUtils.ProgressData(time, progress_percent)
        str_progress_data = ExperimentUtils.get_json_progress(progress_data)
        data = json.loads(str_progress_data)
        return Response(status=status.HTTP_200_OK, data=data)


def create_config_file(data: ConfigFile, config_file_path: str, user_dir: str):
    with open(config_file_path, "r") as file:
        read_lines = file.read().replace('\n', '')
    config = xmltodict.parse(read_lines)
    config['MLPExperiment']['MLPClassification']['@Runs'] = data.runs
    # config['MLPExperiment']['MLPClassification']['MLPClassifiers']['MLPClassifier']['MLPParam']['MLPSubParam'] = data.runs
    # config['MLPExperiment']['MLPClassification']['@Runs'] = data.runs
    # config['MLPExperiment']['MLPClassification']['@Runs'] = data.runs
    mlp_param_: List[dict] = config['MLPExperiment']['MLPClassification']['MLPClassifiers']['MLPClassifier']['MLPParam']
    attribute_dict: dict = data.__dict__
    for i in mlp_param_:
        if i.get("@Name") == 'parallelizationOMP':
            sub_param: List[dict] = i.get("MLPSubParam")
            for param in sub_param:
                if param.get("@Name").lower() in attribute_dict:
                    if attribute_dict.get(param.get("@Name").lower()):
                        param['@Value'] = 'yes'
                    else:
                        param['@Value'] = 'no'
            i['MLPSubParam'] = sub_param
        if i.get("@Name") in attribute_dict:
            i['@Value'] = str(attribute_dict.get(i.get("@Name")))
    config['MLPExperiment']['MLPClassification']['MLPClassifiers']['MLPClassifier']['MLPParam'] = mlp_param_
    unparsed = xmltodict.unparse(config, pretty=True)
    file_name = user_dir + "/" + data.name + ".xml"
    name = ExperimentUtils.generate_file_name(file_name)
    with open(name, "w") as file:
        file.write(unparsed)


# change model fields base on file


class ExperimentFiles(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    @staticmethod
    def get(request):
        experiment_id = request.query_params['id']
        experiment = Experiment.objects.get(pk=experiment_id)
        error = ('Finished', 'Error')
        if experiment.status not in error:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Experiment is not finished yet")
        result_directory_path = experiment.result_directory_path
        zip_file_path = result_directory_path + '/' + experiment_id + '_' + experiment.name
        make_archive(zip_file_path, 'zip',
                     result_directory_path + "/")
        # zip_file = open(zip_file_path + '.zip', 'rb')

        # response = HttpResponse(zip_file, content_type='application/force-download')
        # response['Content-Disposition'] = 'attachment; filename=%s' %  smart_str(zip_file)
        # response['X-Sendfile'] = smart_str(zip_file)
        # return response
        # return Response(status=status.HTTP_200_OK, content_type='application/zip', data=zip_file)
        return serve(request, os.path.basename(zip_file_path + '.zip'), os.path.dirname(zip_file_path + '.zip'))

    def post(self, request):
        user = self.request.user
        username = user.username
        config_file_path = settings.BASE_DIR + "/example.xml"
        user_dir = settings.BASE_USERS_DIR + username
        serializer = ConfigFileSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Problem with serializer")
        config_file_object = serializer.create(serializer.validated_data)
        create_config_file(config_file_object, config_file_path, user_dir)
        print(request.data)
        return Response(status=status.HTTP_200_OK)
