Ext.define('apps.view.common.SourceInfoWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'Ext.grid.Panel',
    'Ext.grid.feature.Grouping',
    'Ext.layout.container.Fit',
    'Ext.panel.Panel',
    'Ext.tab.Panel'
  ],

  layout: 'fit',
  width: 700,
  height: 500,
  border: true,
  referenceHolder: true,
  defaultListenerScope: true,

  items: {
    xtype: 'tabpanel',
    items: [
      { xtype: 'panel', title: '수집현황', reference: 'chart' },
      {
        xtype: 'grid',
        title: '호스트',
        bind: {
          store: {
            fields: ['key', 'value'],
            data: [
              ['이름', '{host_name}'],
              ['IP', '{host_ip}'],
              ['인코딩', '{host_encoding}'],
              ['생성일', '{host_ctime}'],
              ['수정일', '{host_mtime}'],
              ['비고', '{host_desc}']
            ]
          }
        },
        columns: [
          { text: 'Key', dataIndex: 'key' },
          { text: 'Value', dataIndex: 'value', flex: 1 }
        ]
      },
      {
        xtype: 'grid',
        title: '그룹',
        bind: {
          store: {
            fields: ['key', 'value'],
            data: [
              ['소속', '{host_group_name}'],
              ['생성일', '{host_group_ctime}'],
              ['수정일', '{host_group_mtime}'],
              ['비고', '{host_group_desc}']
            ]
          }
        },
        columns: [
          { text: 'Key', dataIndex: 'key' },
          { text: 'Value', dataIndex: 'value', flex: 1 }
        ]
      },
      {
        xtype: 'grid',
        title: 'SNMP',
        bind: {
          store: {
            fields: ['key', 'value'],
            data: [
              ['버전', '{host_snmpversion}'],
              ['Community', '{host_community}'],
              ['auth_key', '{host_auth_key}'],
              ['priv_key', '{host_priv_key}'],
              ['auth_mode', '{host_auth_mode}'],
              ['priv_mode', '{host_priv_mode}'],
              ['Interval', '{host_interval}'],
              ['포트', '{host_snmp_port}']
            ]
          }
        },
        columns: [
          { text: 'Key', dataIndex: 'key' },
          { text: 'Value', dataIndex: 'value', flex: 1 }
        ]
      },
      {
        xtype: 'grid',
        title: '이벤트',
        bind: {
          store: {
            fields: ['type', 'name', 'id'],
            data: '{event}'
          }
        },
        columns: [
          { text: '이벤트유형', dataIndex: 'type', width: 150 },
          { text: '이벤트명', dataIndex: 'name', flex: 1 }
        ]
      },
      {
        xtype: 'grid',
        title: '분석기',
        reference: 'analyzerGrid',
        store: {
          fields: ['key', 'value', 'type'],
          groupField: 'type',
          data: []
        },
        features: [{ ftype: 'grouping', showGroupsText: '' }],
        columns: [
          { text: 'Key', dataIndex: 'key', width: 150 },
          { text: 'Value', dataIndex: 'value', flex: 1 }
        ]
      },
      {
        xtype: 'grid',
        title: '파서',
        bind: {
          store: {
            fields: ['key', 'value'],
            data: [
              ['이름', '{parser_name}'],
              ['버전', '{parser_version}'],
              ['수정일', '{parser_mtime}'],
              ['비고', '{parser_desc}']
            ]
          }
        },
        columns: [
          { text: 'Key', dataIndex: 'key' },
          { text: 'Value', dataIndex: 'value', flex: 1 }
        ]
      },
      {
        xtype: 'grid',
        title: '사용자정의필드',
        bind: {
          store: {
            fields: ['key', 'value'],
            data: '{user_field}'
          }
        },
        columns: [
          { text: '필드', dataIndex: 'key', width: 150 },
          { text: '설명', dataIndex: 'value', flex: 1 }
        ]
      }
    ]
  },

  listeners: {
    boxready: 'onReady'
  },

  onReady: function() {
    var me = this,
      vm = me.getViewModel(),
      host_id = vm.get('host_id'),
      analyzer = vm.get('analyzer_info'),
      analyzerStore = me.lookupReference('analyzerGrid').getStore();

    apps.ajax(
      '/source/detail_chart',
      {
        analyzer: Ext.String.format('analyzer-{0}-{1}', analyzer[0].id, host_id)
      },
      function(r) {
        me.renderChart(r.data, r.startTime, r.timeInterval);
      }
    );

    var _TYPE = { 0: 'Master', 1: 'Slave' };
    var analyzer_label = [
      ['IP', 'ip'],
      ['포트', 'port'],
      ['상태', 'status'],
      ['타입', 'svr_type'],
      ['수정일', 'mtime']
      // ['옵션(http/https)', 'options']
    ];
    for (var _l = analyzer.length - 1; _l >= 0; _l--) {
      for (var i = 0, l = analyzer_label.length; i < l; i++) {
        analyzerStore.insert(i, {
          key: analyzer_label[i][0],
          value: analyzer[_l][analyzer_label[i][1]],
          type: _TYPE[_l]
        });
      }
    }
  },

  renderChart: function(data, startTime, timeInterval) {
    var me = this,
      chart = me.lookupReference('chart'),
      _chart;
    var categories = [];

    data[0].type = 'line';
    Ext.Array.each(data[0].data, function() {
      categories.push(Ext.Date.format(new Date(startTime), 'Y-m-d H:i'));
      startTime += timeInterval; // 2min
    });

    _chart = echarts.init(chart.body.dom);
    _chart.setOption({
      tooltip: { trigger: 'axis' },
      calculable: true,
      xAxis: [{ type: 'category', boundaryGap: false, data: categories }],
      yAxis: [{ type: 'value' }],
      series: [data[0]]
    });
  }
});
