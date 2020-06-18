Ext.define('apps.store.arbor.api.ManagedObject', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.api.managedobject',

  proxy: {
    type: 'ajax',
    url: '/arbor/api/managed_object/read',

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
