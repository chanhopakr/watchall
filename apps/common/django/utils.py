from datetime import datetime as dt
from functools import wraps
import os
import sys
import re


from django import setup
from django.apps import apps
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured
from django.db import connection
from django.db.models import CharField, Func, Model
from django.http.response import FileResponse, JsonResponse
from django.urls import re_path
from django.views.static import serve

# from apps.cpmas.models import Setting
from ..excellib import Excel


def clone_fields(model=None, app_label=None, model_name=None):
    """Model fields 복사하기

    :param model: django.db.models.Model
    :param app_label: Model._meta.app_label
    :param model_name: Model._meta.model_name
    :return:
    """
    if model:
        fields = model._meta.fields
    elif app_label:
        model = apps.get_model(app_label, model_name)
        fields = model._meta.fields
    else:
        fields = []
    return {field.get_attname(): field.clone() for field in fields}


def clone_model_meta_attrs(*attrs, model=None, app_label=None, model_name=None):
    """Model indexes 복사하기

    :param model: django.db.models.Model
    :param app_label: Model._meta.app_label
    :param model_name: Model._meta.model_name
    :return:
    """
    if not model:
        if app_label:
            model = apps.get_model(app_label, model_name)
        else:
            return {}

    meta = getattr(model, '_meta')
    meta_attrs = {}

    for attr in attrs:
        if not hasattr(meta, attr):
            continue

        meta_attr = getattr(meta, attr)

        if isinstance(meta_attr, (list, tuple)):
            items = []
            for item in meta_attr:
                if hasattr(item, 'clone'):
                    items.append(item.clone())
                elif hasattr(item, 'copy'):
                    items.append(item.copy())
                else:
                    items.append(item)
            meta_attrs[attr] = items
        else:
            meta_attrs[attr] = meta_attr

    return meta_attrs


def create_model(app_label,
                 fields=None,
                 module='',
                 object_name='',
                 meta_attrs=None):
    """Model 생성하기

    :param app_label: Model._meta.app_label
    :param fields: Model._meta.fields
    :param module:
    :param object_name: Model._meta.object_name
    :param meta_attrs:
    :return:
    """
    class Meta:
        pass

    if app_label:
        setattr(Meta, 'app_label', app_label)

    meta_attrs = meta_attrs or {}
    if isinstance(meta_attrs, dict):
        for k, v in meta_attrs.items():
            setattr(Meta, k, v)

    attrs = {
        '__module__': module if module else f"{app_label}.models",
        'Meta': Meta,
    }

    if not object_name:
        db_table = meta_attrs.get('db_table', '')
        object_name = ''.join((x.capitalize() for x in db_table.split('_')))
    if fields:
        attrs.update(fields)

    model = type(object_name, (Model,), attrs)
    meta = getattr(model, '_meta')

    for index in meta.indexes:
        # Warning: index name 재정의하기
        # - model._meta 의 db_table 과 (index.fields 와 관계된) field.column 에
        #   의해 정해짐 (동적으로 추상 테이블 생성시 index name 도 동적으로 변경 됨)
        # - 단, 변경이 없다면 index name 도 변하지 않는다 (추상 테이블 modeling 시 유용)
        index.set_name_with_model(model)

    return model


def downloader(filename='unknown', columns=None, data=None, extension=None,
               encoding='utf-8', auto_file_response=True, **kwargs):
    file_abspath = os.path.join(settings.ATTACH_ABSPATH,
                                f"{filename}{extension}")

    if extension == '.xls':
        excel = Excel(encoding=encoding)
        excel.add_sheet(columns=columns, data=data)
        excel.save(file_abspath)
    else:
        pass

    if auto_file_response:
        return FileResponse(open(file_abspath, 'rb'))
    else:
        return open(file_abspath, 'rb')


def get_abstract_model(app_label, model_name, *args, db_table_sep='_'):
    """추상 모델 생성하기

    :param app_label: Model.Meta.app_abel
    :param model_name: Model.Meta.model_name
    :param args: 추상 모델의 db_table, object_name 에 text 추가하기
    :param db_table_sep: args 로 추상 모델의 db_table 에 text 추가시 사용할 separator
    :return:
    """
    # 설정된 django project 안의 apps 중 참조할 Model 가져오기
    refer_to_model = apps.get_model(app_label, model_name)

    # 참조할 Model 기반으로 fields(schema 등) 복사하기
    cloned_fields = clone_fields(model=refer_to_model)

    # 참조할 Model 기반으로 Meta(constraint 등) 복사하기
    meta_attrs = clone_model_meta_attrs(
        *('db_table', 'ordering', 'indexes', 'object_name'),
        model=refer_to_model
    )

    # db_table: 실제 database 상의 table name 이며 매개변수에 의해 재정의하기
    meta_attrs['db_table'] += ''.join(f"{db_table_sep}{t}" for t in args if t)

    # object_name: 일반적으로 models.py 에 class 명에 의해 정의되고 Meta 볼 수 있다.
    # 즉, Meta 에서 만들어지는 부분이 아니므로 그대로 사용시 오류를 발생하기 때문에
    # object_name 을 pop 으로 제거하고 추후 매개변수에 의해 재정의하여 Model 정의시 사용하기
    object_name = meta_attrs.pop('object_name')

    # object_name 은 일반적인 camelcase rule 사용하기
    object_name += ''.join(arg.capitalize() for arg in args if arg)

    if object_name.lower() in apps.all_models[app_label]:
        # 동일한 모델 명 정의되는 경우 django 에서 아래와 같이 경고 메시지 출력한다.
        # "모델을 다시 불러올 경우 관련 모델과의 불일치가 발생할 수 있으므로 권장하지 않는다"
        # 이 때, 이미 정의된 models 을 불러오기
        return apps.get_registered_model(app_label, object_name.lower())
    else:
        return create_model(app_label,
                            fields=cloned_fields,
                            object_name=object_name,
                            meta_attrs=meta_attrs)


def get_abstract_models_by_period(app_label, model_name, *args,
                                  db_table_sep='_',
                                  start=None, stop=None, step=86400,
                                  period_fmt='%Y%m%d',
                                  ignore_not_exist_model=True):
    """기간별 추상 모델 생성하기"""
    if start:
        # start 값을 timestamp 로 변환하기
        if isinstance(start, dt):
            start_ = int(start.timstamp())
        elif isinstance(start, str):
            start_ = int(dt.fromisoformat(start).timestamp())
        elif isinstance(start, int):
            start_ = start
        else:
            raise TypeError
    else:
        # default
        start_ = 0

    if stop:
        # stop 값을 timestamp 로 변환하기
        if isinstance(stop, dt):
            stop_ = int(stop.timstamp())
        elif isinstance(stop, str):
            stop_ = int(dt.fromisoformat(stop).timestamp())
        elif isinstance(stop, int):
            stop_ = stop
        else:
            raise TypeError
    else:
        # default
        stop_ = int(dt.now().timestamp())

    # Deduplicate
    dates = sorted({
        dt.fromtimestamp(ts).strftime(period_fmt)
        for ts in range(start_, stop_, step)
    })
    models = []

    if dates:
        # 연결된 모든 database 내에 table names 가져오기
        table_names = connection.introspection.table_names()
        for date_ in dates:
            model = get_abstract_model(app_label, model_name, *args, date_,
                                       db_table_sep=db_table_sep)
            if is_exist_db_table(getattr(model, '_meta').db_table, table_names):
                # Exception: 연결된 모든 database 내에 table names 중
                # 해당 model 의 db_table 이 존재하지 않는 경우 무시하기
                models.append(model)
            elif ignore_not_exist_model:
                continue
            else:
                models.append(None)
    return models


def get_model_fields_name(model, include_many_to_many=False):
    """
    Model fields names 가져오기

    Warning: Model queryset values 시 include_many_to_many=True 인 경우
    record 가 중복되어 문제가 될 수 있다
    """
    model_fields_name = []
    meta = getattr(model, '_meta')
    for field in meta.get_fields():
        if field.many_to_many:
            if include_many_to_many:
                model_fields_name.append(field.name)
            else:
                continue
        elif hasattr(field, 'attname'):
            model_fields_name.append(field.attname)
        else:
            pass
    return model_fields_name


def is_exist_db_table(db_table, table_names=None):
    """db_table 명이 실제 database 에 있는지 확인하기"""
    return (connection.introspection.identifier_converter(db_table) in
            (table_names or connection.introspection.table_names()))


def deco_logging_to_auto_json_response(callback=None):
    def _decorator(func):
        @wraps(func)
        def wrapped_func(cls, request, auto_json_response=True, *args, **kwargs):
            result = func(cls, request, auto_json_response=False,
                          *args, **kwargs)
            if callback:
                callback(request, result, *args, **kwargs)
            if auto_json_response:
                return JsonResponse(**result)
            else:
                return result
        return wrapped_func
    return _decorator


def media_urlpatterns(prefix, view=serve, **kwargs):
    if not prefix:
        raise ImproperlyConfigured("Empty static prefix not permitted")
    return [re_path(r'^%s(?P<path>.*)$' % re.escape(prefix.lstrip('/')),
                    view, kwargs=kwargs)]


def setup_django(pythonpath, project_name):
    """Project 에 대한 path 와 settings 설정하기"""

    abspath = os.path.abspath(pythonpath)
    if os.path.exists(abspath):
        if abspath not in sys.path:
            sys.path.insert(0, abspath)
        os.environ.setdefault('DJANGO_SETTINGS_MODULE',
                              f"{project_name}.settings")
        setup()
    else:
        raise FileNotFoundError(
            f"django environment is not found: '{pythonpath}'")


def session_expiry_deco(callback=None):
    def _decorator(func):
        @wraps(func)
        def wrapped_func(cls, request, *args, **kwargs):
            session = request.session._session
            if session and session.get('_auth_user_id') == str(request.user.pk):
                return func(cls, request, *args, **kwargs)
            else:
                if callback:
                    return callback(request, *args, **kwargs)
                else:
                    return JsonResponse({
                        'success': False,
                        'errcode': 'SESSION_EXPIRED',
                    })
        return wrapped_func
    return _decorator


# def set_session_time(request):
#     setting_map = dict(Setting.objects.values_list("key", "value"))
#     session_check = int(setting_map.get('session_idle_time_check', '1'))
#     session_time = int(setting_map.get('session_idle_time', '3600'))
#
#     if session_check:
#         request.session.set_expiry(session_time)
#     else:
#         request.session.set_expiry(1209600)


class DateTimeFieldToChar(Func):
    """
    raw query:
        SELECT TO_CHAR(column, 'YYYY-MM-DD HH24:MI:SS')
        FROM table;
    """
    function = 'TO_CHAR'

    def __init__(self, *expressions, output_field=None,
                 fmt='YYYY-MM-DD HH24:MI:SS', **extra):
        self.template = f"%(function)s(%(expressions)s, '{fmt}')"
        output_field = output_field or CharField()
        super().__init__(*expressions, output_field=output_field, **extra)


class IntegerFieldToTimestampToChar(Func):
    """
    raw query:
        SELECT TO_CHAR(TO_TIMESTAMP(column), 'YYYY-MM-DD HH24:MI:SS')
        FROM table;
    """
    function = 'TO_CHAR'

    def __init__(self, *expressions, output_field=None,
                 fmt='YYYY-MM-DD HH24:MI:SS', **extra):
        self.template = f"%(function)s(TO_TIMESTAMP(%(expressions)s), '{fmt}')"
        output_field = output_field or CharField()
        super().__init__(*expressions, output_field=output_field, **extra)
