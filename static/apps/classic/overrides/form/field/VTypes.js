/**
 * Created by go on 15. 12. 30.
 */
Ext.define('apps.overrides.form.field.VTypes', {
  override: 'Ext.form.field.VTypes',

  datetime: function(value) {
    return this.datetimeRe.test(value);
  },
  datetimeRe: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
  datetimeText: '올바른 포맷이 아닙니다.',
  datetimeMask: /[\d\- :]/,
  IPAddress: function(value) {
    return /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(value);
  },
  IPAddressText: '올바른 포맷이 아닙니다.',
  IPAddressMask: /[\d\.]/i
});
