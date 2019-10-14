import logging
from os import listdir, remove, rename
from os.path import isfile, join

from django.conf import settings
from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User, Group

from decisionTreeCore.utils import ExperimentUtils
from .serializers import UserSerializer, RegisterSerializer, LoginSerializer

logger = logging.getLogger(__name__)


# Register API
class RegisterAPI(generics.GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [
        permissions.AllowAny
    ]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        # todo check if ist work
        role = 'student'
        my_group = Group.objects.get(name=role)
        my_group.user_set.add(user)
        logger.debug(f'Set role for new user: {role} for {user}')
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": Token.objects.get_or_create(user=user)[0].key
        })


# Login API
class LoginAPI(generics.GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [
        permissions.AllowAny
    ]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data
        # login(request, user)
        return Response({
            "user": UserSerializer(user, context=self.get_serializer_context()).data,
            "token": Token.objects.get_or_create(user=user)[0].key,
            "group": list(user.groups.values_list('name', flat=True))
        })


# Get User API
class UserAPI(generics.RetrieveAPIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user

    @staticmethod
    def post(request):
        user = request.user
        group = list(user.groups.values_list('name', flat=True))
        return Response(status=status.HTTP_200_OK, data=group)


# Get Logout  API
class LogoutAPI(generics.GenericAPIView):
    @staticmethod
    def post(request):
        request.user.auth_token.delete()
        return Response(status=status.HTTP_200_OK)


# User Files API
class UserFiles(APIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    @staticmethod
    def get(request):
        user: User = request.user
        groups = list(user.groups.values_list('name', flat=True))
        if 'normal' not in groups:
            return Response(status=status.HTTP_403_FORBIDDEN, data="Not enough permissions!")
        username = user.username
        path = settings.BASE_USERS_DIR + username + "/"
        files = [f for f in listdir(path) if isfile(join(path, f))]
        return Response(status=status.HTTP_200_OK, data=files)

    @staticmethod
    def put(request, format=None):
        user = request.user
        username = user.username
        groups = list(user.groups.values_list('name', flat=True))
        if 'normal' not in groups:
            return Response(status=status.HTTP_403_FORBIDDEN, data="Not enough permissions!")
        file_list = request.FILES.getlist('file')
        name_file = list()
        for file in file_list:
            name = file._name
            path = "users/" + username + "/" + name
            name = ExperimentUtils.generate_file_name(path)
            name_file.append(name.split("/")[-1])
            # todo need to check it
            with open(name, 'wb') as f:
                for chunk in file.chunks():
                    f.write(chunk)
            data = ",".join(name_file)
        return Response(status=status.HTTP_200_OK, data=f'Add file/files with name: {data}')

    @staticmethod
    def delete(request):
        user = request.user
        groups = list(user.groups.values_list('name', flat=True))
        if 'normal' not in groups:
            return Response(status=status.HTTP_403_FORBIDDEN, data="Not enough permissions!")
        username = user.username
        name = request.query_params['name']
        path = "users/" + username + "/" + name

        if isfile(path):
            remove(path)
            return Response(status=status.HTTP_200_OK, data="Successfully delete file ")
        else:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Can't delete file")

    @staticmethod
    def post(request):
        user = request.user
        groups = list(user.groups.values_list('name', flat=True))
        if 'normal' not in groups:
            return Response(status=status.HTTP_403_FORBIDDEN, data="Not enough permissions!")
        username: str = user.username
        filename: str = request.data['filename']
        new_name: str = request.data['new_name']
        path: str = settings.BASE_USERS_DIR + username + "/" + filename
        file_extension = filename.rsplit(".", 1)[1]
        new_path = settings.BASE_USERS_DIR + username + "/" + new_name + "." + file_extension
        if len(new_name.rsplit(".", 1)) >= 2:
            new_file_extension = new_name.rsplit(".", 1)[1]
            if new_file_extension == file_extension:
                new_path = settings.BASE_USERS_DIR + username + "/" + new_name

        if isfile(path):
            if isfile(new_path):
                new_path = ExperimentUtils.generate_file_name(new_path)
            rename(path, new_path)
            return Response(status=status.HTTP_200_OK, data=f'Successfully change file name to: {new_name}')
        else:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Cannot change file name")
