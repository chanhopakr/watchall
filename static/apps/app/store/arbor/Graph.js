Ext.define('apps.store.arbor.Graph', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.graph',

  requires: ['Ext.data.reader.Array'],

  autoLoad: true,

  fields: ['value', 'display'],

  proxy: {
    type: 'memory',

    reader: {
      type: 'array'
    },

    data: [['Stacked', '스택'], ['Bar', '막대'], ['Pie', '원형']]
  }
});
