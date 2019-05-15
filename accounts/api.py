from rest_framework import generics, permissions, status
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import UserSerializer, RegisterSerializer, LoginSerializer

from os import listdir, remove
from os.path import isfile, join


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
            "token": Token.objects.get_or_create(user=user)[0].key
        })


# Get User API
class UserAPI(generics.RetrieveAPIView):
    permission_classes = [
        permissions.IsAuthenticated
    ]

    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


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
        user = request.user
        username = user.username
        path = "users/" + username + "/"
        files = [f for f in listdir(path) if isfile(join(path, f))]
        return Response(status=status.HTTP_200_OK, data=files)

    @staticmethod
    def put(request, format=None):
        user = request.user
        username = user.username
        file_list = request.FILES.getlist('file')
        for file in file_list:
            name = file._name
            path = "users/" + username + "/" + name
            with open(path, 'wb') as f:
                for chunk in file.chunks():
                    f.write(chunk)
        return Response(status=status.HTTP_200_OK)

    @staticmethod
    def delete(request):
        user = request.user
        username = user.username
        name = request.query_params['name']
        path = "users/" + username + "/" + name

        if isfile(path):
            remove(path)
            return Response(status=status.HTTP_200_OK, data="Successfully delete file ")
        else:
            return Response(status=status.HTTP_500_INTERNAL_SERVER_ERROR, data="Can't delete file")
