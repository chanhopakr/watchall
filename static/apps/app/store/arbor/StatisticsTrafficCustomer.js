Ext.define('apps.store.arbor.StatisticsTrafficCustomer', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.statisticstrafficcustomer',

  proxy: {
    type: 'ajax',
    url: '/arbor/statistics/traffic/customer/read',

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
