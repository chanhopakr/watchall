Ext.define('apps.form.emailtemplatevariable.Resource', {
  extend: 'Ext.form.FieldSet',
  alias: ['widget.emailtemplatevariableresource'],
  requires: ['Ext.form.field.Display'],
  collapsible: true,
  collapsed: true,
  defaults: {
    xtype: 'displayfield',
    submitValue: false
  },
  items: [
    { fieldLabel: '시스템 명', value: '{hostname}' },
    { fieldLabel: '발생 일시', value: '{time}' },
    { fieldLabel: '리소스 타입', value: '{type}' },
    { fieldLabel: '사용량', value: '{threshold}' }
  ]
});
