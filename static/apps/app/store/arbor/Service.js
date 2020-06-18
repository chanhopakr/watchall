Ext.define('apps.store.arbor.Service', {
  extend: 'Ext.data.Store',
  alias: 'store.arbor.service',

  autoLoad: true,

  fields: ['id', 'name', 'tags', 'description'],

  proxy: {
    type: 'memory',

    reader: {
      type: 'json',
      rootProperty: 'data'
    },

    data: [
      {
        id: '27',
        name: 'Internet',
        tags: 'service',
        description:
          'Default Service matching all default applications for all TMS ports.'
      }
    ]
  }
});
