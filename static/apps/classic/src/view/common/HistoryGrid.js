Ext.define('apps.view.common.HistoryGrid', {
  extend: 'apps.view.common.BaseGrid',
  alias: 'widget.historygrid',
  paging: false,
  enableLocking: true,
  extFields: ['file_contents'],
  url: '/node_table/getHistory',
  initComponent: function() {
    var me = this;

    me.columns = [
      {
        text: '시간',
        dataIndex: 'event_time',
        width: 120,
        sortable: false,
        locked: true
      }
    ];
    if (me.type == 'agent') {
      me.columns.push({
        text: 'File',
        sortable: false,
        columns: [
          {
            text: '기준',
            dataIndex: 'file_event_type',
            width: 120,
            sortable: false
          },
          { text: '내용', dataIndex: 'file_desc', width: 150, sortable: false }
        ]
      });
    }
    me.columns.push(
      {
        text: 'CPU',
        sortable: false,
        columns: [
          {
            text: '기준',
            dataIndex: 'cpu_event_type',
            width: 120,
            sortable: false
          },
          {
            text: '내용',
            dataIndex: 'cpu_contents',
            width: 150,
            sortable: false
          }
        ]
      },
      {
        text: 'Memory',
        sortable: false,
        columns: [
          {
            text: '기준',
            dataIndex: 'mem_event_type',
            width: 120,
            sortable: false
          },
          {
            text: '내용',
            dataIndex: 'mem_contents',
            width: 150,
            sortable: false
          }
        ]
      },
      {
        text: 'Disk',
        sortable: false,
        columns: [
          {
            text: '기준',
            dataIndex: 'disk_event_type',
            width: 120,
            sortable: false
          },
          {
            text: '내용',
            dataIndex: 'disk_contents',
            width: 150,
            sortable: false
          }
        ]
      },
      {
        text: 'Swap',
        sortable: false,
        columns: [
          {
            text: '기준',
            dataIndex: 'swap_event_type',
            width: 120,
            sortable: false
          },
          {
            text: '내용',
            dataIndex: 'swap_contents',
            width: 150,
            sortable: false
          }
        ]
      }
    );

    me.callParent(arguments);
  }
});
