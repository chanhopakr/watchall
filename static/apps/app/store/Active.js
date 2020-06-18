Ext.define('apps.store.Active', {
  extend: 'Ext.data.Store',
  alias: 'store.active',

  fields: ['value', 'display'],
  pageSize: 0,

  data: [
    {
      value: '',
      display: '전체'
    },
    {
      value: false,
      display: '사용안함'
    },
    {
      value: true,
      display: '사용'
    }
  ]
});
