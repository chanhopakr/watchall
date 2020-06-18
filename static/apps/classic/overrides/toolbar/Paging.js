/**
 * Created by go on 15. 12. 9.
 */
Ext.define('apps.overrides.toolbar.Paging', {
  override: 'Ext.toolbar.Paging',

  requires: [
    'Ext.form.field.Number',
    'Ext.toolbar.Separator',
    'Ext.toolbar.TextItem'
  ],

  displayInfo: true,
  beforePageText: '',
  padding: '0 0 0 0',
  getPagingItems: function() {
    var me = this,
      inputListeners = {
        scope: me,
        blur: me.onPagingBlur
      };

    inputListeners[Ext.supports.SpecialKeyDownRepeat ? 'keydown' : 'keypress'] =
      me.onPagingKeyDown;

    var buttons = [
      {
        itemId: 'first',
        tooltip: me.firstText,
        overflowText: me.firstText,
        iconCls: Ext.baseCSSPrefix + 'tbar-page-first',
        disabled: true,
        handler: me.moveFirst,
        scope: me
      },
      {
        itemId: 'prev',
        tooltip: me.prevText,
        overflowText: me.prevText,
        iconCls: Ext.baseCSSPrefix + 'tbar-page-prev',
        disabled: true,
        handler: me.movePrevious,
        scope: me
      },
      {
        xtype: 'tbseparator',
        hidden: me.simpleMode
      },
      {
        xtype: 'numberfield',
        itemId: 'inputItem',
        name: 'inputItem',
        cls: Ext.baseCSSPrefix + 'tbar-page-number',
        allowDecimals: false,
        minValue: 1,
        hideTrigger: true,
        enableKeyEvents: true,
        keyNavEnabled: false,
        selectOnFocus: true,
        submitValue: false,
        // mark it as not a field so the form will not catch it when getting fields
        isFormField: false,
        width: me.inputItemWidth,
        margin: '-1 2 3 2',
        fieldStyle: 'padding: 2px 10px 2px; min-height: 20px;',
        listeners: inputListeners
      },
      {
        xtype: 'tbtext',
        itemId: 'afterTextItem',
        html: Ext.String.format(me.afterPageText, 1)
      },
      {
        xtype: 'tbseparator',
        hidden: me.simpleMode
      },
      {
        itemId: 'next',
        tooltip: me.nextText,
        overflowText: me.nextText,
        iconCls: Ext.baseCSSPrefix + 'tbar-page-next',
        disabled: true,
        handler: me.moveNext,
        scope: me
      },
      {
        itemId: 'last',
        tooltip: me.lastText,
        overflowText: me.lastText,
        iconCls: Ext.baseCSSPrefix + 'tbar-page-last',
        disabled: true,
        handler: me.moveLast,
        scope: me
      },
      {
        xtype: 'tbseparator',
        hidden: me.simpleMode
      },
      {
        itemId: 'refresh',
        tooltip: me.refreshText,
        overflowText: me.refreshText,
        iconCls: Ext.baseCSSPrefix + 'tbar-loading',
        disabled: me.store.isLoading(),
        handler: me.doRefresh,
        scope: me
      }
    ];

    if (me.beforePageText) {
      buttons.splice(3, 0, me.beforePageText);
    }
    return buttons;
  }
});
