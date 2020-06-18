r"""navigation control

Examples:
    NAVIGATION_DEFAULT_CHILDREN = [
        {
            'text': '데이터 재처리',
            'target': 'sync',
            'iconCls': 'x-fa fa-repeat',
            'children': [
                {
                    'text': '트래픽 연동 재처리',
                    'target': 'datasynchronizehistory',
                    'iconCls': 'x-fa fa-line-chart',
                    'leaf': True,
                    'tabConfig': {
                        'tooltip': {
                            'text': (
                                "※데이터 재처리는 특정시간대 고객별 트래픽 데이터를 재수집하기 위한 기능입니다.<br>"
                                f"{'&nbsp;' * 3} - APITA는 고객별 트래픽 데이터를 5분 주기로 연동하며, 특정시간에 연동을 실패하면 이후시간에 이전시간의 데이터까지 같이 연동합니다.<br>"
                                f"{'&nbsp;' * 3} - 수집된 데이터에 이슈가있어 재수집할 때 이용하는 기능입니다.<br>"
                                f"{'&nbsp;' * 3} - 재처리 대상은 '5분 데이터'와 '일 통계' 데이터가 있고, '5분 데이터'를 재처리 하였을때는 '일 통계'를 수동으로 재처리하여 데이터정합성을 보장해야 합니다."
                            ),
                            'dismissDelay': DELAY,
                            'maxWidth': WIDTH
                        }
                    }
                },
            ]
        },
    ]
"""
from django.http import JsonResponse

from .base import WatchAllGenericView

WIDTH = 1200
DELAY = 60000

NAVIGATION_DEFAULT_CHILDREN = [
    {
        'text': 'Home',
        'target': 'home',
        'iconCls': 'x-fa fa-repeat',
        'children': []
    },
]


class NavigationView(WatchAllGenericView):
    def get(self, request, *args, **kwargs):
        # menu_auth_id = request.user.menu_auth_id
        try:
            # if not menu_auth_id:
            #     raise Exception('해당 계정은 권한이 없습니다.')
            #
            # menus = MenuAuthorization.objects.get(id=menu_auth_id).menu_set.all()
            #
            # for menu in cache_tree_children(menus):
            #     children = menu.recursive_to_dict()['children']
            #     break
            # else:

            if request.user.is_staff and not request.user.is_superuser:
                customer_menu = ['statistics', 'api']
                children=list(item for item in NAVIGATION_DEFAULT_CHILDREN if item.get('target') in customer_menu)
            else:
                children = NAVIGATION_DEFAULT_CHILDREN

        # except MenuAuthorization.DoesNotExist:
        #     return {'success': False, 'children': [], 'errors': '해당 계정은 권한이 없습니다.'}
        except Exception as e:
            errors = str(e).replace('\n', '<br/>')
            return JsonResponse({
                'success': False,
                'children': [],
                'errors': errors,
            })
        else:
            return JsonResponse({'success': True, 'children': children})
