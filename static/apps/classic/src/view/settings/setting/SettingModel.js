Ext.define('apps.view.settings.setting.SettingModel', {
  extend: 'Ext.app.ViewModel',
  alias: 'viewmodel.setting',

  stores: {
    admins: {
      type: 'user',
      autoLoad: true,
      pageSize: 0,
      fields: [
        'username',
        'email',
        {
          name: 'display',
          calculate: data => `${data.username} (${data.email})`
        }
      ],
      proxy: {
        extraParams: {
          is_superuser: true
        }
      }
    },
    templates: {
      type: 'emailtemplate',
      autoLoad: true,
      pageSize: 0,
      fields: [
        'name',
        {
          name: 'display',
          calculate: data => `${data.name}`
        }
      ]
    }
  },

  data: {
    record: {}
  },
  formulas: {
    isSession: get => get('record.session_idle_time_check') === '0'
  }
});
