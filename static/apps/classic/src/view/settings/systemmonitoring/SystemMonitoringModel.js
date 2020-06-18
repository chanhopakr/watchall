Ext.define('apps.view.settings.systemmonitoring.SystemMonitoringModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.systemmonitoring',

  requires: ['apps.store.System'],

  stores: {
    systems: {
      type: 'systems',
      storeId: 'system',
      autoLoad: true,

      listeners: {
        beforeload: 'onBeforeloadResource'
      }
    }
  },

  data: {}
});
