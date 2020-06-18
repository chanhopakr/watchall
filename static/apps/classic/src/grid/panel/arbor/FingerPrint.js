Ext.define('apps.grid.panel.arbor.FingerPrint', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.grid.panel.arbor.fingerprint',
  columns: {
    items: [
      { text: '이름', dataIndex: 'name', width: 150 },
      { text: '상세 내용', dataIndex: 'description', flex: 1, minWidth: 200 }
    ]
  }
});
