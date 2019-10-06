import json
import logging
import os
import re
import zipfile
from os import mkdir, listdir
from os.path import abspath, isfile, join, exists
from shutil import copyfile, rmtree
from typing import List

import xmltodict
from django.conf import settings
from django.contrib.auth.models import User
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

logger = logging.getLogger(__name__)


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
        names_file_path = settings.BASE_USERS_DIR + username + "/" + experiment.names_file_name
        test_file_path = settings.BASE_USERS_DIR + username + "/" + experiment.test_file_name
        prepare_files(experiment, username, config_file_path, data_file_path, names_file_path, test_file_path)
        change_xml_params_and_model(experiment)
        set_new_progress(experiment)
        # gdt_run.delay(experiment.result_directory_path + "/" + experiment.config_file_name, experiment.id)

    def perform_destroy(self, instance):
        user = self.request.user
        username = user.username
        remove_model_files(instance, username)
        instance.delete()


class ExperimentCrud(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    @staticmethod
    def post(request):
        user = request.user
        username = user.username
        experiment_id = request.data['id']
        new_name = request.data['new_name']
        experiment = Experiment.objects.get(pk=experiment_id)
        path: str = f'{settings.BASE_USERS_DIR}{username}/{experiment.id}_{experiment.name}'
        new_path: str = f'{settings.BASE_USERS_DIR}{username}/{experiment.id}_{new_name}'
        if exists(path):
            os.rename(path, new_path)
        experiment.name = new_name
        experiment.result_directory_path = new_path
        experiment.save()
        return Response(status=status.HTTP_200_OK, data=f'Change model name to -> {new_name}')


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

    # cancel experiment
    @staticmethod
    def get(request):
        experiment_id = request.query_params['id']
        experiment = Experiment.objects.get(pk=experiment_id)
        task_id = experiment.task_id
        experiment.status = "Canceled"
        experiment.save()
        app.control.revoke(task_id, terminate=True, signal='SIGKILL')
        return Response(status=status.HTTP_200_OK, data="Successfully delete task with id " + task_id)

    # rerun experiment
    @staticmethod
    def post(request):
        user = request.user
        username = user.username
        experiment_id = request.query_params['id']
        experiment = Experiment.objects.get(pk=experiment_id)
        progress = experiment.progress
        progress.mean_time = 0
        progress.run_number = 0
        progress.last_iter_number = 0
        progress.save()
        path = settings.BASE_USERS_DIR + username + "/" + str(experiment.id) + "_" + experiment.name
        rmtree(path + '/out')
        mkdir(path + '/out')
        config_file_path = experiment.result_directory_path + "/" + experiment.config_file_name
        logger.debug(f'Config file used in celery task run {config_file_path}')
        gdt_run.delay(config_file_path, experiment.id)
        return Response(status=status.HTTP_200_OK, data="Successfully rerun experiment")

    # start experiment
    @staticmethod
    def put(request):
        experiment_id = request.query_params['id']
        experiment = Experiment.objects.get(pk=experiment_id)

        gdt_run.delay(experiment.result_directory_path + "/" + experiment.config_file_name, experiment.id)
        return Response(status=status.HTTP_200_OK, data="Successfully start experiment")


# EXPERIMENT PROGRESS
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
        result_directory_path = settings.BASE_USERS_DIR + request.user.username + "/tmp"
        if not os.path.exists(result_directory_path):
            os.mkdir(result_directory_path)

        zip_file_path = result_directory_path + "/" + str(experiment.id) + "_" + experiment.name + ".zip"
        zipf = zipfile.ZipFile(zip_file_path, 'w', zipfile.ZIP_DEFLATED)
        zipdir(experiment.result_directory_path, zipf)
        zipf.close()

        # make_archive(zip_file_path, 'zip', experiment.result_directory_path)

        return serve(request, os.path.basename(zip_file_path), os.path.dirname(zip_file_path))

    def post(self, request):
        user = self.request.user
        logger.info("Request data: " + str(request.data))
        username = user.username
        config_file_path = settings.BASE_DIR + "/example.xml"
        user_dir = settings.BASE_USERS_DIR + username
        serializer = ConfigFileSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data=serializer.error_messages)
        config_file_object = serializer.create(serializer.validated_data)
        message = create_config_file(config_file_object, config_file_path, user_dir)
        return Response(status=status.HTTP_200_OK, data=message)


class FileDownloader(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    @staticmethod
    def get(request):
        filename = request.query_params['filename']
        path = settings.BASE_USERS_DIR + request.user.username + "/" + filename

        return serve(request, os.path.basename(path), os.path.dirname(path))


def copy_experiment_files(old_path: str, new_path: str):
    os.mkdir(new_path)
    ExperimentUtils.copytree(old_path, new_path)


def zipdir(path, ziph):
    # ziph is zipfile handle
    for root, dirs, files in os.walk(path):
        for file in files:
            ziph.write(os.path.join(root, file))


# SHARE EXEPERIMENT WITH OTHER USERS
class ExperimentShare(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    # share experiment
    def get(self, request):
        user = self.request.user
        user_username = user.username
        experiment_id = request.query_params['id']
        username_to_share = request.query_params['username']
        experiment = Experiment.objects.get(pk=experiment_id)
        user_to_share_with = User.objects.get(username=username_to_share)
        if user_to_share_with is None:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                            data="User don't exists with that name:  " + username_to_share)

        old_path = settings.BASE_USERS_DIR + user_username + "/" + str(experiment.id) + "_" + experiment.name
        progress = experiment.progress
        experiment.name = experiment.name + " (shared from " + user_username + ")"
        experiment.user = user_to_share_with
        experiment.pk = None
        experiment.save()
        progress.pk = None
        progress.experiment = experiment
        progress.save()
        experiment.progress = progress
        experiment.save()
        new_path = settings.BASE_USERS_DIR + username_to_share + "/" + str(
            experiment.id) + "_" + experiment.name
        experiment.result_directory_path = new_path
        experiment.save()
        copy_experiment_files(old_path, new_path)
        change_xml_params_and_model(experiment)
        return Response(status=status.HTTP_200_OK, data="Experiment share with " + username_to_share)


# COPY EXPERIMENT
class ExperimentCopy(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    # copy experiment
    def get(self, request):
        user = self.request.user
        user_username = user.username
        experiment_id = request.query_params['id']
        experiment = Experiment.objects.get(pk=experiment_id)
        old_path = settings.BASE_USERS_DIR + user_username + "/" + str(experiment.id) + "_" + experiment.name
        progress = experiment.progress
        experiment.name = experiment.name + " (copy)"
        experiment.pk = None
        experiment.save()
        progress.pk = None
        progress.experiment = experiment
        progress.save()
        experiment.progress = progress
        experiment.save()
        new_path = settings.BASE_USERS_DIR + user_username + "/" + str(
            experiment.id) + "_" + experiment.name
        experiment.result_directory_path = new_path
        experiment.save()
        copy_experiment_files(old_path, new_path)
        change_xml_params_and_model(experiment)
        return Response(status=status.HTTP_200_OK,
                        data=f'Create experiment copy with id {experiment.id} and name {experiment.name}')


def create_config_file(data: ConfigFile, config_file_path: str, user_dir: str) -> str:
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
    if file_name != name:
        return "File with that name exist -> create file with new name: " + name.split("/")[2]
    return "File created with name: " + name.split("/")[2]


def remove_model_files(experiment: Experiment, username: str) -> None:
    path: str = f'{settings.BASE_USERS_DIR}{username}/{experiment.id}_{experiment.name}'
    rmtree(path)


def prepare_files(experiment: Experiment, username: str, config_file_path: str, data_file_path: str,
                  names_file_path: str, test_file_path: str) -> None:
    path = settings.BASE_USERS_DIR + username + "/" + str(experiment.id) + "_" + experiment.name
    mkdir(path)
    mkdir(path + '/out')
    experiment.config_file_name = re.sub(r"[\(\[].*?[\)\]]", "", experiment.config_file_name)
    experiment.data_file_name = re.sub(r"[\(\[].*?[\)\]]", "", experiment.data_file_name)
    new_config_path = path + "/" + experiment.config_file_name
    new_data_path = path + "/" + experiment.data_file_name
    new_test_path = path + "/" + experiment.data_file_name
    new_names_path = path + "/" + experiment.data_file_name
    copyfile(config_file_path, new_config_path)
    copyfile(data_file_path + ".data", new_data_path + ".data")
    copyfile(test_file_path + ".test", new_test_path + ".test")
    copyfile(names_file_path + ".names", new_names_path + ".names")
    parameters_string = f'Information about created experiment: \n' \
                        f'Experiment id: {experiment.id}\n' \
                        f'Experiment name: {experiment.name}\n' \
                        f'Files used in experiment: \n' \
                        f'- config: {experiment.config_file_name},\n' \
                        f'- data: {experiment.data_file_name}, \n' \
                        f'- test: {experiment.test_file_name}, \n' \
                        f'- names: {experiment.names_file_name}\n'
    txt_path = path + "/" + "info.txt"
    with open(txt_path, "w") as text_file:
        text_file.write(parameters_string)
    experiment.result_directory_path = path
    experiment.save()
    experiment.refresh_from_db()


# todo dokonczyc parsownie i okreslenie sciezek
def change_xml_params_and_model(experiment: Experiment) -> None:
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
    # mlp_param_: List[dict] = config['MLPExperiment']['MLPClassification']['MLPClassifiers']['MLPClassifier']['MLPParam']
    # progress = Progress(experiment=experiment)
    #
    # for i in mlp_param_:
    #     if i.get("@Name") is "maximumiterations":
    #         progress.iteration = i.get("@Value")
    #         break
    #
    # progress.save()
    # experiment.progress = progress
    experiment.save()
    unparsed = xmltodict.unparse(config, pretty=True)
    with open(config_file_name, "w") as file:
        file.write(unparsed)


def set_new_progress(experiment: Experiment) -> None:
    config_file_name = experiment.result_directory_path + "/" + experiment.config_file_name
    with open(config_file_name, "r") as file:
        read_lines = file.read().replace('\n', '')
    config = xmltodict.parse(read_lines)
    runs_ = config['MLPExperiment']['MLPClassification']['@Runs']
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
