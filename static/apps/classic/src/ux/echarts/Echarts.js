Ext.define('apps.ux.echarts.Echarts', {
  extend: 'Ext.panel.Panel',
  alias: 'widget.echarts',
  requires: ['apps.ux.echarts.Theme', 'Ext.window.Toast'],
  config: {
    options: {},
    legend: null,
    promise: null,
    category: null,
    seriesData: null,
    dataset: null,
    xAxis: null,
    chartTitle: null,

    /**
     * @cfg loadCount
     * updateDataset 을 통한 dataset 적용시 dataset 의 source length
     */
    loadCount: 0,

    /**
     * @cfg finished
     * echarts.on('finished', fn) 사용시 fn 에서 완료 시점에 대한 제어 목적을 갖는 속성
     */
    finished: false
  },

  initComponent: function() {
    var me = this;
    me.callParent();
  },

  listeners: {
    boxready: {
      scope: 'this',
      fn: 'initialize'
    },
    resize: {
      scope: 'this',
      fn: 'reSize'
    }
  },

  initialize: function() {
    var me = this;
    me.$chart = echarts.init(
      $(me.el.dom)
        .find('[data-ref="body"]')
        .get(0),
      me.theme || 'zen'
    );
    me.$chart.ownerCt = me;
    me.fireEvent('chartInitialize', me.$chart);
  },

  draw: function(options) {
    if (this.ticket) {
      clearTimeout(this.ticket);
    }
    this.ticket = Ext.Function.defer(
      function() {
        if (this.$chart) {
          this.$chart.setOption(options);
        }
      },
      50,
      this
    );
  },

  reSize: function() {
    if (this.$chart) this.$chart.resize();
  },

  applyOptions: function(params) {
    var theme = {};
    return Ext.apply(theme, params);
  },

  updateCategory: function(category) {
    if (!category) return;
    var options = this.getOptions();
    if (!options.xAxis) {
      options.xAxis = [{}];
    }
    Ext.Array.each(options.xAxis, function(xAxis) {
      Ext.apply(xAxis, category);
    });
    this.draw(options);
  },

  updateXAxis: function(xAxis) {
    if (!xAxis) return;
    var options = this.getOptions();

    if (!options.xAxis) {
      options.xAxis = {};
    }

    Ext.Array.each(options.xAxis, function(item) {
      Ext.apply(item, xAxis);
    });

    this.draw(options);
  },

  updateLegend: function(legend) {
    if (!legend) return;
    var options = this.getOptions();
    if (!options.legend) {
      options.legend = {};
    }
    Ext.apply(options.legend, legend);
    this.draw(options);
  },

  updateChartData: function(data) {
    if (!data) return;
    var chart_options = this.getOptions();
    if (data.series) {
      chart_options.series = [];
      Ext.Array.each(data.series, function(item) {
        chart_options.series.push(item);
      });
    }
    if (data.legend && chart_options.legend) {
      chart_options.legend.data = data.legend;
    }
    if (data.splitNumber && chart_options.xAxis) {
      chart_options.xAxis[0].splitNumber = data.splitNumber;
    }
    this.draw(chart_options);
  },

  updateOptions: function(options) {
    this.draw(options);
  },

  setSeries: function(series) {
    if (!series) return;
    var chart_options = this.getOptions();
    if (_.isArray(series)) {
      chart_options.series = series;
    } else {
      chart_options.series = [series];
    }
    this.draw(chart_options);
  },

  // updateSeries:function(data) {
  //     if (!data) return;
  //     var chart_options = this.getOptions();
  //     var series = chart_options.series;
  //     if (series && series.length == data.length) {
  //         Ext.Array.each(series, function (item, index) {
  //             Ext.apply(item, data[index]);
  //         })
  //     } else {
  //         chart_options.series = [];
  //         Ext.Array.each(data, function (item) {
  //             chart_options.series.push(item);
  //         });
  //     }
  //     this.draw(chart_options);
  // },

  updateSeriesData: function(data) {
    var me = this;
    var chart_options = this.getOptions();
    var defaultSeries = chart_options.defaultSeries;
    var series_list = chart_options.series || [];
    _.each(data, function(item, index) {
      if (item.id) {
        var series = _.findWhere(series_list, { id: item.id });
        if (series) {
          series.data = item.data;
        } else {
          if (defaultSeries) {
            series_list.push(Ext.merge(item, defaultSeries));
          }
        }
      } else {
        var series = _.findWhere(series_list, { name: item.name });
        if (series) {
          series.data = item.data;
        } else {
          if (defaultSeries) {
            series_list.push(Ext.merge(item, defaultSeries));
          }
        }
      }
    });
    chart_options.series = series_list;
    if (this.$chart) {
      this.$chart.setOption(chart_options);
    }
  },

  updateDataset: function(dataset) {
    var me = this;
    var chart_options = me.getOptions();

    chart_options.dataset = dataset;
    me.loadCount = 0;

    if (dataset && dataset.length && dataset[0].source) {
      me.loadCount = dataset[0].source.length;
    }

    if (me.$chart) {
      me.draw(chart_options);
    }
  },

  updatePromise: function(p) {
    var me = this;
    me.mask('loading...');
    if (p.always) {
      p.always(function() {
        me.unmask();
      }).otherwise(function(err) {
        me.unmask();
      });
    } else {
      p.then(
        function() {
          me.unmask();
        },
        function(err) {
          me.unmask();
        }
      );
    }
  },

  action: function(obj) {
    if (this.$chart) {
      this.$chart.dispatchAction(obj);
    }
  },

  showMessage: function(msg) {
    this.$chart.clear();
    this.$chart.setOption({
      title: {
        show: true,
        textStyle: {
          color: 'grey',
          fontSize: 20
        },
        text: msg,
        left: 'center',
        top: 'center'
      },
      xAxis: {
        show: false
      },
      yAxis: {
        show: false
      },
      series: []
    });
  },

  updateChartTitle: function(chartTitle) {
    if (!chartTitle) return;
    var options = this.getOptions();

    if (!options.title) {
      options.title = {};
    }

    Ext.apply(options.title, chartTitle);

    this.draw(options);
  },

  isLoaded: function() {
    return this.loadCount > 0;
  }
});
