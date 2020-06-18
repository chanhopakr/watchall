Ext.define('apps.store.arbor.TrafficCustomerCategory', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.trafficcustomercategory',

  fields: [
    {
      name: 'value',
      type: 'string'
    },
    {
      name: 'display',
      type: 'string',
      convert: function(value) {
        if (value === '전체') {
          return `${value}트래픽`;
        } else {
          return `${value}별 트래픽`;
        }
      }
    }
  ],

  proxy: {
    type: 'ajax',
    url: '/arbor/traffic/customer/category/read',

    reader: {
      type: 'json',
      rootProperty: 'data'
    }
  }
});
