from django.urls import path, re_path

from .views import (
    base, navigation, session
)

app_name = 'watchall'

urlpatterns = [
    # re_path(r'monitoring/system_status/(\w*)$',
    #         monitoring.SystemStatusView.as_view(),
    #         name='system_status'),
    re_path(r'session/(\w*)$',
            session.SessionView.as_view(),
            name='session'),
    path('navigation/<int:id>',
         navigation.NavigationView.as_view(),
         name='navigation'),
    path('watchall',
         base.ProductionTemplateView.as_view(),
         name='production'),
    path('development',
         base.DevelopmentTemplateView.as_view(),
         name='development'),
    path('logout', base.logout_view, name='logout'),
    path('signup', base.SignUpView.as_view(), name='signup'),
    path('signin', base.SignInView.as_view(), name='signin'),
    path('', base.SignInView.as_view(), name='index'),
]
