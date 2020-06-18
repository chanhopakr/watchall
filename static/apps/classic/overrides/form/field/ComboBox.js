/**
 * Created by go on 15. 12. 9.
 */
Ext.define('apps.overrides.form.field.ComboBox', {
  override: 'Ext.form.field.ComboBox',

  config: {
    displayField: 'display',
    valueField: 'value'
  },
  editable: false //,
  //emptyText: '<전체>'
});
