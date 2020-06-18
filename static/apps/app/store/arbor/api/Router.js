Ext.define('apps.store.arbor.api.Router', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.api.router',

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
    url: '/arbor/api/router/read',

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
