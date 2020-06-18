Ext.define('apps.store.arbor.TrafficCountry', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.trafficcountry',

  proxy: {
    type: 'ajax',
    url: '/arbor/traffic_country/read',

    reader: {
      type: 'json',
      rootProperty: 'data'
    },

    extraParams: {}
  }
});
