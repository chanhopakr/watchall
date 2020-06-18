Ext.define('apps.store.User', {
  extend: 'Ext.data.Store',
  alias: 'store.user',

  proxy: {
    type: 'ajax',
    // type: 'rest',
    // url: '/user',
    url: '/user/read',
    reader: {
      type: 'json',
      rootProperty: 'data'
    },
    extraParams: {
      // 계정 삭제 여부
      is_delete: false,

      // 계정 승인 여부, multi 정보 보기시 사용
      not_approve: false
    }
  }
});
