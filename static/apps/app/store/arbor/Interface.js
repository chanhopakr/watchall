Ext.define('apps.store.arbor.Interface', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.interface',

  proxy: {
    type: 'ajax',
    url: '/arbor/interface/read',

    reader: {
      type: 'json',
      rootProperty: 'data'
    },

    extraParams: {}
  }
});
