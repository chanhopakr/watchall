import json
import re

from django.db.models import Q
from django.http import QueryDict
from django.http.response import JsonResponse
from django.shortcuts import redirect
from django.views.generic.base import View, TemplateView

from .utils import kwargs_json_parse
from .django.utils import get_model_fields_name


def http_method_not_allowed(request, *args, **kwargs):
    return redirect('/')


class BaseTemplateView(TemplateView):
    title = ''
    main_hash = ''

    def get(self, request, *args, **kwargs):
        user = request.user
        kwargs.update({
            'main_hash': self.main_hash,
            'title': self.title
        })
        return super(BaseTemplateView, self).get(self, request, *args, **kwargs)


class BaseGenericView(View):
    def dispatch(self, request, *args, **kwargs):
        """
        Override
        """
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


class BaseModelView(View):
    model = None

    @staticmethod
    def serialize(*args, **kwargs):
        pass

    def dispatch(self, request, *args, **kwargs):
        """
        Override
        """
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

    def read(self, request, *args, pk=None, annotates=None, excludes=None,
             filters=None, orders=None, values=None, groups=None,
             start=None, limit=None,
             is_distinct=False, is_overwrite_values=True, is_queryset=False,
             auto_json_response=True, **kwargs):
        """
        :param request:
        :param args:
        :param pk: 데이터중 primary key 로만 보기
        :param annotates: 조건을 이용해 데이터의 fields 를 가공하여 새로운 field 생성하기, 통계 등
        :param excludes: 데이터 예외 처리하기, [Q.OR: {Q.AND}, {Q.AND}], WHERE NOT
                         Example: .filter(Q(A=1, B='b') | Q(A=2, B='bb'))
        :param filters: 데이터 filtering, [Q.OR: {Q.AND}, {Q.AND}], WHERE
                        복잡한 filtering 에 사용
                        Example: .filter(Q(A=1, B='b') | Q(A=2, B='bb'))
        :param orders: 데이터 정렬하기, ORDER BY
        :param values: 해당 값과 동일한 fields 의 데이터 보기, SELECT
        :param groups: 데이터 집합 처리하기, GROUP BY
                       is_overwrite_values 활성화하기
                       is_queryset 비활성하기
        :param start: 데이터 slice start
        :param limit: 데이터 slice limit
        :param is_distinct: 데이터 중복 제거하기
        :param is_overwrite_values: annotates 사용시 가공된 field 명과 가 이미 사용중인
                                    field 명 충돌을 피하기
                                    (M.annotate() -> M.values().annotate())
        :param is_queryset: 마지막 데이터 결과를 queryset 으로 반환하기
        :param auto_json_response: 자동으로 데이터 결과를 JsonResponse 로 반환하기
        :param kwargs: 데이터 filtering, WHERE
                       Example: .filter(A=1, B='b')
        :return:
        """
        if groups:
            is_overwrite_values = True
            is_queryset = False  # group by 시 queryset 으로 반환할 수 없다

        if is_queryset is True:
            # queryset 의 .values() method 에 의해 records 가 dict 로 변환되지 않게 하기
            is_overwrite_values = False
            # 마지막 데이터 결과를 django.http.JsonResponse 을 통해 보내지 않기
            auto_json_response = False

        # Initial, model 안 records 중 primary pk 로 지정된 field 를 찾으므로 pk 를 권장
        if pk and isinstance(pk, str):
            pk_ = int(pk)
        elif 'id' in kwargs:
            pk_ = kwargs['id']
        else:
            pk_ = pk or None

        # Initial
        if annotates:
            if isinstance(annotates, str):
                annotates_ = json.loads(annotates)
            else:
                annotates_ = annotates

            if isinstance(annotates_, dict):
                # 다중 annotates 처리하기, 통계에서 사용
                annotates_ = [annotates_]
            elif isinstance(annotates_, (list, tuple)):
                pass
            else:
                # Exception: Set default
                annotates_ = []
        else:
            annotates_ = []

        # Initial
        if excludes:
            excludes_ = Q()
            # Example:
            # [OR: {AND}, {AND}] = [{'field1': 1, 'field2': 2}, {'field1': 11}]
            temp = json.loads(excludes) if isinstance(excludes, str) else excludes
            if isinstance(temp, dict):
                temp = [temp]
            if isinstance(temp, (list, tuple)):
                for t in temp:
                    if isinstance(t, dict):
                        excludes_ |= Q(**t)  # Q.OR |= Q.AND
        else:
            excludes_ = Q()

        # Initial
        if filters:
            filters_ = Q()
            # Example:
            # [OR: {AND}, {AND}] = [{'field1': 1, 'field2': 2}, {'field1': 11}]
            temp = json.loads(filters) if isinstance(filters, str) else filters
            if isinstance(temp, dict):
                temp = [temp]
            if isinstance(temp, (list, tuple)):
                for t in temp:
                    if isinstance(t, dict):
                        filters_ |= Q(**t)  # Q.OR |= Q.AND
        else:
            filters_ = Q()

        # Initial
        if orders and isinstance(orders, str):
            orders_ = [orders]
        else:
            orders_ = orders or getattr(self.model, '_meta').ordering or []

        # Initial
        if start and isinstance(start, str):
            start_ = int(start)
        else:
            start_ = start or 0

        # Initial
        if limit and isinstance(limit, str):
            limit_ = int(limit)
        else:
            limit_ = limit or 0

        # Initial
        if values:
            values_ = [values] if isinstance(values, str) else values
        else:
            # values 값이 없는 경우 model 의 field 명을 가져와 대입하기
            values_ = get_model_fields_name(self.model)

            if annotates_ and isinstance(annotates_, (list, tuple)):
                # annotates 값이 있는 경우 동적으로 가공될 field 명을 가져와 추가하기
                for an in annotates_:
                    values_.extend(an.keys())

        if is_overwrite_values:
            # annotates 를 통해 가공된 field 명이 이미 정의된 field 명과 충돌을 피하기 위해
            # .annotates() 호출전에 .values()를 먼저 실행하기
            if groups:
                records = self.model.objects.values(*groups)
            else:
                records = self.model.objects.values()
        else:
            records = self.model.objects.all()

        if annotates_ and isinstance(annotates_, (list, tuple)):
            # Start queryset annotate
            for an in annotates_:
                records = records.annotate(**an)

        records = records.exclude(
            excludes_
        ).filter(
            filters_, **kwargs
        ).order_by(
            *orders_
        )

        if pk_:
            # first() 사용하기(편의성):
            #   get(pk=pk) 사용시 queryset 의 values method 를 사용할 수 없음
            #   get() 과 first() 의 raw query 확인시 거의 차이 없음
            if is_queryset:
                data = records.first()
            else:
                data = records.values(*values_).first()

            total = 1 if data else 0
        else:
            if is_distinct:
                # 중복 제거
                records = records.distinct()

            # slicing 전 total 계산하기
            if is_distinct or groups:
                total = records.values(*values_).count()
            else:
                total = records.count()

            if start_ or limit_:
                records = records[start_:start_+limit_]

            if is_queryset:
                data = records
            else:
                data = list(records.values(*values_))

        if auto_json_response:
            return JsonResponse({
                'success': True,
                'data': data,
                'total': total,
            })
        else:
            # Docs(excel, ..) download 또는 sub query 를 사용을 위해
            return True, data, total

    def create(self, request, *args, auto_json_response=True, **kwargs):
        """"""
        if 'id' in kwargs:
            # ExtJS 로부터 전달 받은 임시 id 로써 사용하지 않아 제거하기
            kwargs.pop('id')

        success = False
        errors = []
        pk = None
        record = None

        try:
            record = self.model.objects.create(**kwargs)
        except Exception as e:
            errors.append(str(e).replace('\n', '<br/>'))
        else:
            success = True
            pk = record.id
        finally:
            if auto_json_response:
                return JsonResponse({
                    'success': success,
                    'errors': errors,
                    'pk': pk
                })
            else:
                return success, errors, pk, record

    def update(self, request, *args, auto_json_response=True, **kwargs):
        success = False
        errors = []
        pk = None
        record = None
        count = 0

        try:
            pk = kwargs.pop('id')
            if isinstance(pk, (list, tuple)):
                record = self.model.objects.filter(pk__in=pk)
                count = record.update(**kwargs)
            else:
                record = self.model.objects.get(pk=pk)
                record.__dict__.update(**kwargs)
                record.save()
                count = 1
        except KeyError:
            errors.append('내용을 선택하십시오.')
        except Exception as e:
            errors.append(str(e).replace('\n', '<br/>'))
        else:
            success = True
        finally:
            if auto_json_response:
                return JsonResponse({
                    'success': success,
                    'errors': errors,
                    'pk': pk,
                    'count': count
                })
            else:
                return success, errors, pk, record, count

    def delete(self, request, *args, auto_json_response=True, **kwargs):
        success = False
        errors = []
        count = 0

        try:
            pk = kwargs.pop('id')

            if isinstance(pk, (list, tuple)):
                records = self.model.objects.filter(pk__in=pk)
                count, _ = records.delete()
            else:
                record = self.model.objects.get(pk=pk)
                count, _ = record.delete()
        except self.model.DoesNotExist:
            errors.append('해당 모델이 존재하지 않습니다.')
        except KeyError:
            errors.append('내용을 선택하십시오.')
        except Exception as e:
            errors.append(str(e).replace('\n', '<br/>'))
        else:
            success = True
        finally:
            if auto_json_response:
                return JsonResponse({'success': success, 'count': count})
            else:
                return success, count

    get = read
    post = create
    put = update
