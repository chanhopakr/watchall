Ext.define('apps.store.arbor.ManagedObject', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.managedobject',

  proxy: {
    type: 'ajax',
    url: '/arbor/managed_object/read',

    reader: {
      type: 'json',
      rootProperty: 'data'
    },

    extraParams: {}
  }
});
