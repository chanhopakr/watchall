Ext.define('apps.model.Session', {
  extend: 'Ext.data.Model',

  requires: ['Ext.data.proxy.Ajax', 'Ext.data.reader.Json'],

  idProperty: 'session_key',

  fields: [
    {
      name: 'session_key',
      type: 'string'
    },
    {
      name: 'expire_date',
      allowValue: null,
      defaultValue: null,
      convert: value => {
        return value ? new Date(value) : value;
      }
    },
    {
      name: 'user_id',
      type: 'int',
      allowNull: true,
      defaultValue: null
    },
    {
      name: 'username',
      type: 'string',
      defaultValue: ''
    },
    {
      name: 'is_superuser',
      type: 'boolean',
      defaultValue: false
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
      name: 'email',
      type: 'string',
      defaultValue: ''
    },
    {
      name: 'full_name',
      type: 'string',
      defaultValue: '',
      calculate: data => {
        return data.last_name + data.first_name;
      }
    },
    {
      name: 'department',
      type: 'string',
      defaultValue: ''
    },
    {
      name: 'group_name',
      type: 'string',
      defaultValue: ''
    }
  ],

  proxy: {
    type: 'ajax',
    api: {
      create: '/logout',
      read: '/session/get',
      update: '/session/put',
      destroy: '/logout'
    },
    reader: {
      type: 'json',
      rootProperty: 'data'
    },
    extraParams: {}
  }
});
