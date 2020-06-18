Ext.define('apps.form.emailtemplatevariable.Arbor', {
  extend: 'Ext.form.FieldSet',
  alias: ['widget.emailtemplatevariablearbor'],
  requires: ['Ext.form.field.Display'],
  collapsible: true,
  collapsed: true,
  defaults: {
    xtype: 'displayfield',
    submitValue: false
  },
  items: [
    { fieldLabel: '실행자', value: '{performer}' },
    { fieldLabel: '실행자 이메일', value: '{performer_email}' },
    { fieldLabel: '항목', value: '{category}' },
    { fieldLabel: '생성 일시', value: '{create_time}' },
    { fieldLabel: '작업 완료 일시', value: '{update_time}' },
    { fieldLabel: '결과 내용', value: '{response}' },
    { fieldLabel: '연동 결과', value: '{status}' },
    { fieldLabel: '재처리 명', value: '{retry_name}' },
    { fieldLabel: '재처리 내용', value: '{retry_description}' },
    { fieldLabel: '재처리 시작 일시', value: '{retry_start_time}' },
    { fieldLabel: '재처리 종료 일시', value: '{retry_end_time}' }
  ]
});
