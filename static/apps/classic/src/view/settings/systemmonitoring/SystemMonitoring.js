Ext.define('apps.view.settings.systemmonitoring.SystemMonitoring', {
  extend: 'Ext.Container',

  requires: [
    'Ext.container.Container',
    'Ext.layout.container.HBox',
    'Ext.layout.container.VBox',
    'apps.grid.System',
    'apps.ux.echarts.Echarts',
    'apps.view.settings.systemmonitoring.SystemMonitoringController',
    'apps.view.settings.systemmonitoring.SystemMonitoringModel'
  ],

  xtype: 'systemmonitoring',

  viewModel: {
    type: 'systemmonitoring'
  },

  controller: 'systemmonitoring',

  layout: {
    type: 'vbox',
    align: 'stretch'
  },

  defaults: {
    border: true,
    margin: '10 0 0 0'
  },

  items: [
    {
      title: '시스템',
      itemId: 'main',
      reference: 'systemGrid',
      flex: 1,
      xtype: 'systemgrid',
      margin: 0,
      tools: [
        {
          tooltip: '새로 고침',
          cls: 'bg_refresh',
          iconCls: 'x-fa fa-refresh',
          itemId: 'refresh',
          handler: 'onRefresh',
          xtype: 'button',
          scale: 'medium',
          ui: 'circle'
        }
      ],
      bind: {
        store: '{systems}'
      },
      listeners: {
        itemclick: 'onItemclick'
      }
    },
    {
      reference: 'searchForm',
      itemId: 'form',
      height: 55,
      xtype: 'form',
      bodyPadding: '0 10 10 10',
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      defaults: {
        xtype: 'container',
        margin: '10 0 0 0',
        layout: {
          type: 'hbox'
        }
      },
      items: [
        {
          items: [
            {
              fieldLabel: '기간(from)',
              name: 'start_time',
              reference: 'updateTimeFromDateField',
              emptyText: 'From',
              format: 'Y-m-d',
              submitFormat: 'Y-m-d',
              xtype: 'datefield',
              editable: false,
              publishes: ['value'],
              plugins: ['clearbutton'],
              value: moment().subtract(1, 'd')._d,
              bind: {
                maxValue: '{updateTimeToDateField.value}'
              }
            },
            {
              fieldLabel: '기간(To)',
              name: 'end_time',
              reference: 'updateTimeToDateField',
              emptyText: 'To',
              format: 'Y-m-d',
              submitFormat: 'Y-m-d',
              xtype: 'datefield',
              editable: false,
              publishes: ['value'],
              plugins: ['clearbutton'],
              value: moment()._d,
              bind: {
                minValue: '{updateTimeFromDateField.value}'
              }
            },
            { xtype: 'tbfill' },
            {
              reference: 'searcher',
              xtype: 'searchbutton',
              handler: 'onSearch'
            }
          ]
        }
      ]
    },
    {
      xtype: 'container',
      reference: 'systemCharts',
      flex: 1,
      layout: {
        type: 'hbox',
        align: 'stretch'
      },
      defaults: {
        xtype: 'echarts',
        frame: true,
        flex: 1,
        margin: '0 0 0 10'
      },
      items: [
        {
          title: 'CPU',
          margin: 0,
          options: {
            color: ['#26adc4'],
            title: [
              {
                text: ''
              }
            ],
            grid: [
              {
                top: 20,
                left: 50
              }
            ],
            tooltip: {
              padding: [10, 20, 10, 20],
              textStyle: {
                fontSize: 12
              },
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
                animation: false,
                snap: false,
                label: {
                  backgroundColor: '#505765'
                }
              }
              // formatter: function(params) {
              //     if (params instanceof Array){
              //         const time = params[0].axisValue;
              //         let group = {
              //             text: 'Network', data: []
              //         };
              //
              //         params.forEach((series) => {
              //             group.data.push({
              //                 marker: series.marker,
              //                 seriesName: series.seriesName,
              //                 value: series.data ? series.data + ' %' : '-'
              //             })
              //         });
              //
              //         return zenlog.ux.echarts.Theme.groupTooltipTemplate.apply({
              //             title: time,
              //             groups: [group]
              //         });
              //     }
              // }
            },
            xAxis: [
              {
                type: 'category',
                show: true,
                boundaryGap: false
              }
            ],
            yAxis: [
              {
                type: 'value',
                min: 0,
                max: 100
              }
            ],
            axisPointer: {
              link: {
                xAxisIndex: [0]
              }
            },
            legend: {
              bottom: 20,
              data: []
            }
          },
          bind: {
            category: '{cpu_category}',
            series: '{cpu_series}',
            legend: '{cpu_legend}'
          }
        },
        {
          title: 'Memory',
          options: {
            color: ['#97c043'],
            title: [
              {
                text: ''
              }
            ],
            grid: [
              {
                top: 20,
                left: 50
              }
            ],
            tooltip: {
              padding: [10, 20, 10, 20],
              textStyle: {
                fontSize: 12
              },
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
                animation: false,
                snap: false,
                label: {
                  backgroundColor: '#505765'
                }
              }
            },
            xAxis: [
              {
                type: 'category',
                show: true,
                boundaryGap: false
              }
            ],
            yAxis: [
              {
                type: 'value',
                min: 0,
                max: 100
              }
            ],
            axisPointer: {
              link: {
                xAxisIndex: [0]
              }
            },
            legend: {
              bottom: 20,
              data: []
            }
          },
          bind: {
            category: '{memory_category}',
            series: '{memory_series}',
            legend: '{memory_legend}'
          }
        },
        {
          title: 'Disk',
          options: {
            color: ['#dc972c'],
            title: [
              {
                text: ''
              }
            ],
            grid: [
              {
                top: 20,
                left: 50
              }
            ],
            tooltip: {
              padding: [10, 20, 10, 20],
              textStyle: {
                fontSize: 12
              },
              trigger: 'axis',
              axisPointer: {
                type: 'cross',
                animation: false,
                snap: false,
                label: {
                  backgroundColor: '#505765'
                }
              }
            },
            xAxis: [
              {
                type: 'category',
                show: true,
                boundaryGap: false
              }
            ],
            yAxis: [
              {
                type: 'value',
                min: 0,
                max: 100
              }
            ],
            axisPointer: {
              link: {
                xAxisIndex: [0]
              }
            },
            legend: {
              bottom: 20,
              data: []
            }
          },
          bind: {
            category: '{disk_category}',
            series: '{disk_series}',
            legend: '{disk_legend}'
          }
        }
      ]
    }
  ],
  listeners: {
    boxready: 'onSelectFirstRecordMainGridAfterLoad'
  }
});
