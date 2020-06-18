Ext.define('Admin.overrides.data.proxy.Ajax', {
  override: 'Ext.data.proxy.Ajax',

  config: {
    actionMethods: {
      create: 'POST',
      read: 'POST',
      update: 'POST',
      destroy: 'POST'
    }
  },

  defaultActionMethods: {
    create: 'POST',
    read: 'POST',
    update: 'POST',
    destroy: 'POST'
  },

  pageParam: '',

  reader: { messageProperty: 'errMsg' },

  listeners: {
    exception: function(proxy, request, operation) {
      const message = operation.getError();
      if (typeof message === 'string') {
        Ext.Msg.alert('알림', message);
      }
    }
  }
});
