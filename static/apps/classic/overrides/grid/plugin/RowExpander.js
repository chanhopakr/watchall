/**
 * Created by zen on 17. 9. 11.
 */
Ext.define('apps.overrides.grid.plugin.RowExpander', {
  override: 'Ext.grid.plugin.RowExpander',
  beforeReconfigure: function(grid, store, columns, oldStore, oldColumns) {
    var me = this;

    if (columns) {
      var config = me.getHeaderConfig();
      if (this.disabled) {
        config.hidden = true;
      }
      me.expanderColumn = new Ext.grid.column.Column(config);
      columns.unshift(me.expanderColumn);
    }
  }
});
