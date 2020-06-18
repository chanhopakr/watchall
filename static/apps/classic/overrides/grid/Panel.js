/**
 * Created by zen on 17. 7. 6.
 */
Ext.define('apps.overrides.grid.Panel', {
  override: 'Ext.grid.Panel',
  getColumnsInfo: function() {
    var columnsInfo = [];
    _.each(this.getColumns(), function(column) {
      columnsInfo.push({
        dataIndex: column.dataIndex,
        text: column.text,
        width: column.width
      });
    });
    return columnsInfo;
  }
});
