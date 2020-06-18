Ext.define('apps.overrides.form.Basic', {
  override: 'Ext.form.Basic',
  /**
   * 유효성 검사후 invalid fields 가져오기
   * Basic.isValid() + field 마다 hidden 인 경우 무시
   *
   * @returns {fields}
   */
  getInvalidItems: function(ignoreHidden = true) {
    var me = this;
    var invalid = me.getFields().filterBy(function(field) {
      if (ignoreHidden && (field.hidden || field.ownerCt.hidden)) {
        /**
         * field 또는 field 의 상위가 hidden 인 경우 검사하지 않기
         *
         * 일반적인 경우 field 의 상위가 재귀적 hidden 인 경우는 거의 없다
         */
        return false;
      } else {
        /**
         * field.isValid() 시 field.disabled=true 는 pass 하고 있다
         */
        return !field.checkValidityChange(field.isValid());
      }
    });
    Ext.resumeLayouts(true);
    return invalid.items;
  }
});
