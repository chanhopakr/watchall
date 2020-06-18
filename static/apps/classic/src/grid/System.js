Ext.define('apps.grid.System', {
  extend: 'Ext.grid.Panel',
  alias: ['widget.systemgrid'],

  requires: [
    // 'Ext.button.Button',
    // 'Ext.grid.column.Boolean',
    'Ext.grid.column.Date',
    'Ext.grid.column.Widget'
  ],

  columns: {
    defaults: { align: 'center' },
    items: [
      {
        text: '이름',
        dataIndex: 'display',
        width: 200
      },
      {
        text: '생성 일시',
        dataIndex: 'create_time',
        xtype: 'datecolumn',
        format: 'Y-m-d H:i:s',
        width: 140,
        align: 'center'
      },
      {
        text: 'CPU (%)',
        xtype: 'widgetcolumn',
        dataIndex: 'cpu',
        flex: 1,
        widget: {
          xtype: 'progressbarwidget',
          animate: true,
          textTpl: ['{percent:number("0")} %'],
          ui: 'blue_progress'
        }
      },
      {
        text: 'Memory (%)',
        xtype: 'widgetcolumn',
        dataIndex: 'memory',
        flex: 1,
        widget: {
          xtype: 'progressbarwidget',
          animate: true,
          textTpl: ['{percent:number("0")} %'],
          ui: 'green_progress',
          updateValue: function(value, oldValue) {
            const me = this;
            if (value === 0) {
              return;
            }
            const { used, free } = value;
            const total = Number(used) + Number(free);
            if (!me.isConfiguring && me.getAnimate()) {
              me.stopBarAnimation();
              me.startBarAnimation(
                Ext.apply(
                  {
                    from: {
                      width: `${oldValue * 100}%`
                    },
                    to: {
                      width: `${((used / total) * 100).toFixed(1)}%`
                    }
                  },
                  me.animate
                )
              );
            } else {
              me.barEl.setStyle(
                'width',
                `${((used / total) * 100).toFixed(1)} %`
              );
            }
            me.setText(
              Ext.String.format(
                '{0} % ({1}GB/{2}GB)',
                Number((used / total) * 100).toFixed(1),
                Number(used / (1024 * 1024)).toFixed(1),
                Number(total / (1024 * 1024)).toFixed(1)
              )
            );
          }
        }
      },
      {
        text: 'Disk (%)',
        xtype: 'widgetcolumn',
        dataIndex: 'disk',
        flex: 1,
        widget: {
          xtype: 'progressbarwidget',
          animate: true,
          textTpl: ['{percent:number("0")} %'],
          ui: 'orange_progress',
          updateValue: function(value, oldValue) {
            const me = this;
            if (value === 0) {
              return;
            }
            const { size, used, use } = value;
            if (!me.isConfiguring && me.getAnimate()) {
              me.stopBarAnimation();
              me.startBarAnimation(
                Ext.apply(
                  {
                    from: {
                      width: `${oldValue * 100}%`
                    },
                    to: {
                      width: `${use.toFixed(1)}%`
                    }
                  },
                  me.animate
                )
              );
            } else {
              me.barEl.setStyle('width', `${use.toFixed(1)} %`);
            }
            me.setText(
              Ext.String.format(
                '{0} % ({1}TB/{2}TB)',
                use.toFixed(1),
                Number(used / (1024 * 1024 * 1024 * 1024)).toFixed(1),
                Number(size / (1024 * 1024 * 1024 * 1024)).toFixed(1)
              )
            );
          }
        }
      },
      {
        text: '프로세스 및 연동현황',
        dataIndex: 'process',
        flex: 1,
        renderer: function(processes) {
          let render = '';
          processes.forEach(process => {
            let icon =
              '<span class="x-fa fa-3x fa-check-circle" style="color:#40AFE2;"></span>';
            if (!process.value) {
              icon =
                '<span class="x-fa fa-3x fa-stop-circle" style="color:#F64C4C;"></span>';
            }
            render += `<div style="padding-top:10px;width:80px;height:60px;float:left;">${icon}<br>${
              process.key
            }</div>`;
          });

          return render;
        }
      }
    ]
  }
});
