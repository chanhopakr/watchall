Ext.define('apps.view.settings.user.UserModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.user',
  requires: ['apps.store.Active', 'apps.store.Authority', 'apps.store.User'],

  stores: {
    actives: {
      type: 'active'
    },
    authorities: {
      type: 'authority'
    },
    users: {
      type: 'user',
      autoLoad: true,
      listeners: {
        beforeload: 'onBeforeload'
      }
    }
  },

  data: {}
});
