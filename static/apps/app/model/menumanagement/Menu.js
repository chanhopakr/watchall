Ext.define('apps.model.menumanagement.Menu', {
  extend: 'Ext.data.Model',

  requires: ['Ext.data.validator.Length', 'Ext.data.validator.Url'],

  fields: [
    { name: 'id', type: 'int' },
    { name: 'name', type: 'string' },
    { name: 'target', type: 'string' },
    { name: 'href', type: 'string' },
    { name: 'icons', type: 'string' },
    { name: 'desc', type: 'string' }
  ],

  validators: {
    name: {
      type: 'length',
      min: 2,
      max: 64
    },
    target: {
      type: 'length',
      max: 200
    },
    url: [
      {
        type: 'url'
        // TODO
        // allowNull: true  // override
      },
      {
        type: 'length',
        max: 200,
        min: 0
      }
    ],
    icon: {
      type: 'length',
      max: 200
    },
    desc: {
      type: 'length',
      max: 256
    }
  }
});
