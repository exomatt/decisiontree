FROM python:3.7
MAINTAINER exomat@localhost

COPY ./ /app
WORKDIR /app

RUN pip install pipenv && ls -al && pipenv install && ls -al
