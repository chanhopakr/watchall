Ext.define('apps.view.common.SearchButton', {
  extend: 'Ext.button.Button',

  xtype: 'searchbutton',
  cls: 'bg_search',
  iconCls: 'x-fa fa-search',

  text: '검색',
  tooltip: '검색',
  width: 125,

  setLoading: function(flag) {
    this.setDisabled(flag);
    this.setIconCls(
      { true: 'fa fa-spinner fa-spin', false: 'x-fa fa-search' }[flag]
    );
  }
});
