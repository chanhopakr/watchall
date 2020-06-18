import datetime

from django.contrib.sessions.models import Session
from django.http.response import JsonResponse

from .base import logout_view, WatchAllModelView
from ..models import Setting


class SessionView(WatchAllModelView):
    model = Session

    def get(self, request, *args, **kwargs):
        try:
            session_key = request.session.session_key
            session = self.model.objects.get(session_key=session_key)
            user = request.user

            try:
                passwd_alpha = Setting.objects.get(key='passwd_alpha').value
            except:
                passwd_alpha = 'False'
            try:
                passwd_number = Setting.objects.get(key='passwd_number').value
            except:
                passwd_number = 'False'
            try:
                passwd_special = Setting.objects.get(key='passwd_special').value
            except:
                passwd_special = 'False'
            try:
                passwd_length = Setting.objects.get(key='passwd_length').value
            except:
                passwd_length = 6

            data = {
                'session_key': session_key,
                'expire_date': session.expire_date,
                'user_id': user.id,
                'username': user.username,
                'is_superuser': user.is_superuser,
                'last_name': user.last_name,
                'first_name': user.first_name,
                'email': user.email,
                'passwd_length': passwd_length,
                'passwd_alpha': passwd_alpha,
                'passwd_number': passwd_number,
                'passwd_special': passwd_special,
            }
        except Session.DoesNotExist:
            return logout_view(request)
        else:
            return JsonResponse({'success': True, 'data': data})

    def put(self, request, *args, **kwargs):
        try:
            session_key = kwargs.get('session_key')
            session = self.model.objects.get(session_key=session_key)
            expiry_age = request.session.get_expiry_age()
            request.session.set_expiry(expiry_age)

            expire_date = kwargs.get('expire_date')
            if expire_date:
                expire_date = datetime.datetime.strptime(expire_date, '%Y-%m-%dT%H:%M:%S')
                expire_date += datetime.timedelta(0, expiry_age)
                session.expire_date = expire_date
                session.save()

            user = request.user
            data = {
                # 'session_key': session_key,
                'expire_date': expire_date,
                # 'user_id': user.id,
                'is_superuser': user.is_superuser,
            }
        except Session.DoesNotExist:
            return logout_view(request)
        else:
            return JsonResponse({'success': True, 'data': data})

    read = get
    update = put
