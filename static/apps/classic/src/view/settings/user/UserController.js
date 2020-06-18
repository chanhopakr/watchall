Ext.define('apps.view.settings.user.UserController', {
  extend: 'apps.app.ViewController',
  alias: 'controller.user',

  requires: [],

  uses: ['apps.model.User', 'apps.view.settings.user.UserWindow'],

  init: function() {},

  onSearch: function() {
    const grid = this.lookupReference('usersGrid');
    grid.getStore().load();
  },

  onCreate: function(cmp) {
    const panel = cmp.up('panel');

    Ext.create('apps.view.settings.user.UserWindow', {
      title: cmp.getText() || cmp.tooltip,
      viewModel: {
        data: {
          mode: cmp.getItemId(),
          record: Ext.create('apps.model.User', {}) // default
        }
      },
      listeners: {
        close: function() {
          const refresh = this.getViewModel().get('refresh');

          if (panel && refresh) {
            panel.getStore().load();
          }
        }
      }
    }).show();
  },

  onUpdate: function(cmp) {
    const me = this;
    const panel = cmp.up('panel');
    const { selection } = panel;

    /* global apps */
    apps.model.User.load(selection.get('id'), {
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
      success: function(record) {
        const isSuperuser = record.get('is_superuser');
        const isStaff = record.get('is_staff');
        const authorities = me.getViewModel().getStore('authorities');
        const authorityRecord = authorities.getRange().find(rec => {
          return (
            rec.get('is_superuser') === isSuperuser &&
            rec.get('is_staff') === isStaff
          );
        });
        const authority = authorityRecord
          ? authorityRecord.get('value')
          : 'user';

        Ext.create('apps.view.settings.user.UserWindow', {
          title: cmp.getText() || cmp.tooltip,
          viewModel: {
            data: {
              mode: cmp.getItemId(),
              record,
              authority
            }
          },
          listeners: {
            close: function() {
              const refresh = this.getViewModel().get('refresh');

              if (panel && refresh) {
                panel.getStore().load();
              }
            }
          }
        }).show();
      },
      callback: () => {}
    });
  },

  onDelete: function(cmp) {
    const panel = cmp.up('panel');
    const { selection } = panel;

    apps.model.User.load(selection.get('id'), {
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
      success: record => {
        Ext.Msg.confirm('확인', '삭제 하시겠습니까?', btn => {
          if (btn === 'yes') {
            record.erase({
              failure: (rec, operation) => {
                const resp = JSON.parse(operation.getResponse().responseText);
                Ext.Msg.alert('알림', resp.errors);
              },
              success: () => panel.getStore().load(),
              callback: () => {}
            });
          }
        });
      },
      callback: () => {}
    });
  },

  onBeforeload: function(store) {
    const form = this.lookupReference('searchForm');
    const values = form.getForm().getValues();
    const proxy = store.getProxy();

    Object.keys(values).forEach(name => {
      proxy.setExtraParam(name, values[name]);
    });
  },

  onRendererAuthority: value => {
    // TODO: apps.store.Authority
    return {
      master: '최고 관리자',
      admin: '일반 관리자',
      user: '고객'
    }[value];
  },

  onExcelDown: function(comp) {
    const valuse = this.lookupReference('searchForm').getValues();
    const grid = this.lookupReference('usersGrid');
    const extraParams = grid
      .getStore()
      .getProxy()
      .getExtraParams();

    const params = Object.assign({}, extraParams);

    this.excelDownload(comp, params);
  }
});
