Ext.define('apps.store.Authority', {
  extend: 'Ext.data.Store',
  alias: 'store.authority',

  fields: ['value', 'display', 'is_superuser', 'is_staff'],

  pageSize: 0,

  data: [
    {
      value: '',
      display: '전체'
    },
    {
      value: 'master',
      display: '최고 관리자',
      is_superuser: true,
      is_staff: true
    },
    {
      value: 'admin',
      display: '일반 관리자',
      is_superuser: false,
      is_staff: true
    },
    {
      value: 'user',
      display: '고객',
      is_superuser: false,
      is_staff: false
    }
  ]
});
