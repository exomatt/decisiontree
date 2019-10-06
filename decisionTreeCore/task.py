from __future__ import absolute_import, unicode_literals

import os
import re
from subprocess import Popen, PIPE
from typing import List

from celery import shared_task
from celery.utils.log import get_task_logger
from django.conf import settings

from decisionTreeCore.models import Experiment

logger = get_task_logger(__name__)


@shared_task
def test():
    return "test task "


@shared_task(bind=True)
def gdt_run(self, filename, experiment_id):
    task_id = self.request.id
    logger.info(task_id)
    set_task_id(experiment_id, task_id)
    set_status(experiment_id, "Running")
    filename = os.path.abspath(filename)
    logger.info('Parameters: id: ' + str(experiment_id) + ' filename: ' + filename)
    logger.info(filename)
    command = settings.PROGRAM_PATH + " -f \"%s\"" % filename
    logger.info('Command: ' + command)
    logger.info(command)
    process = Popen(command, shell=True, stdout=PIPE, stderr=PIPE)
    while True:
        output = process.stdout.readline().decode('utf-8')
        if process.poll() is not None:
            break
        output_striped = output.strip()
        logger.info(output_striped)
        if "loop mean time:" in output_striped:
            set_progress(experiment_id, output_striped)
    # logger.error("Errors" + ",".join(errors))
    set_status(experiment_id, "Finished")
    # error = ''.join(process.stderr.readline().decode().strip().split())
    # if error:
    #     logger.error("Error to: " + error)
    #     logger.error("Error to: " + ''.join(process.stdout.readline().decode().strip().split()))
    #     set_error(experiment_id, "Error", error)
    return process.stdout


def set_status(experiment_id, status: str, task_id: str = None):
    logger.info(f"Change model status {status} and task_id {task_id}")
    experiment = Experiment.objects.all().get(id=experiment_id)
    experiment.status = status
    if task_id is not None:
        experiment.task_id = task_id
    experiment.save()


def set_error(experiment_id, status: str, errors: str, task_id: str = None):
    logger.info(f"Change model status {status} and task_id {task_id}")
    experiment = Experiment.objects.all().get(id=experiment_id)
    experiment.status = status
    experiment.error_message = errors
    if task_id is not None:
        experiment.task_id = task_id
    experiment.save()


def set_task_id(experiment_id, request_id):
    experiment = Experiment.objects.all().get(id=experiment_id)
    experiment.task_id = request_id
    experiment.save()


def set_progress(experiment_id: str, output_striped: str):
    findall = re.findall(r'\d+(?:\.\d+)?', output_striped)
    iter_number = int(findall[0])
    if iter_number % 20 != 0:
        return

    experiment = Experiment.objects.all().get(id=experiment_id)
    progress = experiment.progress
    if progress.last_iter_number > iter_number:
        progress.run_number = progress.run_number + 1
    progress.mean_time = float(findall[1])
    progress.last_iter_number = iter_number
    progress.save()
    experiment.save()
