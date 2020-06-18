Ext.define('apps.model.Setting', {
  extend: 'Ext.data.Model',

  requires: ['Ext.data.proxy.Ajax', 'Ext.data.reader.Json'],

  fields: [
    { name: 'threshold_cpu', defaultValue: 1 },
    { name: 'threshold_memory', defaultValue: 1 },
    { name: 'threshold_swap', defaultValue: 1 },
    { name: 'threshold_disk', defaultValue: 1 },
    { name: 'auth_fail_action', defaultValue: 'delay' },
    { name: 'auth_fail_count', defaultValue: 5 },
    { name: 'auth_block_time', defaultValue: 5 },
    { name: 'session_idle_time_check', defaultValue: '1' },
    { name: 'session_idle_time', defaultValue: 3600 },
    { name: 'passwd_alpha', type: 'boolean', defaultValue: true },
    { name: 'passwd_number', type: 'boolean', defaultValue: true },
    { name: 'passwd_special', type: 'boolean', defaultValue: true },
    { name: 'passwd_length', defaultValue: 7 }
  ],

  proxy: {
    type: 'ajax',
    api: {
      create: '/setting/create',
      read: '/setting/read',
      update: '/setting/update',
      destroy: '/setting/delete'
    },
    reader: {
      type: 'json',
      rootProperty: 'data'
    }
  }
});
