from __future__ import absolute_import, unicode_literals

from subprocess import Popen, PIPE

from celery import shared_task
import logging
import os
from django.conf import settings

from decisionTreeCore.models import Experiment

logger = logging.getLogger(__name__)


@shared_task
def test():
    return "test task "


@shared_task
def gdt_run(filename, experiment_id):
    filename = os.path.abspath(filename)
    command = settings.PROGRAM_PATH + " -f %s" % filename
    process = Popen(command, shell=True, stdout=PIPE, stderr=PIPE)
    while True:
        output = process.stdout.readline().decode('utf-8')
        if process.poll() is not None:
            break
        print(output.strip())
    print(process.stderr)
    set_finished(experiment_id)
    return process.stdout


def set_finished(experiment_id):
    experiment = Experiment.objects.all().get(id=experiment_id)
    experiment.status = "Finished"
    experiment.save()
