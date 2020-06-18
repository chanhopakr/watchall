from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    pass
    department = models.CharField(max_length=256, blank=True)
    description = models.TextField(blank=True)
    update_time = models.DateTimeField(auto_now=True)
    phone = models.CharField(max_length=32, blank=True)
    login_fail_cnt = models.IntegerField(
        default=0, help_text="비밀번호 실패한 횟수")
    login_fail_time = models.IntegerField(
        default=0, help_text="비밀번호 실패 발생한 시간")
    password_change_time = models.IntegerField(
        null=True, help_text="비밀번호 변경한 시간")
    password_change_delay_time = models.IntegerField(
        default=300, help_text="비밀번호 변경을 유예한 시간")
    is_delete = models.BooleanField(default=False)

    def __str__(self):
        return f'{self.username}'

    class Meta:
        ordering = ['username']


class Setting(models.Model):
    key = models.CharField(max_length=64, unique=True)
    value = models.TextField(blank=True)

    def __str__(self):
        return f'{self.key}: {self.value}'
