Ext.define('apps.proxy.API', {
  extend: 'Ext.data.proxy.Ajax',
  alias: 'proxy.api',

  reader: {
    type: 'json',
    rootProperty: 'data',
    totalProperty: 'totalCount'
  }
});
