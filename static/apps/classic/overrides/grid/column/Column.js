Ext.define('apps.overrides.grid.column.Column', {
  override: 'Ext.grid.column.Column',
  style: {
    textAlign: 'center'
  },
  menuDisabled: true,
  sortable: false,
  getSortParam: function() {
    return this.sortProperty || this.dataIndex;
  }
});
