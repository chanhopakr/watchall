Ext.define('apps.store.arbor.api.Traffic', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.api.traffic',

  /**
   * Arbor API 의 parameter 에서 limit 값을 지정한다
   */
  pageSize: 100,

  fields: [
    'in_value',
    'out_value',
    'unit',
    {
      name: 'total',
      type: 'int',
      calculate: data => data.in_value + data.out_value
    }
  ],

  proxy: {
    type: 'ajax',
    url: '/arbor/api/traffic/read',
    reader: {
      type: 'json',
      rootProperty: 'data',
      keepRawData: true
    }
  }
});
