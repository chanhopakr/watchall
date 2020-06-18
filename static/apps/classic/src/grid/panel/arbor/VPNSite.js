Ext.define('apps.grid.panel.arbor.VPNSite', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.grid.panel.arbor.vpnsite',
  columns: {
    items: [
      { text: '이름', dataIndex: 'name', width: 150 },
      { text: '태그', dataIndex: 'tags', width: 100 },
      { text: '상세 내용', dataIndex: 'description', flex: 1, minWidth: 200 }
    ]
  }
});
