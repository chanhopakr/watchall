Ext.define('apps.grid.panel.arbor.Country', {
  extend: 'Ext.grid.Panel',
  alias: 'widget.grid.panel.arbor.country',
  columns: {
    items: [
      {
        text: '',
        dataIndex: 'flag',
        width: 80,
        align: 'center',
        renderer: (value, meta, record) => {
          const code = record.get('code');
          return `<img src="/static/img/flags/${code}.png" alt="${code}">`;
        }
      },
      { text: '이름', dataIndex: 'name', flex: 1, minWidth: 200 },
      { text: '국가 코드', dataIndex: 'code', width: 80, align: 'center' }
    ]
  }
});
