/**
 * Created by go on 15. 12. 9.
 */
Ext.define('apps.overrides.form.Labelable', {
  override: 'Ext.form.Labelable',
  labelAlign: 'right',

  getLabelableRenderData: function() {
    var me = this,
      labelAlign = me.labelAlign,
      topLabel = labelAlign === 'top',
      rightLabel = labelAlign === 'right',
      sideError = me.msgTarget === 'side',
      underError = me.msgTarget === 'under',
      errorMsgCls = me.errorMsgCls,
      labelPad = me.labelPad,
      labelWidth = me.labelWidth,
      labelClsExtra = me.labelClsExtra || '',
      errorWrapExtraCls = sideError
        ? me.errorWrapSideCls
        : me.errorWrapUnderCls,
      labelStyle = '',
      labelInnerStyle = '',
      labelVisible = me.hasVisibleLabel(),
      autoFitErrors = me.autoFitErrors,
      defaultBodyWidth = me.defaultBodyWidth,
      bodyStyle,
      data;

    if (topLabel) {
      labelClsExtra += ' ' + me.topLabelCls;
      if (labelPad) {
        labelInnerStyle = 'padding-bottom:' + labelPad + 'px;';
      }
      if (sideError && !autoFitErrors) {
        labelClsExtra += ' ' + me.topLabelSideErrorCls;
      }
    } else {
      if (rightLabel) {
        labelClsExtra += ' ' + me.rightLabelCls;
      }
      if (labelPad) {
        labelStyle += me.getHorizontalPaddingStyle() + labelPad + 'px;';
      }
      if (labelWidth === 'auto') {
        if (!window.textMetrics) {
          window.textMetrics = new Ext.util.TextMetrics();
        }
        labelWidth = window.textMetrics.getWidth(this.fieldLabel) + 20;
      }
      labelStyle += 'width:' + (labelWidth + (labelPad ? labelPad : 0)) + 'px;';
      // inner label needs width as well so that setting width on the outside
      // that is smaller than the natural width, will be ensured to take width
      // away from the body, and not the label.
      labelInnerStyle = 'width:' + labelWidth + 'px';
    }

    if (labelVisible) {
      if (!topLabel && underError) {
        errorWrapExtraCls += ' ' + me.errorWrapUnderSideLabelCls;
      }
    }

    if (defaultBodyWidth) {
      // This is here to support textfield's deprecated "size" config
      bodyStyle =
        'min-width:' +
        defaultBodyWidth +
        'px;max-width:' +
        defaultBodyWidth +
        'px;';
    }

    data = {
      id: me.id,
      inputId: me.getInputId(),
      labelCls: me.labelCls,
      labelClsExtra: labelClsExtra,
      labelStyle: labelStyle + (me.labelStyle || ''),
      labelInnerStyle: labelInnerStyle,
      labelInnerCls: me.labelInnerCls,
      labelTextCls: me.labelTextCls,
      skipLabelForAttribute: !!me.skipLabelForAttribute,
      unselectableCls: Ext.Element.unselectableCls,
      bodyStyle: bodyStyle,
      baseBodyCls: me.baseBodyCls,
      fieldBodyCls: me.fieldBodyCls,
      extraFieldBodyCls: me.extraFieldBodyCls,
      errorWrapCls: me.errorWrapCls,
      errorWrapExtraCls: errorWrapExtraCls,
      renderError: sideError || underError,
      invalidMsgCls: sideError
        ? me.invalidIconCls
        : underError
        ? me.invalidUnderCls
        : '',
      errorMsgCls: errorMsgCls,
      growCls: me.grow ? me.growCls : '',
      tipAnchorTarget: me.id + '-inputEl',
      errorWrapStyle:
        sideError && !autoFitErrors ? 'visibility:hidden' : 'display:none',
      fieldLabel: me.getFieldLabel(),
      labelSeparator: me.labelSeparator,
      renderAriaElements: !!me.renderAriaElements,
      ariaStatus: ''
    };

    if (me.ariaHelp) {
      data.ariaHelp = Ext.String.htmlEncode(me.ariaHelp);
    }

    me.getInsertionRenderData(data, me.labelableInsertions);

    return data;
  }
});
