import os
import time
import json
from datetime import datetime as dt
from django.conf import settings
from django.core.mail import send_mail
from zen.common import rrd, timeutil
from zen.rpc4django import rpcmethod

# from apps.cpmas.models import SystemStatus, EventHistory, Setting, EmailTemplate, Email, User


# @rpcmethod(name='insert_system_resources')
# def insert_system_resources(data):
#     hostname = data['hostname']
#     cpu = data['cpu']
#     mem = data['mem']
#     swap = data['swap']
#     disk = data['disk']
#     now = int(time.time())
#     try:
#         path = os.path.join(settings.RRD_DIR, hostname)
#
#         rrd.CPU(path, now, cpu, step=300)
#         rrd.Memory(path, now, mem, step=300)
#         rrd.Swap(path, now, swap, step=300)
#         rrd.Disk(path, now, disk, step=300)
#
#         SystemStatus.objects.create(
#             hostname=hostname,
#             description=json.dumps(data)
#         )
#         _check_threshold(data)
#     except:
#         import traceback
#         traceback.print_exc(file=open('/tmp/resources.log', 'a'))
#         return False
#     else:
#         return True
#
#
# def _check_threshold(data):
#     threshold = {
#         key: int(value)
#         for key, value in Setting.objects.filter(key__in=[
#             'threshold_cpu', 'threshold_memory',
#             'threshold_swap', 'threshold_disk'
#         ]).values_list('key', 'values')
#     }
#     cpu = data['cpu']['user'] + data['cpu']['kernel']
#     if cpu > threshold['threshold_cpu']:
#         EventHistory.objects.get_or_create(
#             event_type='resource',
#             event_name='CPU 임계치 초과',
#             defaults={'description': 'CPU 사용률: %d %% (설정: %d %%)' % (cpu, threshold['threshold_cpu'])}
#         )
#         success, errors, email = make_email_system_resources(data, 'CPU', threshold['threshold_cpu'])
#         if success:
#             send_email_system_resources(email)
#         else:
#             raise Exception(errors)
#
#     mem = (float(data['mem']['used']) / float(data['mem']['total']) * 100)
#     if float(mem) > threshold['threshold_memory']:
#         EventHistory.objects.get_or_create(
#             event_type='resource',
#             event_name='MEMORY 임계치 초과',
#             defaults ={'description': 'Memory 사용률: %d %% (설정: %d %%)' % (int(mem), threshold['threshold_memory'])}
#         )
#         success, errors, email = make_email_system_resources(data, 'Memory', threshold['threshold_memory'])
#         if success:
#             send_email_system_resources(email)
#         else:
#             raise Exception(errors)
#
#     for mount, (percent, bytes) in data['disk'].items():
#         if percent > threshold['threshold_disk']:
#             EventHistory.objects.get_or_create(
#                 event_type='resource',
#                 event_name='DISK 임계치 초과',
#                 defaults={'description': 'Disk(%s) 사용률: %d %% (설정: %d %%)' % (mount, percent, threshold['threshold_disk'])}
#             )
#             success, errors, email = make_email_system_resources(data, 'Disk(%s)', threshold['threshold_disk'])
#             if success:
#                 send_email_system_resources(email)
#             else:
#                 raise Exception(errors)
#
#
# def make_email_system_resources(data, type, threshold):
#     hostname = data['hostname']
#     template_name = '시스템 리소스 이벤트 알림'
#
#     try:
#         template = EmailTemplate.objects.get(name=template_name)
#         sender_id = Setting.objects.get(key='email_receiver').value
#         user = User.objects.get(id=sender_id)
#         recipient_email = user.email
#         recipient_username = user.username
#         content = template.description.format(**{
#             'hostname': hostname,
#             'time': dt.now().strftime('%Y-%m-%d %H:%M:%S'),
#             'type': type,
#             'threshold': threshold,
#         })
#
#         email = Email.objects.create(
#             template_name=template_name,
#             subject=f"[{hostname}] Resource 이벤트 탐지",
#             contents=content,
#             sender_username=settings.EMAIL_USERNAME,
#             sender_email=settings.EMAIL_HOST_USER,
#             recipient_username=recipient_username,
#             recipient_email=recipient_email,
#         )
#     except EmailTemplate.DoesNotExist:
#         return False, f"등록된 {template_name} 이메일 템플릿이 존재하지 않습니다.", None
#     except Setting.DoesNotExist:
#         return False, '등록된 시스템 관리자가 존재하지 않습니다.', None
#     except User.DoesNotExist:
#         return False, '선택된 시스템 관리자가 존재하지 않습니다.', None
#     else:
#         return True, None, email
#
#
# def send_email_system_resources(email):
#     try:
#         send_mail(
#             email.subject,
#             email.content,
#             settings.EMAIL_USERNAME,
#             [email.recipient_email],
#             fail_silently=False
#         )
#     except Exception as e:
#         email.status = 'failure'
#     else:
#         email.status = 'success'
#     finally:
#         email.save()
#
