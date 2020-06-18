Ext.define('apps.store.arbor.TrafficCustomer', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.trafficcustomer',

  fields: [
    {
      name: 'startTimestamp',
      type: 'int',
      mapping: 'start',
      defaultValue: 0
    },
    {
      name: 'start',
      type: 'date',
      dateFormat: 'timestamp'
    }
  ],

  proxy: {
    type: 'ajax',
    url: '/arbor/traffic/customer/read',

    reader: {
      type: 'json',
      rootProperty: 'data'
    },

    extraParams: {
      /**
       * @requires django model_name
       */
      model_name: null
    }
  }
});
