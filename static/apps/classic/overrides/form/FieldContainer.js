Ext.define('apps.overrides.form.FieldContainer', {
  override: 'Ext.form.FieldContainer',

  /**
   * ExtJS bug fixed: 부모 container 에서 layout hbox 안에서 사용시
   * fieldcontainer 의 다음 위치하는 field component 의 label 의 dom 의 left 값이
   * 비이상적으로 커지는 현상
   *
   * 105 = dom label width + dom label padding-right = field.labelWith + field.labelPad
   */
  onBugFixed: function(cmp) {
    var ownerCt = cmp.getRefOwner();
    var ownerCtLayout = ownerCt.layout;
    if (ownerCtLayout.type === 'hbox') {
      var styleMarginRight = Ext.String.format(
        'margin-right: {0}px',
        -(cmp.labelWidth + cmp.labelPad)
      );

      if (cmp.style) {
        cmp.style += styleMarginRight;
      } else {
        cmp.style = styleMarginRight;
      }
    }
    return cmp;
  },

  /**
   * Ext.form.FieldContainer 의 initComponent 참조
   */
  initComponent: function() {
    var me = this;

    // Init mixins
    me.initLabelable();
    me.initFieldAncestor();

    me.onBugFixed(me);
    me.callParent();
    me.initMonitor();
  }
});
