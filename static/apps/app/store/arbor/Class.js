Ext.define('apps.store.arbor.Class', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.class',

  requires: ['Ext.data.reader.Array'],

  autoLoad: true,

  fields: ['value', 'display'],

  proxy: {
    type: 'memory',

    reader: {
      type: 'array'
    },

    data: [['in', 'In'], ['out', 'Out'], ['total', 'Total']]
  }
});
