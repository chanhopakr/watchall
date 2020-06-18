Ext.define('apps.store.arbor.TMS', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.tms',

  requires: ['Ext.data.reader.Array'],

  autoLoad: true,

  fields: ['id', 'name', 'tags', 'description'],

  proxy: {
    type: 'memory',

    reader: {
      type: 'array'
    },

    data: []
  }
});
