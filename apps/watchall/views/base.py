import json
import re

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.hashers import make_password
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.http import QueryDict
from django.shortcuts import render, redirect
from django.views.generic.base import View

from ..models import User, Setting
from apps.common.django.utils import session_expiry_deco
from apps.common.utils import kwargs_json_parse
from apps.common.views import BaseGenericView, BaseModelView, BaseTemplateView
from ..apps import WatchallConfig


TITLE = WatchallConfig.verbose_name
MAIN_HASH = 'home'


def http_method_not_allowed(request, *args, **kwargs):
    return redirect('/')


def logout_view(request, *args, **kwargs):
    user = request.user
    if user:
        fields = {
            'category': 'User',
            'action': 'logout',
            'description': '로그아웃',
            'worker_username': user,
        }

        try:
            # AnonymousUser 에 대한 예외 처리
            fields.update({
                'worker_last_name': user.last_name,
                'worker_dept_name': user.customer_name,
            })
        except AttributeError:
            pass
    logout(request)
    return redirect('/')


class WatchAllGenericView(BaseGenericView):
    @session_expiry_deco()
    def dispatch(self, request, *args, **kwargs):
        """
        Override
        """
        # set_session_time(request)
        if request.method.lower() in self.http_method_names:
            method = request.method.lower()

            # REST API 와 post CRUD url 호환성 맞추기
            if method == 'post' and len(args) > 0:
                new_method = args[0]
                if re.compile(fr'{new_method}$').search(request.path):
                    method = new_method
                    args = args[1:]

            if method in ('get', 'read'):
                params = getattr(request, request.method).dict()
                kwargs.update(params)
            else:
                body = request.body.decode('utf-8')
                if body:
                    try:
                        params = json.loads(body)
                    except json.JSONDecodeError:
                        params = QueryDict(body).dict()
                else:
                    params = getattr(request, request.method).dict()
                kwargs.update(params)

            handler = getattr(self, method, http_method_not_allowed)
            kwargs_ = kwargs_json_parse(**kwargs)
            return handler(request, *args, **kwargs_)
        else:
            handler = http_method_not_allowed
            return handler(request, *args, **kwargs)


class WatchAllModelView(BaseModelView):
    @session_expiry_deco()
    def dispatch(self, request, *args, **kwargs):
        """
        Override
        """
        # set_session_time(request)
        if request.method.lower() in self.http_method_names:
            method = request.method.lower()

            # REST API 와 post CRUD url 호환성 맞추기
            if method == 'post' and len(args) > 0:
                new_method = args[0]
                if re.compile(fr'{new_method}$').search(request.path):
                    method = new_method
                    args = args[1:]

            if method in ('get', 'read'):
                params = getattr(request, request.method).dict()
                kwargs.update(params)
            else:
                body = request.body.decode('utf-8')
                if body:
                    try:
                        params = json.loads(body)
                    except json.JSONDecodeError:
                        params = QueryDict(body).dict()
                else:
                    params = getattr(request, request.method).dict()
                kwargs.update(params)

            handler = getattr(self, method, http_method_not_allowed)
            kwargs_ = kwargs_json_parse(**kwargs)
            return handler(request, *args, **kwargs_)
        else:
            handler = http_method_not_allowed
            return handler(request, *args, **kwargs)


class DevelopmentTemplateView(BaseTemplateView):
    main_hash = MAIN_HASH
    title = TITLE
    template_name = 'development.html'


class ProductionTemplateView(BaseTemplateView):
    main_hash = MAIN_HASH
    title = TITLE
    template_name = 'zenlog.html'


class SignInView(View):
    def get(self, request, *args, **kwargs):
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

        context = {
            'title': TITLE,
            'passwd_length': passwd_length,
            'passwd_alpha': passwd_alpha,
            'passwd_number': passwd_number,
            'passwd_special': passwd_special,
        }
        return render(request, 'index.html', context)

    def post(self, request, *args, **kwargs):
        username = request.POST.get('username')
        password = request.POST.get('password')

        context = {
            'title': TITLE,
        }
        try:
            user = authenticate(request, username=username, password=password)
            if user:

                if user.is_active:
                    login(request, user)

                    return redirect('/watchall')
                else:
                    raise ValidationError('비활성화된 계정입니다. '
                                          '관리자에게 문의하십시오.')
            else:
                raise ValidationError('계정 또는 비밀번호를 확인하십시오.')
        except (ValidationError, ObjectDoesNotExist) as e:
            context['message'] = ''.join(e)
            context['redirection'] = '/'

            return render(request, 'index.html', context)


class SignUpView(BaseGenericView):
    def post(self, request, username='', password='', password_confirm='',
             request_description='', csrfmiddlewaretoken=None,
             *args, **kwargs):
        """"""
        message = ''
        redirection = '/'

        try:

            if not username:
                raise Exception('계정을 입력해 주십시오.')
            if not password:
                raise Exception('패스워드를 입력해 주십시오.')

            user = User.objects.get(username=username, is_delete=False)
            if user.is_active:
                raise Exception('이미 등록된 계정입니다.')
            else:
                if user.user_approval.is_approve:
                    raise Exception('비활성화된 계정입니다. '
                                    '관리자에게 문의하십시오.')
                else:
                    raise Exception('이미 계정 신청중인 계정입니다. '
                                    '관리자에게 문의하십시오.')
        except User.DoesNotExist:
            # Create user
            user = User.objects.create(username=username, **kwargs)
            password_ = make_password(password)
            user.password = password_
            user.is_active = False
            user.save()
            # Make message
            message = '계정 신청을 하였습니다. 관리자 승인 후 로그인이 가능합니다.'
        except Exception as e:
            message = e
        finally:
            return render(request, 'index.html', {
                'message': message,
                'redirection': redirection
            })
