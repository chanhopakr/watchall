Ext.define('apps.form.emailtemplatevariable.Traffic', {
  extend: 'Ext.form.FieldSet',
  alias: ['widget.emailtemplatevariabletraffic'],
  requires: ['Ext.form.field.Display'],
  collapsible: true,
  collapsed: true,
  defaults: {
    xtype: 'displayfield',
    submitValue: false
  },
  items: [
    { fieldLabel: '발생 일시', value: '{time}' },
    { fieldLabel: '이벤트 내용', value: '{desc}' }
  ]
});
