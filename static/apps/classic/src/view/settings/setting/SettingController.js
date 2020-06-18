Ext.define('apps.view.settings.setting.SettingController', {
  extend: 'Ext.app.ViewController',
  alias: 'controller.setting',

  requires: ['apps.model.Setting'],

  onSave: function(cmp) {
    const record = this.getViewModel().get('record');
    record.save({
      failure: (record, operation) => {
        const resp = JSON.parse(operation.getResponse().responseText);
        const { errors } = resp;
        let message = '';

        if (errors) {
          if (errors instanceof Array) {
            message = errors.join('<br/>');
          } else {
            message = errors;
          }
        } else {
          message = resp;
        }
        Ext.Msg.alert('알림', message);
      },
      success: () => {
        Ext.Msg.alert('알림', '저장되었습니다.');
      },
      callback: () => {}
    });
  },

  onRefresh: function(cmp) {
    const panel = cmp.up('panel');
    const model = this.getViewModel().get('record');

    /* global apps */
    if (model && model instanceof apps.model.Setting) {
      panel.setLoading(true);
      model.load({
        callback: () => panel.setLoading(false)
      });
    }
  },

  onBoxreadySetting: function() {
    const vm = this.getViewModel();
    vm.set('record', apps.model.Setting.load());
  }
});
