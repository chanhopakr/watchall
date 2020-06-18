Ext.define('apps.store.NavigationTree', {
  extend: 'Ext.data.TreeStore',
  storeId: 'NavigationTree',

  requires: ['Ext.data.proxy.Rest'],

  fields: [
    {
      name: 'text',
      type: 'string',
      mapping: 'name'
    },
    {
      name: 'viewType',
      type: 'string',
      mapping: 'target'
    },
    {
      name: 'iconCls',
      type: 'string',
      mapping: 'icons'
    }
  ],

  autoLoad: true,
  proxy: {
    type: 'rest',
    url: '/navigation',
    reader: {
      type: 'json',
      rootProperty: 'children'
    }
  },

  root: {
    id: '0',
    expanded: true
  }
});
