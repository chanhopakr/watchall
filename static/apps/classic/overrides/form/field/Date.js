Ext.define('apps.overrides.form.field.Date', {
  override: 'Ext.form.field.Date',

  minText: '입력한 날짜는 {0}과 같거나 그 이후 여야합니다.',
  maxText: '입력한 날짜는 {0}과 같거나 그 전이어야 합니다.',
  invalidText: '{0}은 (는) 유효한 날짜가 아닙니다. {1} 형식이어야합니다.',
  submitFormat: 'Y-m-d\\TH:i:s'
});
