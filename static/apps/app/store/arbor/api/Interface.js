Ext.define('apps.store.arbor.api.Interface', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.api.interface',

  fields: [
    'gid',
    {
      name: 'id',
      mapping: 'gid',
      type: 'string'
    }
  ],

  proxy: {
    type: 'ajax',
    url: '/arbor/api/interface/read',

    reader: {
      type: 'json',
      rootProperty: 'data'
    },

    extraParams: {
      /**
       * Examples:
       *   filter='name:I tag:customer,profile'
       *   filter='name:I, tag:customer,profile'
       */
      filters: '',
      limit: 1000
    }
  }
});
