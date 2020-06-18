Ext.define('apps.store.arbor.Unit', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.unit',

  requires: ['Ext.data.reader.Array'],

  autoLoad: true,
  pageSize: 0,

  fields: ['value', 'display'],

  proxy: {
    type: 'memory',

    reader: {
      type: 'array'
    },

    data: [
      ['bps', 'bps'],
      ['pps', 'pps'],
      ['Bps', 'Bps'],
      ['Bps', 'Bytes'],
      ['pps', 'Packets']
    ]
  }
});
