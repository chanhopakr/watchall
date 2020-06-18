Ext.define('apps.view.settings.systemmonitoring.SystemMonitoringController', {
  extend: 'apps.app.ViewController',
  alias: 'controller.systemmonitoring',

  onBeforeloadResource: function(store) {
    const me = this;
    const panel = me.lookupReference('searchForm');
    const form = panel.getForm();
    const values = form.getValues();
    const proxy = store.getProxy();
    Object.keys(values).forEach(key => {
      proxy.setExtraParam(key, values[key]);
    });
  },
  onSearch: function() {
    const me = this;
    const vm = me.getViewModel();
    const grid = this.lookupReference('systemGrid');
    const selection = grid.selection;
    if (selection) {
      const panel = me.lookupReference('searchForm');
      const form = panel.getForm();
      const values = form.getValues();
      const params = {};
      Object.keys(values).forEach(key => {
        params[key] = values[key];
      });
      params.start_time = moment(values.start_time)
        .startOf('day')
        .unix();
      params.end_time = moment(values.end_time)
        .endOf('day')
        .unix();

      if (values.end_time === Ext.Date.format(new Date(), 'Y-m-d')) {
        params.end_time = moment().unix();
      }

      params.hostname = selection.get('hostname');
      me.onRenderChart(vm, params);
    } else {
      Ext.Msg.alert('알림', '시스템을 선택하십시오.');
    }
  },

  onItemclick: function(comp, record) {
    const me = this;
    const vm = me.getViewModel();
    const panel = me.lookupReference('searchForm');
    const form = panel.getForm();
    const values = form.getValues();
    let params = {};
    Object.keys(values).forEach(key => {
      params[key] = values[key];
    });
    params['start_time'] = moment(values.start_time)
      .startOf('day')
      .unix();
    params['end_time'] = moment(values.end_time)
      .endOf('day')
      .unix();

    if (values.end_time === Ext.Date.format(new Date(), 'Y-m-d')) {
      params['end_time'] = moment().unix();
    }

    params['hostname'] = record.get('hostname');
    me.onRenderChart(vm, params);
  },

  onRenderChart: function(vm, params) {
    const me = this;
    const systemCharts = me.lookupReference('systemCharts');
    if (systemCharts) {
      systemCharts
        .query('[xtype=echarts]')
        .forEach(item => item.$chart.clear());
    }

    apps.ajax('/monitoring/system_status/get_rrd_data', params, function(resp) {
      if (resp.success) {
        const rrd_data = resp.data;
        const series = {
          type: 'line',
          areaStyle: {},
          symbolSize: 0,
          animation: true,
          smooth: true
        };
        const disk_legend = [];
        let disk_series = [];
        const cpu_kernel_data_list = rrd_data.cpu.series[1].data,
          cpu_user_data_list = rrd_data.cpu.series[2].data;
        let cpu_used_data_list = [];
        for (let i = 0; i < cpu_user_data_list.length; i++) {
          cpu_used_data_list.push(
            (cpu_kernel_data_list[i] + cpu_user_data_list[i]).toFixed(2)
          );
        }
        vm.set('cpu_category', { data: rrd_data.cpu.category });
        vm.set(
          'cpu_series',
          Object.assign({ name: 'used', data: cpu_used_data_list }, series)
        );

        vm.set('memory_category', { data: rrd_data.memory.category });
        vm.set(
          'memory_series',
          Object.assign(
            {
              name: rrd_data.memory.series[1].name,
              data: rrd_data.memory.series[1].data
            },
            series
          )
        );

        rrd_data.disk.legend.forEach(function(x) {
          if (x === '_') {
            x = 'root';
          } else {
            x.replace('_', '/');
          }
          disk_legend.push(x);
        });
        rrd_data.disk.series.forEach(function(x) {
          disk_series.push(
            Object.assign({ name: disk_legend.shift(), data: x.data }, series)
          );
        });
        vm.set('disk_category', { data: rrd_data.disk.category });
        vm.set('disk_series', disk_series);
      } else {
        Ext.Msg.alert('알림', resp.errors);
      }
    });
  }
});
