Ext.define('apps.store.arbor.TrafficCountryChart', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.trafficcountrychart',

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
    url: '/arbor/traffic_country/traffic_chart',

    reader: {
      type: 'json',
      rootProperty: 'data'
    },

    extraParams: {
      /**
       * @requires django model_name
       */
    }
  }
});
