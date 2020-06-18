Ext.define('apps.view.settings.setting.Setting', {
  extend: 'Ext.Container',

  requires: [
    'Ext.button.Button',
    'Ext.form.FieldSet',
    'Ext.form.Panel',
    'Ext.form.RadioGroup',
    'Ext.form.field.Number',
    'Ext.form.field.Text',
    'Ext.layout.container.Fit',
    'Ext.layout.container.VBox',
    'Ext.toolbar.Fill',
    'apps.view.settings.setting.SettingController',
    'apps.view.settings.setting.SettingModel'
  ],

  xtype: 'setting',

  viewModel: {
    type: 'setting'
  },

  controller: 'setting',

  layout: 'fit',

  items: [
    {
      xtype: 'form',
      minHeight: 400,
      scrollable: 'y',
      bodyPadding: '0 10 0 10',
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      tbar: {
        items: [
          '->',
          {
            tooltip: '새로고침',
            xtype: 'button',
            iconCls: 'x-fa fa-refresh',
            ui: 'circle',
            cls: 'bg_refresh',
            scale: 'medium',
            handler: 'onRefresh'
          },
          {
            tooltip: '저장',
            itemId: 'create',
            iconCls: 'x-fa fa-save',
            cls: 'bg_create',
            xtype: 'button',
            scale: 'medium',
            ui: 'circle',
            handler: 'onSave'
          }
        ]
      },
      defaults: {
        xtype: 'fieldset',
        layout: {
          type: 'vbox',
          align: 'stretch'
        },
        defaults: {
          xtype: 'textfield'
        }
      },
      items: [
        {
          title: '시스템 임계치',
          defaults: {
            xtype: 'numberfield',
            maxValue: 100,
            minValue: 1,
            editable: true,
            maskRe: /[0-9]/,
            enableKeyEvents: true,
            msgTarget: 'under',
            validateBlank: true,
            maxLength: 3,
            minLength: 1,
            enforceMaxLength: true,
            // fieldStyle: 'ime-mode: disabled;',
            blankText: '1~100 을 입력하십시오.',
            nanText: '1~100 을 입력하십시오.',
            maxText: '최대값은 {0} 입니다.',
            minText: '최소값은 {0} 입니다.',
            maxLengthText: null,
            minLengthText: null,
            labelWidth: 130
          },
          items: [
            {
              fieldLabel: 'CPU',
              name: 'threshold_cpu',
              bind: {
                value: '{record.threshold_cpu}'
              }
            },
            {
              fieldLabel: 'Memory',
              name: 'threshold_memory',
              bind: {
                value: '{record.threshold_memory}'
              }
            },
            {
              fieldLabel: 'Swap',
              name: 'threshold_swap',
              bind: {
                value: '{record.threshold_swap}'
              }
            },
            {
              fieldLabel: 'Disk',
              name: 'threshold_disk',
              bind: {
                value: '{record.threshold_disk}'
              }
            }
          ]
        },
        {
          title: '세션 설정',
          items: [
            {
              xtype: 'fieldcontainer',
              fieldLabel: '브라우저 세션만료',
              labelWidth: 130,
              layout: {
                type: 'hbox',
                align: 'stretch'
              },
              items: [
                {
                  xtype: 'radiogroup',
                  flex: 2,
                  name: 'session_idle_time_check',
                  simpleValue: true,
                  items: [
                    {
                      boxLabel: '사용안함',
                      inputValue: '0'
                    },
                    {
                      boxLabel: '사용 (초)',
                      inputValue: '1',
                      checked: true
                    }
                  ],
                  bind: {
                    value: '{record.session_idle_time_check}'
                  }
                },
                {
                  xtype: 'numberfield',
                  reference: 'session_idle_time',
                  flex: 1,
                  name: 'session_idle_time',
                  maxLength: 5,
                  enforceMaxLength: true,
                  maxValue: 86400,
                  minValue: 10,
                  step: 10,
                  maskRe: /[0-9]/,
                  fieldStyle: 'ime-mode: disabled;',
                  enableKeyEvents: true,
                  bind: {
                    value: '{record.session_idle_time}',
                    disabled: '{isSession}'
                  }
                }
              ]
            }
          ]
        },
        {
          title: '사용자 인증',
          defaults: {
            xtype: 'numberfield',
            maxValue: 100,
            minValue: 1,
            editable: true,
            maskRe: /[0-9]/,
            enableKeyEvents: true,
            msgTarget: 'under',
            validateBlank: true,
            maxLength: 3,
            minLength: 1,
            enforceMaxLength: true,
            // fieldStyle: 'ime-mode: disabled;',
            blankText: '1~100 을 입력하십시오.',
            nanText: '1~100 을 입력하십시오.',
            maxText: '최대값은 {0} 입니다.',
            minText: '최소값은 {0} 입니다.',
            maxLengthText: null,
            minLengthText: null,
            labelWidth: 130
          },
          items: [
            {
              xtype: 'radiogroup',
              fieldLabel: '로그인 실패시 행동',
              name: 'auth_fail_action',
              simpleValue: true,
              items: [
                { boxLabel: '계정 차단', inputValue: 'disable' },
                { boxLabel: '일시 차단', inputValue: 'delay', checked: true }
              ],
              bind: {
                value: '{record.auth_fail_action}'
              }
            },
            {
              fieldLabel: '로그인 재시도 횟수',
              name: 'auth_fail_count',
              bind: {
                value: '{record.auth_fail_count}'
              }
            },
            {
              name: 'auth_block_time',
              fieldLabel: '차단 시간 (분)',
              maxValue: 60,
              minValue: 5,
              editable: false,
              bind: {
                value: '{record.auth_block_time}'
              }
            }
          ]
        },
        {
          title: '비밀번호 정책',
          reference: 'passwdPanel',
          defaults: { minValue: 1, labelAlign: 'right', labelWidth: 130 },
          items: [
            {
              xtype: 'checkbox',
              name: 'passwd_alpha',
              fieldLabel: '알파벳',
              boxLabel: '포함여부 확인',
              uncheckedValue: '',
              bind: {
                value: '{record.passwd_alpha}'
              }
            },
            {
              xtype: 'checkbox',
              name: 'passwd_number',
              fieldLabel: '숫자',
              boxLabel: '포함여부 확인',
              uncheckedValue: '',
              bind: {
                value: '{record.passwd_number}'
              }
            },
            {
              xtype: 'checkbox',
              name: 'passwd_special',
              fieldLabel: '특수문자',
              boxLabel: '포함여부 확인',
              uncheckedValue: '',
              bind: {
                value: '{record.passwd_special}'
              }
            },
            {
              xtype: 'numberfield',
              name: 'passwd_length',
              fieldLabel: '비밀번호 길이',
              width: 100,
              value: 7,
              minValue: 7,
              editable: false,
              bind: {
                value: '{record.passwd_length}'
              }
            }
          ]
        },
        {
          title: '이메일',
          items: [
            {
              xtype: 'combobox',
              fieldLabel: '시스템 관리자',
              name: 'email_receiver',
              labelWidth: 130,
              valueField: 'id',
              bind: {
                store: '{admins}',
                value: '{record.email_receiver}'
              }
            }
          ]
        }
      ],
      listeners: {
        boxready: 'onBoxreadySetting'
      }
    }
  ]
});
