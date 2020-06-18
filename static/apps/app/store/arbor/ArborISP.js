// TODO: 필요한가?
Ext.define('ixmas.store.arbor.ArborISP', {
  extend: 'Ext.data.Store',

  alias: 'store.arbor_isp',

  proxy: {
    type: 'ajax',
    url: '/combo/arbor_isp',
    reader: { type: 'json', rootProperty: 'data' }
  }
});
