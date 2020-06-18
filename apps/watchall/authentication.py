from django.contrib.auth.backends import BaseBackend
from django.contrib.auth import get_user_model


class IsNotActiveUser(Exception):
    pass


class DoesNotApprove(Exception):
    pass


class WatchAllBackend(BaseBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        user_model = get_user_model()

        try:
            user = user_model.objects.get(username=username, is_delete=False)
            if user.check_password(password):
                pass
            else:
                return
        except user_model.DoesNotExist:
            return
        except IsNotActiveUser:
            return
        except DoesNotApprove:
            return
        else:
            # success
            return user

    def get_user(self, user_id):
        user_model = get_user_model()
        try:
            return user_model.objects.get(pk=user_id)
        except user_model.DoesNotExist:
            return None
