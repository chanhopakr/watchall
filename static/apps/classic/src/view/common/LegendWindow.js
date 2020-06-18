Ext.define('apps.view.common.LegendWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'Ext.button.Button',
    'Ext.form.field.Text',
    'Ext.grid.plugin.CellEditing',
    'Ext.layout.container.Fit',
    'apps.view.common.BaseGrid'
  ],

  height: 400,
  width: 500,
  title: '범례설정',
  layout: 'fit',
  border: false,
  fields: null,
  map: null,
  initComponent: function() {
    var me = this;
    var cellEditing = new Ext.grid.plugin.CellEditing({
      clicksToEdit: 2
    });

    me.grid = new apps.view.common.BaseGrid({
      enableTextSelection: false,
      paging: false,
      columns: [
        { text: 'From', dataIndex: 'from', width: 200, sortable: false },
        {
          text: 'To',
          dataIndex: 'to',
          flex: 1,
          sortable: false,
          editor: { xtype: 'textfield' }
        }
      ],
      plugins: [cellEditing]
    });
    me.items = [me.grid];
    me.buttons = [
      { xtype: 'button', text: '확인', scope: me, handler: me.onSave },
      { xtype: 'button', text: '취소', scope: me, handler: me.onCancel }
    ];

    var store = me.grid.getStore();
    if (typeof me.fields === 'object') {
      var from, to;
      for (var i = 0, l = me.fields.length; i < l; i++) {
        from = me.fields[i];
        to = null;
        if (me.map) {
          to = me.map[from] || from;
        } else {
          to = from;
        }
        store.add({ from: from, to: to });
      }
    }
    me.callParent(arguments);
  },
  onSave: function() {
    var me = this;
    var map = {};
    var records = me.grid.getStore().getRange();
    var found = false;

    for (var i = 0, l = records.length; i < l; i++) {
      var record = records[i];
      if (record.get('from') != record.get('to')) {
        found = true;
      }
      map[record.get('from')] = record.get('to');
    }

    me.fireEvent('save', me, found ? map : null);
    me.onCancel();
  },
  onCancel: function() {
    var me = this;
    me.close();
  }
});
