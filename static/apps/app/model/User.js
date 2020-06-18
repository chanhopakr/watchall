Ext.define('apps.model.User', {
  extend: 'Ext.data.Model',

  requires: [
    'Ext.data.proxy.Ajax',
    // 'Ext.data.proxy.Rest',
    'Ext.data.reader.Json'
  ],

  fields: [
    {
      name: 'id',
      allowNull: true,
      defaultValue: null
    },
    {
      name: 'username',
      type: 'string',
      defaultValue: ''
    },
    {
      name: 'first_name',
      type: 'string',
      defaultValue: ''
    },
    {
      name: 'last_name',
      type: 'string',
      defaultValue: ''
    },
    {
      name: 'last_login',
      type: 'date',
      allowNull: true,
      defaultValue: null
    },
    {
      name: 'password',
      type: 'string',
      defaultValue: ''
    },
    {
      name: 'email',
      type: 'string',
      defaultValue: ''
    },
    {
      name: 'is_active',
      type: 'boolean',
      defaultValue: false
    },
    {
      name: 'is_superuser',
      type: 'boolean',
      defaultValue: false
    },
    {
      name: 'is_staff',
      type: 'boolean',
      defaultValue: false
    },
    {
      name: 'department',
      type: 'string',
      defaultValue: ''
    },
    {
      name: 'description',
      type: 'string',
      defaultValue: ''
    },
    {
      name: 'mo_id',
      type: 'integer',
      allowNull: true,
      defaultValue: null
    },
    {
      name: 'phone',
      type: 'string',
      defaultValue: ''
    },
    {
      name: 'update_time',
      type: 'date',
      allowNull: true,
      defaultValue: null
    },
    {
      name: 'countries',
      defaultValue: []
    }
  ],

  proxy: {
    type: 'ajax',
    // type: 'rest',
    // url: '/user',
    api: {
      create: '/user/create',
      read: '/user/read',
      update: '/user/update',
      destroy: '/user/delete'
    },
    reader: {
      type: 'json',
      rootProperty: 'data'
    }
  }
});
