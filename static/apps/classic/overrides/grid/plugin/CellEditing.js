Ext.define('apps.overrides.grid.plugin.CellEditing', {
  override: 'Ext.grid.plugin.CellEditing',

  /**
   * @override
   * 참조: Ext.grid.plugin.CellEditing.onEditComplete
   */
  onEditComplete: function(ed, value, startValue) {
    var me = this,
      context = ed.context,
      view,
      record;

    view = context.view;
    record = context.record;
    context.value = value;
    context.rawValue = ed.field.getRawValue(); // 추가

    if (!record.isEqual(value, startValue)) {
      view.skipSaveFocusState = true;
      record.set(context.column.dataIndex, value);
      view.skipSaveFocusState = false;
      context.rowIdx = view.indexOf(record);
    }

    if (me.context === context) {
      me.setActiveEditor(null);
      me.setActiveColumn(null);
      me.setActiveRecord(null);
      me.editing = false;
    }

    me.fireEvent('edit', me, context);
  }
});
