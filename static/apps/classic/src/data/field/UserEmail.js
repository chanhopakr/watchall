Ext.define('apps.data.field.UserEmail', {
  extend: 'Ext.data.field.String',
  alias: 'data.field.useremail',

  defaultValue: '',

  convert: function(v) {
    var defaultValue = this.allowNull ? null : '';

    if (v === undefined || v === null) {
      return defaultValue;
    } else {
      var account = v.slice(0, v.indexOf('@'));
      return v.replace(account, account.replace(/.{3}$/g, '*'.repeat(3)));
    }
  }
});
