Ext.define('apps.view.settings.user.UserWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'Ext.form.FieldContainer',
    'Ext.form.Panel',
    'Ext.form.field.ComboBox',
    'Ext.form.field.Checkbox',
    'Ext.form.field.Tag',
    'Ext.form.field.Text',
    'Ext.form.field.TextArea',
    'Ext.layout.container.HBox',
    'Ext.layout.container.VBox',
    'apps.model.User',
    'apps.store.Authority',
    'apps.store.arbor.Country',
    'apps.store.arbor.ManagedObject'
  ],

  uses: [],

  viewModel: {
    stores: {
      authorities: {
        type: 'authority',
        filters: [
          {
            property: 'value',
            operator: '!=',
            value: ''
          }
        ]
      },

      countries: {
        type: 'arbor.country'
      },

      managedObjects: {
        type: 'arbor.managedobject',
        autoLoad: true,
        pageSize: 0
      }
    },
    data: {
      authority: 'user', // default
      mode: 'create', // default
      record: {} // default
    },
    formulas: {
      isCreate: get => get('mode') === 'create',
      isUser: get => get('authority') === 'user'
    }
  },

  defaultListenerScope: true,
  referenceHolder: true,
  layout: {
    type: 'vbox',
    align: 'stretch'
  },
  width: 500,
  bodyPadding: 10,

  items: [
    {
      xtype: 'form',
      itemId: 'form',
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      defaults: {
        xtype: 'textfield'
        // labelWidth: 120
      },
      items: [
        {
          fieldLabel: '계정 명',
          name: 'username',
          allowBlank: false,
          activeError: true,
          bind: {
            value: '{record.username}'
          }
        },
        {
          fieldLabel: '비밀번호',
          itemId: 'password',
          xtype: 'fieldcontainer',
          layout: 'hbox',
          defaults: {
            xtype: 'textfield',
            flex: 1,
            margin: '0 0 0 10',
            inputType: 'password',
            validator: function(value) {
              const targetId =
                this.getItemId() === 'password' ? 'confirm' : 'password';
              const target = this.ownerCt.getComponent(targetId);
              const targetValue = target.getValue();
              let isValid = null;

              if (value === '' && targetValue === '') {
                isValid = target.allowBlank ? null : false;
                target.setActiveError(isValid);
              } else if (value || targetValue) {
                isValid = value !== targetValue;
                target.setActiveError(isValid || null);
              }

              if (isValid) {
                return `${target.getFieldLabel() ||
                  target.ownerCt.getFieldLabel()} 가 일치하지 않습니다.`;
              }

              if (this.bind && this.bind.value) {
                // Exception: validator return true 시 bind 가 동작 안하는 경우
                this.bind.value.setValue(value);
              }
              return isValid || true;
            },
            listeners: {
              beforerender: 'onBeforerenderPassword'
            }
          },
          items: [
            {
              emptyText: '비밀번호',
              name: 'password',
              itemId: 'password',
              margin: 0,
              bind: {
                activeError: '{isCreate}',
                value: '{record.password}'
              }
            },
            {
              emptyText: '비밀번호 확인',
              name: 'password-confirm',
              itemId: 'confirm',
              bind: {
                activeError: '{isCreate}'
              }
            }
          ]
        },
        {
          fieldLabel: '사용자 명',
          xtype: 'fieldcontainer',
          layout: 'hbox',
          defaults: {
            xtype: 'textfield',
            flex: 1,
            margin: '0 0 0 10'
          },
          items: [
            {
              name: 'first_name',
              emptyText: '이름',
              margin: 0,
              flex: 2,
              allowBlank: false,
              activeError: true,
              bind: {
                value: '{record.first_name}'
              }
            },
            {
              name: 'last_name',
              emptyText: '성',
              hidden: true,
              bind: {
                value: '{record.last_name}'
              }
            }
          ]
        },
        {
          fieldLabel: '부서',
          name: 'department',
          bind: {
            value: '{record.department}'
          }
        },
        {
          fieldLabel: '연락처',
          name: 'phone',
          bind: {
            value: '{record.phone}'
          }
        },
        {
          fieldLabel: '이메일',
          name: 'email',
          allowBlank: false,
          activeError: true,
          vtype: 'email',
          bind: {
            value: '{record.email}'
          }
        },
        {
          fieldLabel: '권한',
          name: 'authority',
          allowBlank: false,
          xtype: 'combobox',
          submitValue: false,
          value: 'user', // default
          bind: {
            store: '{authorities}',
            value: '{authority}'
          },
          listeners: {
            select: 'onChangeAuthority'
          }
        },
        {
          fieldLabel: '고객 명',
          reference: 'customerNameTextField',
          name: 'customer_name',
          xtype: 'textfield',
          hidden: false,
          disabled: false,
          bind: {
            hidden: '{!isUser}',
            disabled: '{!isUser}',
            value: '{record.customer_name}'
          }
        },
        {
          fieldLabel: 'MO',
          valueField: 'mo_id',
          displayField: 'name',
          name: 'mo_id',
          xtype: 'combobox',
          reference: 'managedObjectComboBox',
          hidden: false,
          disabled: false,
          queryMode: 'local',
          bind: {
            store: '{managedObjects}',
            hidden: '{!isUser}',
            disabled: '{!isUser}',
            value: '{record.mo_id}'
          }
        },
        {
          fieldLabel: '고객 웹 표시 국가',
          name: 'countries',
          reference: 'countriesTagField',
          valueField: 'id',
          displayField: 'name',
          xtype: 'tagfield',
          // allowBlank: false,
          // activeError: true,
          encodeSubmitValue: true,
          editable: true,
          grow: true,
          growMax: 100,
          selectOnFocus: false,
          hideTrigger: false,
          queryMode: 'local',
          filterPickList: true,
          bind: {
            hidden: '{!isUser}',
            disabled: '{!isUser}',
            store: '{countries}',
            value: '{record.countries}'
          }
        },
        {
          fieldLabel: '활성화',
          name: 'is_active',
          xtype: 'checkbox',
          bind: {
            value: '{record.is_active}'
          }
        },
        {
          fieldLabel: '비고',
          name: 'description',
          xtype: 'textarea',
          bind: {
            value: '{record.description}'
          }
        }
      ]
    }
  ],

  buttons: [
    { text: '저장', handler: 'onSave' },
    { text: '닫기', handler: 'onClose' }
  ],

  onSave: function(cmp) {
    const me = this;
    const vm = me.getViewModel();
    const form = me.getComponent('form').getForm();
    const record = vm.get('record');
    const field = form.getFields().items.find(item => {
      return item.hidden || item.ownerCt.hidden
        ? false
        : item.getErrors().length;
    });
    if (field) {
      Ext.Msg.alert(
        '알림',
        `${field.getFieldLabel() ||
          field.ownerCt.getFieldLabel()}: ${field.getErrors().join('<br/>')}`,
        () => {
          field.focus();
        }
      );
      return;
    }
    const settings = apps.view.common.Util.getSession().getData();
    const pw_ret = apps.check_passwd(
      vm.get('record.password'),
      settings['passwd_length'],
      settings['passwd_alpha'],
      settings['passwd_number'],
      settings['passwd_special']
    );
    if (pw_ret.error && vm.get('record.password').length != 0) {
      if (pw_ret.error == 'LENGTH') {
        Ext.Msg.alert(
          '알림',
          Ext.String.format(
            '비밀번호를 {0} 자리 이상 입력해주세요.',
            settings['passwd_length']
          )
        );
      } else if (
        pw_ret.error == 'ALPHA' ||
        pw_ret.error == 'NUMBER' ||
        pw_ret.error == 'SPECIAL'
      ) {
        let buf = '비밀번호를';
        if (settings['passwd_alpha'] == 'True') {
          buf += ' 알파벳';
        }
        if (settings['passwd_number'] == 'True') {
          if (buf != '비밀번호를') {
            buf += ', 숫자';
          } else {
            buf += ' 숫자';
          }
        }
        if (settings['passwd_special'] == 'True') {
          if (buf != '비밀번호를') {
            buf += ', 특수문자';
          } else {
            buf += ' 특수문자';
          }
        }
        Ext.Msg.alert('알림', `${buf} (을)를 포함한 문자열로 입력해주세요`);
      }
      return;
    }

    record.save({
      failure: function(rec, operation) {
        const resp = JSON.parse(operation.getResponse().responseText);
        Ext.Msg.alert('알림', resp.errors);
      },
      success: () => {
        vm.set('refresh', true);
        me.onClose();
      },
      callback: () => {}
    });
  },

  onClose: function() {
    this.close();
  },

  onBeforerenderPassword: function(cmp) {
    const mode = this.getViewModel().get('mode');
    cmp.allowBlank = mode !== 'create';
  },

  onChangeAuthority: function(cmp, record) {
    const me = this;
    const model = me.getViewModel().get('record');

    /* global apps */
    if (model instanceof apps.model.User) {
      ['is_superuser', 'is_staff'].forEach(fieldName => {
        const value = record.get(fieldName);
        model.set(fieldName, value);
      });
    }

    [
      'customerNameTextField',
      'managedObjectComboBox',
      'countriesTagField'
    ].forEach(ref => {
      const field = me.lookupReference(ref);
      if (field) {
        field.setValue(null);
      }
    });
  }
});
