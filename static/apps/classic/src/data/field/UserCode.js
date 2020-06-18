Ext.define('apps.data.field.UserCode', {
  extend: 'Ext.data.field.String',
  alias: 'data.field.usercode',

  defaultValue: '',

  convert: function(v) {
    var defaultValue = this.allowNull ? null : '';
    return v === undefined || v === null
      ? defaultValue
      : String(v.replace(v, v.replace(/.{3}$/g, '*'.repeat(3))));
  }
});
