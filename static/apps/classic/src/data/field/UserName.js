Ext.define('apps.data.field.UserName', {
  extend: 'Ext.data.field.String',
  alias: 'data.field.username',

  defaultValue: '',

  convert: function(v) {
    var defaultValue = this.allowNull ? null : '';
    return v === undefined || v === null
      ? defaultValue
      : String(v.replace(/.$/, '*'));
  }
});
