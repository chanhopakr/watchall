// XXX help 문서 토글함수. html에서 전역으로 사용됨

function toggle(id) {
  $('#' + id).toggle();
}

Ext.define('apps.view.common.Util', {
  requires: [
    'Ext.dom.Helper',
    'Ext.util.Cookies',
    'apps.view.common.GoogleMapPanel'
  ],

  uses: ['apps.view.common.AlarmConfigWindow'],

  singleton: true,

  ajax: function(url, params, success, failure, opts) {
    var deferred = new Ext.Deferred();
    var base = {
      url: url,
      timeout: 600 * 1000,
      method: 'POST',
      params: params,
      success: function(response) {
        var obj = Ext.decode(response.responseText);
        if (success) {
          success(obj);
        }
        deferred.resolve(obj);
      },
      failure: function(response) {
        if (typeof failure == 'function') {
          failure(response);
        }
        try {
          var obj = Ext.decode(response.responseText);
          deferred.reject(obj);
        } catch (e) {
          deferred.reject(e);
        }
      }
    };
    if (opts) {
      for (var o in opts) {
        base[o] = opts[o];
      }
    }
    var xhr = Ext.Ajax.request(base);
    var promise = deferred.promise;
    promise.xhr = xhr;
    return promise;
  },

  timelineUpdate: function(opts, scope) {
    var me = this;

    function timeline_handler(r) {
      if (r.errmsg) {
        if (opts.onError) {
          opts.onError(r.errmsg);
        }
        return;
      }

      var finished = 0;
      var data = r.data;

      if (data.length === 0) {
        finished = 1;
      } else {
        finished = data[0]; // finished
        var timelineData = data[3]; // left panel stat by source (tempResult, sumResult): timeline count
        var elapsed = data[4]; // elapsed time
        var duration = data[5]; // chart duration

        // update timeline
        if (timelineData && opts.onUpdateTimeline) {
          opts.onUpdateTimeline(timelineData, elapsed, duration);
        }
      }

      if (finished != 1) {
        // 0 - 진행 중, 2 - 로그 갯수 파악은 완료, 1 - 타임라인 처리 완료
        monitor_timeline(r.ticketid, opts.startTime, opts.endTime);
      }
    }

    function monitor_timeline(ticketid, startTime, endTime) {
      me.ajax(
        '/search/timeline',
        {
          ticketid: ticketid,
          startTime: startTime,
          endTime: endTime
        },
        timeline_handler
      );
    }

    if (opts.hasOwnProperty('ticketid')) {
      monitor_timeline(opts.ticketid, opts.startTime, opts.endTime);
    } else {
      monitor_timeline(scope.G_ticketid, opts.startTime, opts.endTime);
    }
  },

  search: function(opts, scope) {
    scope.G_SEARCH = [];
    var me = this,
      source_loaded = false,
      timeline_finished = false,
      c_ticketid = scope && scope.G_ticketid;

    if (opts.hasOwnProperty('ticketid')) {
      c_ticketid = opts.ticketid;
    }

    function timeline_handler(r) {
      if (r.errmsg) {
        if (opts.onError) {
          opts.onError(r.errmsg);
        }
        return;
      }

      var timeline_finish = 0;
      var stats_finished = 0;
      var data = r.data;

      if (data.length === 0) {
        timeline_finish = 1;
        stats_finished = 1;
      } else {
        timeline_finish = data[0];
        stats_finished = data[1];

        var isStat = data[2];
        var timelineData = data[3]; // left panel stat by source (tempResult, sumResult): timeline count
        var elapsed = data[4]; // elapsed time
        var duration = data[5]; // chart duration
        var stime = data[6];
        var etime = data[7];

        if (isStat) {
          if (opts.onSwitchMode) {
            opts.onSwitchMode('stat'); // 통계데이터가 있을 때, 통계탭 활성화
            if (opts.onUpdateColumns) {
              opts.onUpdateColumns('stat', r.ticketid);
            }
          }
        } else {
          if (opts.onSwitchMode) {
            opts.onSwitchMode('log'); // 로그조회탭 활성화
          }
        }

        if (opts.onUpdateTimeline && !timeline_finished) {
          opts.onUpdateTimeline(
            timelineData,
            elapsed,
            duration,
            stime,
            etime,
            !source_loaded
          );
          if (timeline_finish === 1) {
            timeline_finished = true;
          }
        } else if (opts.onUpdateQueryTime) {
          opts.onUpdateQueryTime(elapsed);
        }

        if (!source_loaded) {
          if (opts.onUpdateSource) {
            opts.onUpdateSource();
          }
          source_loaded = true;
        }
      }

      if (!(timeline_finish === 1 && stats_finished === 1)) {
        monitor_timeline(r.ticketid);
      } else if (opts.onDone) {
        opts.onDone(opts, r);
      }
    }

    function timeline_failure(messge) {
      if (opts.onError && messge != 'cancel') {
        opts.onError(r.statusText);
      }
    }

    function monitor_timeline(ticketid) {
      var promise = me.ajax('/search/timeline', { ticketid: ticketid });
      promise.then(timeline_handler, timeline_failure).done();
      scope.G_SEARCH.push(promise);
    }

    function _search() {
      var promise = me.ajax('/search/search', {
        search: opts.search,
        time_range: opts.time_range,
        history: opts.history,
        last_ticketid: c_ticketid
      });
      promise.then(
        function(r) {
          if (r.success) {
            c_ticketid = r.ticketid;
            if (!opts.hasOwnProperty('ticketid') && scope) {
              scope.G_ticketid = r.ticketid;
            }
            opts['ticketid'] = r.ticketid; // 필요함
            monitor_timeline(r.ticketid);
          }
        },
        function(errMsg) {
          if (opts.onError) {
            opts.onError(
              errMsg ||
                '시스템 오류가 발생했습니다. 잠시 뒤에 다시 시도해 주세요.'
            );
          }
        }
      );
      scope.G_SEARCH.push(promise);
    }

    _search();
  },

  recovery: function(opts, scope) {
    scope.G_SEARCH = [];
    var me = this,
      init = false;

    function timeline_handler(r) {
      if (r.errmsg) {
        if (opts.onError) {
          opts.onError(r.errmsg);
        }
        return;
      }

      var timeline_finished = 0;
      var stats_finished = 0;
      var data = r.data;

      if (data.length === 0) {
        timeline_finished = 1;
        stats_finished = 1;
      } else {
        timeline_finished = data[0];
        stats_finished = data[1];

        var isStat = data[2];
        var timelineData = data[3]; // left panel stat by source (tempResult, sumResult): timeline count
        var elapsed = data[4]; // elapsed time
        var duration = data[5]; // chart duration
        var stime = data[6];
        var etime = data[7];

        if (isStat) {
          if (opts.onSwitchMode) {
            opts.onSwitchMode('stat'); // 통계데이터가 있을 때, 통계탭 활성화
            if (opts.onUpdateColumns) {
              opts.onUpdateColumns('stat', r.ticketid);
            }
          }
        } else {
          if (opts.onSwitchMode) {
            opts.onSwitchMode('log'); // 로그조회탭 활성화
          }
        }

        if (opts.onUpdateTimeline) {
          opts.onUpdateTimeline(timelineData, elapsed, duration, stime, etime);
        }
      }

      if (!(timeline_finished === 1 && stats_finished === 1)) {
        monitor_timeline(r.ticketid);
      } else if (opts.onDone) {
        opts.onDone(opts, r);
      }
    }

    function timeline_failure(r) {
      if (opts.onError) {
        opts.onError(r.errmsg);
      }
    }

    function monitor_timeline(ticketid) {
      var promise = me.ajax('/search/timeline', { ticketid: ticketid });
      promise.then(timeline_handler, timeline_failure);
      scope.G_SEARCH.push(promise);
    }

    monitor_timeline(opts.ticketid);
  },

  redirectTo: function(menu, tabIndex, callback) {
    // tabIndex, callback 은 옵션임
    var me = this,
      mainView = apps.app.getMainView(),
      mainController = mainView.getController(),
      mainCard = mainView.lookupReference('mainCardPanel'),
      container,
      tabPanel,
      childPanel;

    if (tabIndex == null) {
      mainController.redirectTo('#' + menu);
      return;
    }

    container = mainCard.child(
      Ext.String.format("component[routeId='{0}']", menu)
    );
    if (container) {
      // 해당 페이지가 이전에 로드 돼 있으면 바로 이동
      tabPanel = container.items.getAt(0);
      mainController.redirectTo('#' + menu);
      childPanel = tabPanel.setActiveTab(tabIndex);
      if (callback) {
        callback(childPanel);
      }
    } else {
      // 로드 돼 있지 않으면, 로드 된 이후에 탭 설정
      mainCard.on({
        add: {
          scope: me,
          single: true, // important
          fn: function() {
            container = mainCard.child(
              Ext.String.format("component[routeId='{0}']", menu)
            );
            tabPanel = container.items.getAt(0);
            childPanel = tabPanel.setActiveTab(tabIndex);
            if (callback) {
              childPanel.on({
                boxready: {
                  single: true,
                  fn: function() {
                    callback(childPanel);
                  }
                }
              });
            }
          }
        }
      });
      mainController.redirectTo('#' + menu);
    }
  },

  moveAndSearch: function(queryMode, query, database) {
    var me = this,
      mainView = apps.app.getMainView(),
      searchCt,
      childPanel;

    me.redirectTo('search');

    Ext.defer(function() {
      searchCt = mainView
        .lookupReference('mainCardPanel')
        .child("component[routeId='search']");
      childPanel = searchCt.setActiveTab(
        queryMode === 'zenlog' ? 'logsearch' : 'dbsearch'
      );
      childPanel.lookupReference('query').setValue(query);
      if (queryMode != 'zenlog') {
        // db or dbms
        childPanel.lookupReference('dbcombo').setValue(database);
      }
      childPanel.getController().onSearch();
    }, 500);

    // 나중에 위 코드를 아래 코드로 바꿔야 함

    // me.redirectTo('search', queryMode == 'zenlog' ? 0 : 1, function(childPanel) {
    //     childPanel.lookupReference('query').setValue(query);
    //     if (queryMode != 'zenlog') { // db or dbms
    //         childPanel.lookupReference('dbcombo').setValue(database);
    //     }
    //     childPanel.getController().onSearch();
    // });
  },

  __renderChart: function(canvas, options, data) {
    var view = null; // deprecated
    var chartType = options.chartType,
      legend = options.legend,
      stackMode = options.stackMode,
      xAxis = options.xTitle,
      yAxis = options.yTitle;

    if (options.spline) {
      if (chartType == 'line') chartType = 'spline';
      else if (chartType == 'area') chartType = 'areaspline';
    }

    legend = {
      right: { align: 'right', verticalAlign: 'middle', layout: 'vertical' },
      bottom: { align: 'center', verticalAlign: 'bottom' },
      left: { align: 'left', verticalAlign: 'middle', layout: 'vertical' },
      top: { align: 'center', verticalAlign: 'top' },
      none: { enabled: false }
    }[legend];

    var opts = {
      chart: { type: chartType, renderTo: canvas.id },
      title: { text: options.subject ? options.subject : ' ' },
      legend: legend,
      xAxis: {
        title: { text: xAxis },
        categories: data.categories,
        labels: {
          step: options.step || 1,
          rotation: options.rotation || 0,
          maxStaggerLines: 1
        }
      },
      yAxis: {
        title: { text: yAxis },
        min: 0
      },
      plotOptions: {
        area: {},
        areaspline: {},
        bar: {},
        bubble: {},
        column: {},
        gauge: {},
        line: {},
        pie: {},
        scatter: {},
        series: {},
        spline: {}
      }
    };

    // 3D
    if (chartType == 'column' && options.d3Enable) {
      opts.chart['options3d'] = {
        enabled: true,
        alpha: options.d3Alpha,
        beta: options.d3Beta,
        depth: options.d3Depth,
        viewDistance: options.d3Distance
      };
    }
    if (chartType == 'pie' && options.d3Enable) {
      opts.chart['options3d'] = {
        enabled: true,
        alpha: options.d3Alpha,
        beta: options.d3Beta
      };
      opts.plotOptions.pie['depth'] = options.d3Depth;
    }

    // stackMode
    if (Ext.Array.contains(['column', 'bar', 'area'], chartType)) {
      opts.plotOptions.series['stacking'] = {
        none: null,
        stack: 'normal',
        '100stack': 'percent'
      }[stackMode];
    }

    // donut
    if (chartType == 'pie' && options.donut) {
      if (opts.plotOptions.pie) {
        opts.plotOptions.pie['innerSize'] = '50%';
      }
    }

    // dataLabels
    if (options.dataLabels) {
      opts.plotOptions[chartType]['dataLabels'] = { enabled: true };
    }

    if (chartType == 'area') {
      if (view && view.query_mode == 'zenlog' && view.drilldown_query) {
        attach_drilldown_handler(stackMode, function() {
          // this.series.name, this.category, this.y
          if (is_timestats_query(view.query, this.category)) {
            var keyword = get_timestats_keyword(this.series.name);
            var startdate = this.category;
            var enddate = get_enddate(startdate, view.query);
            drilldown(view.drilldown_query, keyword, startdate, enddate);
          } else {
            drilldown(view.drilldown_query, this.category, null, null);
          }
        });
      }
    } else if (chartType == 'line') {
      // XXX no stack mode
      if (view && view.query_mode == 'zenlog' && view.drilldown_query) {
        attach_drilldown_handler(stackMode, function() {
          // this.series.name, this.category, this.y
          if (is_timestats_query(view.query, this.category)) {
            var keyword = get_timestats_keyword(this.series.name);
            var startdate = this.category;
            var enddate = get_enddate(startdate, view.query);
            drilldown(view.drilldown_query, keyword, startdate, enddate);
          } else {
            drilldown(view.drilldown_query, this.category, null, null);
          }
        });
      }
    } else if (chartType == 'bar') {
      //var tmp = xAxis;
      //xAxis = yAxis;
      //yAxis = tmp; // bug?
      opts['xAxis'] = { title: { text: yAxis }, categories: data.categories };
      opts['yAxis'] = { title: { text: xAxis }, min: 0 };
      if (view && view.query_mode == 'zenlog' && view.drilldown_query) {
        attach_drilldown_handler(stackMode, function() {
          // this.series.name, this.category, this.y
          if (is_timestats_query(view.query, this.category)) {
            var keyword = get_timestats_keyword(this.series.name);
            var startdate = this.category;
            var enddate = get_enddate(startdate, view.query);
            drilldown(view.drilldown_query, keyword, startdate, enddate);
          } else {
            drilldown(view.drilldown_query, this.category, null, null);
          }
        });
      }
    } else if (chartType == 'column') {
      if (view && view.query_mode == 'zenlog' && view.drilldown_query) {
        attach_drilldown_handler(stackMode, function() {
          // this.series.name, this.category, this.y
          if (is_timestats_query(view.query, this.category)) {
            var keyword = get_timestats_keyword(this.series.name);
            var startdate = this.category;
            var enddate = get_enddate(startdate, view.query);
            drilldown(view.drilldown_query, keyword, startdate, enddate);
          } else {
            drilldown(view.drilldown_query, this.category, null, null);
          }
        });
      }
    } else if (chartType == 'pie') {
      opts['xAxis'] = { title: { text: xAxis } };
      if (view && view.query_mode == 'zenlog' && view.drilldown_query) {
        // using `name`
        attach_drilldown_handler(stackMode, function() {
          // this.series.name, this.name, this.y
          if (is_timestats_query(view.query, this.name)) {
            var startdate = this.name;
            var enddate = get_enddate(startdate, view.query);
            drilldown(view.drilldown_query, null, startdate, enddate);
          } else {
            drilldown(view.drilldown_query, this.name, null, null);
          }
        });
      }
    } else if (chartType == 'gauge') {
      // 게이지는 드릴다운 없음
      opts['chart'] = {
        renderTo: canvas.id,
        type: 'gauge',
        plotBackgroundColor: null,
        plotBackgroundImage: null,
        plotBorderWidth: 0,
        plotShadow: false
      };
      opts['pane'] = {
        startAngle: -150,
        endAngle: 150,
        background: [
          {
            backgroundColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [[0, '#FFF'], [1, '#333']]
            },
            borderWidth: 0,
            outerRadius: '109%'
          },
          {
            backgroundColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [[0, '#333'], [1, '#FFF']]
            },
            borderWidth: 1,
            outerRadius: '107%'
          },
          {
            /* default background */
          },
          {
            backgroundColor: '#DDD',
            borderWidth: 0,
            outerRadius: '105%',
            innerRadius: '103%'
          }
        ]
      };
      delete opts['xAxis'];

      var bands = [];
      var min = 0;
      var max = 100;
      var i, l;

      if (window.G_gauge_option) {
        // XXX
      } else {
        var value = data.series[0].data[0];
        var unit = Math.pow(10, ('' + value).length - 1);
        min = parseInt(((value - value * 0.2) / unit) * unit);
        max = parseInt(((value + value * 0.2) / unit) * unit);
        var gap = max - min;
        for (i = 0, l = 3; i < l; i++) {
          if (i == 0) {
            bands.push({ from: min, to: min + gap * 0.5, color: '#55BF3B' });
          } else if (i == 1) {
            bands.push({
              from: min + gap * 0.5,
              to: min + gap * 0.8,
              color: '#DDDF0D'
            });
          } else if (i == 2) {
            bands.push({ from: min + gap * 0.8, to: max, color: '#DF5353' });
          }
        }
      }
      opts['yAxis'] = {
        min: min,
        max: max,
        minorTickInterval: 'auto',
        minorTickWidth: 1,
        minorTickLength: 10,
        minorTickPosition: 'inside',
        minorTickColor: '#666',
        tickPixelInterval: 30,
        tickWidth: 2,
        tickPosition: 'inside',
        tickLength: 10,
        tickColor: '#666',
        labels: { step: 3, rotation: 'auto', maxStaggerLines: 1 },
        title: { text: 'km/h' },
        plotBands: bands
        /*
                 plotBands: [
                 { from: 1794000000, to: 1795000000, color: '#55BF3B' },
                 //{ from: 1794685000, to: 1794688000, color: '#DDDF0D' },
                 { from: 1795000000, to: 1796000000, color: '#DF5353' }
                 ]
                 */
      };
    } else if (chartType == 'spiderweb') {
      for (i = 0, l = data.series.length; i < l; i++) {
        data.series[i]['pointPlacement'] = 'on';
      }
      opts['chart'] = { renderTo: canvas.id, polar: true, type: 'line' };
      opts['xAxis'] = {
        tickmarkPlacement: 'on',
        lineWidth: 0,
        categories: data.categories
      };
      opts['yAxis'] = {
        gridLineInterpolation: 'polygon',
        lineWidth: 0,
        min: 0
      };

      if (view && view.query_mode == 'zenlog' && view.drilldown_query) {
        attach_drilldown_handler(stackMode, function() {
          // this.series.name, this.category, this.y
          if (is_timestats_query(view.query, this.category)) {
            var keyword = get_timestats_keyword(this.series.name);
            var startdate = this.category;
            var enddate = get_enddate(startdate, view.query);
            drilldown(view.drilldown_query, keyword, startdate, enddate);
          } else {
            drilldown(view.drilldown_query, this.category, null, null);
          }
        });
      }
    } else if (chartType == 'columnrange') {
      // 칼럼레인지 드릴다운 없음
      opts['chart'] = {
        renderTo: canvas.id,
        type: 'columnrange',
        inverted: true
      };
      opts['yAxis'] = { title: { text: yAxis } };
    }

    opts['series'] = data.series;

    return new Highcharts.Chart(opts);
  },

  renderMap: function(canvas, options, data) {
    var markers = [],
      i,
      l,
      d;

    canvas.removeAll();
    var map = new apps.view.common.GoogleMapPanel({
      mapOptions: {
        //disableDefaultUI: true,
        panControl: false,
        zoomControl: false,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        overviewMapControl: false,

        zoom: options.zoom,
        center:
          options.latitude && options.longitude
            ? new google.maps.LatLng(
                parseFloat(options.latitude),
                parseFloat(options.longitude)
              )
            : new google.maps.LatLng(36.750137775044195, 127.7763819694519),
        mapTypeId: options.mapTypeId,
        markers: markers,
        styles: [
          {
            featureType: 'water',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          },
          { featureType: 'water', stylers: [{ color: '#666666' }] },
          {
            featureType: 'landscape.natural.landcover',
            stylers: [{ color: '#ffffff' }]
          },
          {
            featureType: 'administrative.province',
            stylers: [{ visibility: 'off' }]
          }
        ]
      },
      listeners: {
        mapready: function() {
          //Ext.defer(function() {
          for (i = 0, l = data.length; i < l; i++) {
            d = data[i];
            if (!d.value) continue;

            new apps.SeverityOverlay(
              map.gmap,
              d.latitude,
              d.longitude,
              2,
              d.value
            );
          }
          //}, 2000);
        }
      }
    });
    canvas.add(map);
  },

  getChartData: function(store, options) {
    var chartType = options.chartType || 'column',
      records = store.getRange(),
      keyColumns = options.keyColumn, // XXX multi required?
      valueColumns = options.valueColumn,
      categories = [],
      series = [],
      names = [],
      i,
      l,
      j,
      k,
      r,
      record,
      category,
      data,
      field,
      index,
      value,
      field_not_found,
      label;

    for (i = 0, l = records.length; i < l; i++) {
      record = records[i];
      category = [];
      for (j = 0; j < keyColumns.length; j++) {
        field = keyColumns[j];
        index = field;
        // index = field.replace(/\./g, '_');

        value =
          record.data[index] !== undefined ? record.data[index] : '(None)'; // timestat 의 경우 변경된(없는) 필드명을 지정한 경우, 오류를 막기위해 NONE으로 채운다.
        category.push(value); // 동적으로 생성한 레코드이기 때문에 .get(name)으로 액세스 불가할 경우가 있음.
      }
      categories.push(category.join(', '));
    }

    for (i = 0, l = valueColumns.length; i < l; i++) {
      field = valueColumns[i];
      index = field;
      // index = field.replace(/\./g, '_');

      data = [];
      field_not_found = false;
      for (j = 0, k = records.length; j < k; j++) {
        record = records[j];
        if (record.data[index] !== undefined) {
          // timestat 의 경우 변경된(없는) 필드명을 지정한 경우, 오류를 막기위해 0으로 채운다.
          value = record.data[index];
        } else {
          value = 0;
          field_not_found = true;
        }
        // important 문자열인 숫자를 parseFloat 로 캐스팅함
        data.push(parseFloat(value)); // 동적으로 생성한 레코드이기 때문에 .get(name)으로 액세스 불가할 경우가 있음.
      }

      if (options.map) {
        label = options.map[field];
      } else {
        label = field;
      }
      label = field_not_found ? label + ' (None)' : label;
      names.push(label);
      series.push({
        name: label,
        type: {
          column: 'bar',
          bar: 'bar',
          line: 'line',
          area: 'line',
          scatter: 'scatter'
        }[options.chartType],
        itemStyle:
          options.chartType == 'area'
            ? { normal: { areaStyle: { type: 'default' } } }
            : {},
        data: data
      });
    }

    if (chartType == 'map') {
      if (options.valueColumn.length == 0) return [];

      var valueColumn = options.valueColumn[0],
        latitudeColumn = options.latitudeColumn,
        longitudeColumn = options.longitudeColumn;

      data = [];
      for (i = 0, l = records.length; i < l; i++) {
        record = records[i];
        data.push({
          latitude: record.get(latitudeColumn),
          longitude: record.get(longitudeColumn),
          value: record.get(valueColumn)
        });
      }
      return data;
    } else if (chartType == 'pie') {
      data = [];
      for (i = 0, l = categories.length; i < l; i++) {
        var sum = 0;
        for (j = 0, k = series.length; j < k; j++) {
          sum += series[j].data[i];
        }
        data.push({ name: categories[i], value: sum });
      }

      r = {
        categories: categories,
        series: [{ type: 'pie', name: names.join(', '), data: data }]
      };
    } else if (chartType == 'radar') {
      data = [];
      var indicator = [];
      for (i = 0, l = categories.length; i < l; i++) {
        indicator.push({ name: categories[i] });
      }
      for (i = 0, l = series.length; i < l; i++) {
        data.push({
          name: series[i].name,
          value: series[i].data
        });
      }
      r = {
        names: names,
        radar: { indicator: indicator },
        series: [{ type: 'radar', name: names.join(', '), data: data }]
      };
    } else if (chartType == 'gauge') {
      r = {
        categories: categories,
        series: [
          { type: 'gauge', name: categories[0], data: [series[0].data[0]] }
        ]
      };
    } else if (chartType == 'scatter') {
      // 2 쌍의 데이터가 필요함
      if (series.length < 2) {
        return { categories: categories, series: [] };
      }
      var s = [];
      for (i = 0, l = series[0].data.length; i < l; i++) {
        s.push([series[0].data[i], series[1].data[i]]);
      }
      r = { categories: categories, series: [{ name: 'Range', data: s }] };
    } else {
      r = { categories: categories, series: series, names: names };
    }
    return r;
  },

  renderChart: function(canvas, uiOptions, data) {
    var me = this;

    var options = {
      column: me.columnChart,
      bar: me.barChart,
      line: me.lineChart,
      area: me.areaChart,
      pie: me.pieChart,
      scatter: me.scatterChart,
      radar: me.radarChart,
      gauge: me.gaugeChart,
      heatmap: me.heatmapChart
    }[uiOptions.chartType](uiOptions, data);

    var chart = echarts.getInstanceByDom(canvas.body.dom);
    if (!chart) {
      chart = echarts.init(canvas.body.dom, 'zen');
    }
    // options.color = [
    //     "#6BB7C8", "#FAC61D", "#D85E3D", "#956E96", "#F7912C", "#9AC23C",
    //     "#998C55", "#DD87B0", "#5479AF", "#E0A93B", "#6B8930", "#A04558",
    //     "#A7D4DF", "#FCDD77", "#E89E8B", "#BFA8C0", "#FABD80", "#C2DA8A",
    //     "#C2BA99", "#EBB7D0", "#98AFCF", "#ECCB89", "#A6B883", "#C68F9B",
    //     "#416E79", "#967711", "#823825", "#59425A", "#94571A", "#5C7424",
    //     "#5C5433", "#85516A", "#324969", "#866523", "#40521D", "#602935"
    // ];
    if (options.legend) {
      options.grid = {
        top: options.legend.top ? 40 : 30,
        right: options.legend.right ? 100 : 10,
        left: options.legend.left ? 100 : 30,
        bottom: options.legend.bottom ? 60 : 30,
        containLabel: true
      };
    } else {
      options.grid = {
        top: 30,
        right: 10,
        left: 30,
        bottom: 30,
        containLabel: true
      };
    }

    var options = Ext.merge(options, { legend: { type: 'scroll' } });
    if (options.series.length > 0) {
      chart.setOption(options);
    } else {
      chart.clear();
    }

    return chart;
  },

  columnChart: function(o, d) {
    var i, l;
    for (i = 0, l = d.series.length; i < l; i++) {
      d.series[i].label = { normal: { show: o.dataLabels, position: 'top' } };
      if (o.stackMode == 'stack') {
        d.series[i].stack = d.names[0];
      }
    }
    var legend = { data: d.names };
    legend[o.legend] = o.legend;
    if (o.legend == 'left' || o.legend == 'right') {
      legend.orient = 'vertical';
    } else if (o.legend == 'none') {
      legend.show = false;
    }

    return {
      title: { text: o.subject, subtext: o.desc },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: legend,
      xAxis: [
        {
          type: 'category',

          name: o.xTitle,
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: { fontSize: 14, fontWeight: 'bold' },

          axisTick: { show: true, interval: 0 },
          axisLabel: { rotate: o.rotation, interval: parseInt(o.step) },
          data: d.categories
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: o.yTitle,
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: { fontSize: 14, fontWeight: 'bold' }
        }
      ],
      series: d.series
    };
  },

  barChart: function(o, d) {
    var i, l;
    for (i = 0, l = d.series.length; i < l; i++) {
      d.series[i].label = { normal: { show: o.dataLabels, position: 'right' } };
      if (o.stackMode == 'stack') {
        d.series[i].stack = d.names[0];
      }
    }
    var legend = { data: d.names };
    legend[o.legend] = o.legend;
    if (o.legend == 'left' || o.legend == 'right') {
      legend.orient = 'vertical';
    } else if (o.legend == 'none') {
      legend.show = false;
    }
    return {
      title: { text: o.subject, subtext: o.desc },
      tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
      legend: legend,
      xAxis: [
        {
          type: 'value',
          name: o.xTitle,
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: { fontSize: 14, fontWeight: 'bold' }
        }
      ],
      yAxis: [
        {
          type: 'category',
          name: o.yTitle,
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: { fontSize: 14, fontWeight: 'bold' },

          data: d.categories
        }
      ],
      series: d.series
    };
  },

  lineChart: function(o, d) {
    var i, l;
    for (i = 0, l = d.series.length; i < l; i++) {
      d.series[i].label = { normal: { show: o.dataLabels, position: 'top' } };
      if (o.stackMode == 'stack') {
        d.series[i].stack = d.names[0];
      }
      d.series[i].smooth = o.spline;
    }
    var legend = { data: d.names };
    legend[o.legend] = o.legend;
    if (o.legend == 'left' || o.legend == 'right') {
      legend.orient = 'vertical';
    } else if (o.legend == 'none') {
      legend.show = false;
    }
    return {
      title: { text: o.subject, subtext: o.desc },
      tooltip: { trigger: 'axis' },
      legend: legend,
      xAxis: [
        {
          type: 'category',

          name: o.xTitle,
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: { fontSize: 14, fontWeight: 'bold' },

          axisTick: { show: true, interval: 0 },
          axisLabel: { rotate: o.rotation, interval: parseInt(o.step) },
          data: d.categories
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: o.yTitle,
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: { fontSize: 14, fontWeight: 'bold' }
        }
      ],
      series: d.series
    };
  },

  areaChart: function(o, d) {
    var i, l;
    for (i = 0, l = d.series.length; i < l; i++) {
      d.series[i].label = { normal: { show: o.dataLabels, position: 'top' } };
      if (o.stackMode == 'stack') {
        d.series[i].stack = d.names[0];
      }
      d.series[i].smooth = o.spline;
    }
    var legend = { data: d.names };
    legend[o.legend] = o.legend;
    if (o.legend == 'left' || o.legend == 'right') {
      legend.orient = 'vertical';
    } else if (o.legend == 'none') {
      legend.show = false;
    }
    return {
      title: { text: o.subject, subtext: o.desc },
      tooltip: { trigger: 'axis' },
      legend: legend,
      xAxis: [
        {
          type: 'category',

          name: o.xTitle,
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: { fontSize: 14, fontWeight: 'bold' },

          axisTick: { show: true, interval: 0 },
          axisLabel: { rotate: o.rotation, interval: parseInt(o.step) },
          data: d.categories
        }
      ],
      yAxis: [
        {
          type: 'value',
          name: o.yTitle,
          nameLocation: 'middle',
          nameGap: 30,
          nameTextStyle: { fontSize: 14, fontWeight: 'bold' }
        }
      ],
      series: d.series
    };
  },

  pieChart: function(o, d) {
    if (o.donut) {
      d.series[0].radius = ['50%', '70%'];
    }
    var legend = { data: d.categories };
    legend[o.legend] = o.legend;
    if (o.legend == 'left' || o.legend == 'right') {
      legend.orient = 'vertical';
    } else if (o.legend == 'none') {
      legend.show = false;
    }
    return {
      title: { text: o.subject, subtext: o.desc },
      legend: legend,
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      series: d.series
    };
  },

  radarChart: function(o, d) {
    var legend = { data: d.names };
    legend[o.legend] = o.legend;
    if (o.legend == 'left' || o.legend == 'right') {
      legend.orient = 'vertical';
    } else if (o.legend == 'none') {
      legend.show = false;
    }
    return {
      title: { text: o.subject, subtext: o.desc },
      legend: legend,
      tooltip: {},
      radar: d.radar,
      series: d.series
    };
  },

  scatterChart: function(o, d) {
    return {
      title: { text: o.subject, subtext: o.desc },
      tooltip: {
        trigger: 'axis' //,
        //showDelay : 0,
        //formatter : function (params) {
        //    if (params.value.length > 1) {
        //        return params.seriesName + ' :<br/>'
        //           + params.value[0] + 'cm '
        //           + params.value[1] + 'kg ';
        //    }
        //    else {
        //        return params.seriesName + ' :<br/>'
        //           + params.name + ' : '
        //           + params.value + 'kg ';
        //    }
        //},
        //axisPointer:{
        //    show: true,
        //    type : 'cross',
        //    lineStyle: {
        //        type : 'dashed',
        //        width : 1
        //    }
        //}
      },
      legend: {
        data: ['여성', '남성']
      },
      xAxis: [
        {
          type: 'value',
          scale: true,
          axisLabel: {
            formatter: '{value} cm'
          }
        }
      ],
      yAxis: [
        {
          type: 'value',
          scale: true,
          axisLabel: {
            formatter: '{value} kg'
          }
        }
      ],
      series: [
        {
          name: '여성',
          type: 'scatter',
          data: [
            [161.2, 51.6],
            [167.5, 59.0],
            [159.5, 49.2],
            [157.0, 63.0],
            [155.8, 53.6],
            [170.0, 59.0],
            [159.1, 47.6],
            [166.0, 69.8],
            [176.2, 66.8],
            [160.2, 75.2],
            [172.5, 55.2],
            [170.9, 54.2],
            [172.9, 62.5],
            [153.4, 42.0],
            [160.0, 50.0],
            [176.5, 71.8],
            [164.4, 55.5],
            [160.7, 48.6],
            [174.0, 66.4],
            [163.8, 67.3]
          ] //,
          //markPoint : {
          //    data : [
          //        {type : 'max', name: '最大值'},
          //        {type : 'min', name: '最小值'}
          //    ]
          //},
          //markLine : {
          //    data : [
          //        {type : 'average', name: '平均值'}
          //    ]
          //}
        },
        {
          name: '남성',
          type: 'scatter',
          data: [
            [174.0, 65.6],
            [175.3, 71.8],
            [193.5, 80.7],
            [186.5, 72.6],
            [187.2, 78.8],
            [180.3, 83.2],
            [180.3, 83.2]
          ] //,
          //markPoint : {
          //    data : [
          //        {type : 'max', name: '最大值'},
          //        {type : 'min', name: '最小值'}
          //    ]
          //},
          //markLine : {
          //    data : [
          //        {type : 'average', name: '平均值'}
          //    ]
          //}
        }
      ]
    };
  },

  gaugeChart: function(o, d) {
    return {
      title: { text: o.subject, subtext: o.desc },
      tooltip: {},
      series: d.series
    };
  },

  heatmapChart: function(o) {
    var hours = [
      '12a',
      '1a',
      '2a',
      '3a',
      '4a',
      '5a',
      '6a',
      '7a',
      '8a',
      '9a',
      '10a',
      '11a',
      '12p',
      '1p',
      '2p',
      '3p',
      '4p',
      '5p',
      '6p',
      '7p',
      '8p',
      '9p',
      '10p',
      '11p'
    ];
    var days = [
      'Saturday',
      'Friday',
      'Thursday',
      'Wednesday',
      'Tuesday',
      'Monday',
      'Sunday'
    ];
    var data = [
      [0, 0, 5],
      [0, 1, 1],
      [0, 2, 0],
      [0, 3, 0],
      [0, 4, 0],
      [0, 5, 0],
      [0, 6, 0],
      [0, 7, 0],
      [0, 8, 0],
      [0, 9, 0],
      [0, 10, 0],
      [0, 11, 2],
      [0, 12, 4],
      [0, 13, 1],
      [0, 14, 1],
      [0, 15, 3],
      [0, 16, 4],
      [0, 17, 6],
      [0, 18, 4],
      [0, 19, 4],
      [0, 20, 3],
      [0, 21, 3],
      [0, 22, 2],
      [0, 23, 5],
      [1, 0, 7],
      [1, 1, 0],
      [1, 2, 0],
      [1, 3, 0],
      [1, 4, 0],
      [1, 5, 0],
      [1, 6, 0],
      [1, 7, 0],
      [1, 8, 0],
      [1, 9, 0],
      [1, 10, 5],
      [1, 11, 2],
      [1, 12, 2],
      [1, 13, 6],
      [1, 14, 9],
      [1, 15, 11],
      [1, 16, 6],
      [1, 17, 7],
      [1, 18, 8],
      [1, 19, 12],
      [1, 20, 5],
      [1, 21, 5],
      [1, 22, 7],
      [1, 23, 2],
      [2, 0, 1],
      [2, 1, 1],
      [2, 2, 0],
      [2, 3, 0],
      [2, 4, 0],
      [2, 5, 0],
      [2, 6, 0],
      [2, 7, 0],
      [2, 8, 0],
      [2, 9, 0],
      [2, 10, 3],
      [2, 11, 2],
      [2, 12, 1],
      [2, 13, 9],
      [2, 14, 8],
      [2, 15, 10],
      [2, 16, 6],
      [2, 17, 5],
      [2, 18, 5],
      [2, 19, 5],
      [2, 20, 7],
      [2, 21, 4],
      [2, 22, 2],
      [2, 23, 4],
      [3, 0, 7],
      [3, 1, 3],
      [3, 2, 0],
      [3, 3, 0],
      [3, 4, 0],
      [3, 5, 0],
      [3, 6, 0],
      [3, 7, 0],
      [3, 8, 1],
      [3, 9, 0],
      [3, 10, 5],
      [3, 11, 4],
      [3, 12, 7],
      [3, 13, 14],
      [3, 14, 13],
      [3, 15, 12],
      [3, 16, 9],
      [3, 17, 5],
      [3, 18, 5],
      [3, 19, 10],
      [3, 20, 6],
      [3, 21, 4],
      [3, 22, 4],
      [3, 23, 1],
      [4, 0, 1],
      [4, 1, 3],
      [4, 2, 0],
      [4, 3, 0],
      [4, 4, 0],
      [4, 5, 1],
      [4, 6, 0],
      [4, 7, 0],
      [4, 8, 0],
      [4, 9, 2],
      [4, 10, 4],
      [4, 11, 4],
      [4, 12, 2],
      [4, 13, 4],
      [4, 14, 4],
      [4, 15, 14],
      [4, 16, 12],
      [4, 17, 1],
      [4, 18, 8],
      [4, 19, 5],
      [4, 20, 3],
      [4, 21, 7],
      [4, 22, 3],
      [4, 23, 0],
      [5, 0, 2],
      [5, 1, 1],
      [5, 2, 0],
      [5, 3, 3],
      [5, 4, 0],
      [5, 5, 0],
      [5, 6, 0],
      [5, 7, 0],
      [5, 8, 2],
      [5, 9, 0],
      [5, 10, 4],
      [5, 11, 1],
      [5, 12, 5],
      [5, 13, 10],
      [5, 14, 5],
      [5, 15, 7],
      [5, 16, 11],
      [5, 17, 6],
      [5, 18, 0],
      [5, 19, 5],
      [5, 20, 3],
      [5, 21, 4],
      [5, 22, 2],
      [5, 23, 0],
      [6, 0, 1],
      [6, 1, 0],
      [6, 2, 0],
      [6, 3, 0],
      [6, 4, 0],
      [6, 5, 0],
      [6, 6, 0],
      [6, 7, 0],
      [6, 8, 0],
      [6, 9, 0],
      [6, 10, 1],
      [6, 11, 0],
      [6, 12, 2],
      [6, 13, 1],
      [6, 14, 3],
      [6, 15, 4],
      [6, 16, 0],
      [6, 17, 0],
      [6, 18, 0],
      [6, 19, 0],
      [6, 20, 1],
      [6, 21, 2],
      [6, 22, 2],
      [6, 23, 6]
    ];
    data = data.map(function(item) {
      return [item[1], item[0], item[2] || '-'];
    });

    return {
      tooltip: { position: 'top' },
      animation: false,
      grid: { height: '50%', y: '10%' },
      xAxis: {
        type: 'category',
        data: hours
      },
      yAxis: {
        type: 'category',
        data: days
      },
      visualMap: {
        min: 1,
        max: 10,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: '15%'
      },
      series: [
        {
          name: 'Punch Card',
          type: 'heatmap',
          data: data,
          label: {
            normal: {
              show: true
            }
          },
          itemStyle: {
            emphasis: {
              shadowBlur: 10,
              shadowColor: 'rgba(0, 0, 0, 0.5)'
            }
          }
        }
      ]
    };
  },

  highlight: function(grid, map, caseSensitive) {
    var tagsRe = /<[^>]*>/gm,
      tagsProtect = '\x0f',
      regExpProtect = /\\|\/|\+|\\|\.|\[|]|\{|}|\?|\$|\*|\^|\|/gm,
      regExpMode = false;

    function getSearchValue(value) {
      if (value === '') {
        return null;
      }
      if (!regExpMode) {
        value = value.replace(regExpProtect, function(m) {
          return '\\' + m;
        });
      } else {
        try {
          new RegExp(value);
        } catch (error) {
          return null;
        }
        // this is stupid
        if (value === '^' || value === '$') {
          return null;
        }
      }
      return value;
    }

    var _map = {};
    for (var column in map) {
      var text_list = map[column];
      for (var i = 0, l = grid.columns.length; i < l; i++) {
        if (grid.columns[i].dataIndex == column) {
          for (var j = 0; j < text_list.length; j++) {
            var text = getSearchValue(text_list[j]);
            if (text) {
              text = new RegExp(text, 'g' + (caseSensitive ? '' : 'i'));
              var k = 'x-grid-cell-' + grid.columns[i].id;
              if (_map[k]) {
                _map[k].push(text);
              } else {
                _map[k] = [text];
              }
            }
          }
        }
      }
    }
    if (!_map) {
      return;
    }

    //grid.view.refresh(); // XXX required?
    var indexes = [];

    grid.store.each(function(record, idx) {
      var i, l;
      var td = grid.view.getNode(idx)
          ? Ext.fly(grid.view.getNode(idx)).down('td')
          : null,
        cell,
        matches,
        cellHTML;
      while (td) {
        var column_class = null;
        var searchRegExp_list = null;

        // FIXME works only HTML5
        if (td.dom.classList && td.dom.classList.length) {
          // not IE (HTML 5)
          for (i = 0, l = td.dom.classList.length; i < l; i++) {
            if (_map[td.dom.classList[i]]) {
              column_class = td.dom.classList[i];
              searchRegExp_list = _map[td.dom.classList[i]];
            }
          }
        }

        if (column_class == null) {
          // not matching field(column)
          td = td.next();
          continue;
        }

        cell = td.down('.x-grid-cell-inner');
        matches = cell.dom.innerHTML.match(tagsRe);
        cellHTML = cell.dom.innerHTML.replace(tagsRe, tagsProtect);

        for (i = 0, l = searchRegExp_list.length; i < l; i++) {
          var searchRegExp = searchRegExp_list[i];
          // populate indexes array, set currentIndex, and replace wrap matched string in a span
          cellHTML = cellHTML.replace(searchRegExp, function(m) {
            if (Ext.Array.indexOf(indexes, idx) === -1) {
              indexes.push(idx);
            }
            //return '<span style="background-color:yellow;font-weight:bold;">' + m + '</span>';
            return '<span style="background-color:#F5E998;">' + m + '</span>';
          });
        }

        // restore protected tags
        Ext.each(matches, function(match) {
          cellHTML = cellHTML.replace(tagsProtect, match);
        });
        // update cell html
        cell.dom.innerHTML = cellHTML;
        td = td.next();
      }
    });
  },

  excel: function(url, params) {
    var $form = jQuery('<form>')
      .attr('method', 'post')
      .attr('action', url);
    jQuery("<input type='hidden'>")
      .attr('value', true)
      .appendTo($form);
    jQuery("<input type='hidden'>")
      .attr('name', 'csrfmiddlewaretoken')
      .attr('value', Ext.util.Cookies.get('csrftoken'))
      .appendTo($form);
    jQuery.each(params, function(name, value) {
      jQuery("<input type='hidden'>")
        .attr('name', name)
        .attr('value', value)
        .appendTo($form);
    });
    $form.appendTo('body');
    $form.submit();
  },

  submit: function(method, url, params) {
    var $form = jQuery('<form>')
      .attr('method', method)
      .attr('action', url);
    jQuery("<input type='hidden'>")
      .attr('name', 'csrfmiddlewaretoken')
      .attr('value', Ext.util.Cookies.get('csrftoken'))
      .appendTo($form);
    jQuery.each(params, function(name, value) {
      jQuery("<input type='hidden'>")
        .attr('name', name)
        .attr('value', value)
        .appendTo($form);
    });
    $form.appendTo('body');
    $form.submit();
  },

  numberfieldKeydown: function(my, e) {
    // ".", "en/kr", ".(number_key)" - Buttons
    if (e.keyCode == 190 || e.keyCode == 229 || e.keyCode == 110) {
      e.preventDefault(); // keyValue is not input event.
    }
  },

  playDashboards: function() {},

  charByteSize: function(ch) {
    if (ch == null || ch.length == 0) {
      return 0;
    }

    var charCode = ch.charCodeAt(0);

    if (charCode <= 0x00007f) {
      return 1;
    } else if (charCode <= 0x0007ff) {
      return 2;
    } else if (charCode <= 0x00ffff) {
      return 3;
    } else {
      return 4;
    }
  },

  stringByteSize: function(str) {
    if (str == null || str.length == 0) {
      return 0;
    }

    var size = 0;
    for (var i = 0; i < str.length; i++) {
      size += apps.charByteSize(str.charAt(i));
    }
    return size;
  },

  check_passwd: function(
    passwd,
    PASSWD_LENGTH,
    PASSWD_ALPHA,
    PASSWD_NUMBER,
    PASSWD_SPECIAL
  ) {
    var ALPHA = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var NUMBER = '1234567890';
    var SPECIAL = '!@#$%^&*()-_+=[]{}';

    if (PASSWD_LENGTH > passwd.length) {
      return { error: 'LENGTH' };
    }

    var types = [];
    if (PASSWD_ALPHA == 'True') {
      types.push(ALPHA);
    }
    if (PASSWD_NUMBER == 'True') {
      types.push(NUMBER);
    }
    if (PASSWD_SPECIAL == 'True') {
      types.push(SPECIAL);
    }

    for (var i = 0; i < types.length; i++) {
      var found = false;
      for (var j = 0; j < passwd.length; j++) {
        if (types[i].indexOf(passwd.charAt(j)) > -1) {
          found = true;
          break;
        }
      }

      if (!found) {
        if (types[i] == ALPHA) {
          return { error: 'ALPHA' };
        } else if (types[i] == NUMBER) {
          return { error: 'NUMBER' };
        } else if (types[i] == SPECIAL) {
          return { error: 'SPECIAL' };
        }
      }
    }

    return { error: '' };
  },

  playSound: function(file, opts) {
    if (!opts) {
      opts = { loop: 0, volume: 1 };
    }
    createjs.Sound.registerSound(file);
    if (createjs.Sound.loadComplete(file)) {
      createjs.Sound.play(file, opts);
    }
  },

  stopSound: function() {
    createjs.Sound.stop();
  },

  constructor: function(config) {
    var me = this;

    if (typeof String.prototype.startsWith != 'function') {
      String.prototype.startsWith = function(str) {
        return this.slice(0, str.length) == str;
      };
    }
    if (typeof String.prototype.endsWith != 'function') {
      String.prototype.endsWith = function(str) {
        return this.slice(-str.length) == str;
      };
    }

    // soundjs 초기화. 아래 코드가 1번만 실행돼야 함. 실행수만큼 사운드가 누적돼어 플레이됨
    createjs.Sound.on('fileload', function(e) {
      createjs.Sound.play(e.src, { loop: 0, volume: 0.1 }); // 0이 한번.
    });

    //----------------------------------------------------------------------------------------------------
    // 전역 설정
    //----------------------------------------------------------------------------------------------------
    // Ajax
    //Ext.Ajax.timeout = 600000; // 600 seconds
    //Ext.override(Ext.form.Basic, { timeout: Ext.Ajax.timeout / 1000 });
    //Ext.override(Ext.data.proxy.Server, { timeout: Ext.Ajax.timeout });
    //Ext.override(Ext.data.Connection, { timeout: Ext.Ajax.timeout });
    //
    //Ext.Ajax.on('beforerequest', function (conn, options) {
    //    if (!(/^http:.*/.test(options.url) || /^https:.*/.test(options.url))) {
    //        if (typeof(options.headers) == "undefined") {
    //            options.headers = {'X-CSRFToken': Ext.util.Cookies.get('csrftoken')};
    //        } else {
    //            options.headers.extend({'X-CSRFToken': Ext.util.Cookies.get('csrftoken')});
    //        }
    //    }
    //}, this);

    Ext.override(Ext.grid.Panel, {
      viewConfig: { enableTextSelection: true }
    });

    //Ext.override(Ext.data.Store, {
    //    setExtraParam: function (name, value) {
    //        this.proxy.extraParams = this.proxy.extraParams || {};
    //        this.proxy.extraParams[name] = value;
    //        this.proxy.applyEncoding(this.proxy.extraParams);
    //    }
    //});
    //Ext.override(Ext.data.TreeStore, {
    //    setExtraParam: function (name, value) {
    //        this.proxy.extraParams = this.proxy.extraParams || {};
    //        this.proxy.extraParams[name] = value;
    //        this.proxy.applyEncoding(this.proxy.extraParams);
    //    }
    //});

    /*
         Ext.override(Ext.Viewport, {
         autoScroll: true, minWidth: 1400, minHeight: 600
         });
         */
    // Viewport 페이지에 따라 재설정.
    // main.css 아래와 같이 css 수정해줘야함.
    // .x-mask { position:fixed; height:100%; width:100%; }
    //Ext.override(Ext.Viewport, {
    //    scrollable: true,
    //    minWidth: 900,
    //    minHeight: 800
    //});

    // Grid Columns
    Ext.override(Ext.grid.column.Column, {
      menuDisabled: true
    });

    //if(window.google) { // google map이 로드 됐을 때만
    //
    //    function SeverityOverlay(map, center, /*lat, lng,*/ level, text) {
    //        this.STYLES = [[53, 53], [56, 56], [66, 66], [78, 78], [90, 90]]; // [width, height] of m1, m2, m3, m4, m5
    //        this.map = map;
    //        this.lat = lat;
    //        this.lng = lng;
    //        this.level = level; // from 1 to 5
    //        this.text = text;
    //        this.width = this.STYLES[level - 1][0];
    //        this.height = this.STYLES[level - 1][1];
    //
    //        this.div = null;
    //        //this.center = new google.maps.LatLng(lat, lng);
    //        this.center = center;
    //
    //        this.setMap(map);
    //    }
    //
    //    SeverityOverlay.prototype = new google.maps.OverlayView();
    //    Ext.apply(SeverityOverlay.prototype, {
    //        onAdd: function() {
    //            var div = this.div = document.createElement('div');
    //            div.style.border = 'none';
    //            div.style.borderWidth = '0px';
    //            div.style.position = 'absolute';
    //            div.style.fontWeight = 'bold';
    //            div.style.fontSize = '11px';
    //            div.style.textAlign = 'center';
    //            div.style.verticalAlign = 'middle';
    //            div.style.width = this.width + 'px';
    //            div.style.height = this.height + 'px';
    //            div.style.lineHeight = this.height + 'px';
    //            div.style.background = 'transparent url(/static/img/googlemap/m' + this.level + '.png) no-repeat';
    //            div.innerHTML = this.text;
    //
    //            //google.maps.event.addDomListener(this.div, 'click', function() {
    //            //    alert('good');
    //            //    //google.maps.event.trigger(m, "drilldown", c.getMarkers());
    //            //});
    //
    //            var panes = this.getPanes();
    //            panes.overlayLayer.appendChild(div);
    //        },
    //        getPosFromLatLng: function(latlng) {
    //            var pos = this.getProjection().fromLatLngToDivPixel(latlng);
    //            pos.x -= parseInt(this.width / 2, 10);
    //            pos.y -= parseInt(this.height / 2, 10);
    //            return pos;
    //        },
    //        draw: function() {
    //            var div = this.div;
    //            var pos = this.getPosFromLatLng(this.center);
    //            div.style.left = pos.x + 'px';
    //            div.style.top = pos.y + 'px';
    //        },
    //        onRemove: function() {
    //            this.div.parentNode.removeChild(this.div);
    //            this.div = null;
    //        },
    //        hide: function() {
    //            if(this.div) {
    //                this.div.style.visibility = "hidden";
    //            }
    //        },
    //        show: function() {
    //            if(this.div) {
    //                this.div.style.visibility = "visible";
    //            }
    //        },
    //        toggle: function() {
    //            if(this.div) {
    //                if(this.div.style.visibility == "hidden") {
    //                    this.show();
    //                } else {
    //                    this.hide();
    //                }
    //            }
    //        },
    //        toggleDOM: function() {
    //            if(this.getMap()) {
    //                this.setMap(null);
    //            } else {
    //                this.setMap(this.map);
    //            }
    //        }
    //    });
    //}
  },

  setAnimate: function(cp, animateName, soundFile) {
    if (cp._animate != true) {
      cp.addCls(Ext.String.format('animated {0}', animateName));
      if (soundFile) {
        apps.playSound(
          Ext.String.format('/static/apps/resources/sound{0}', soundFile),
          { loop: 0, volume: 0.1 }
        );
      }
      cp._animate = true;
      setTimeout(function() {
        cp.removeCls(Ext.String.format('animated {0}', animateName));
        cp._animate = false;
      }, 500);
    }
  },

  notify: (data, duration = 5000) => {
    /* global apps */
    const tpl = apps.view.common.Util.notifyDataTpl(data.type, data);
    const target = document.getElementById('msg-div');
    const el = Ext.dom.Helper.insertFirst(target, tpl, true);

    apps.view.common.Util.slideIn(el);

    el.slideOutTask = setTimeout(() => {
      apps.view.common.Util.slideOut(el);
    }, duration);
  },

  notifyDataTpl: (type, data, dt_fmt = 'Y-m-d H:i') => {
    let tpl = null;

    if (type === 'data_synchronize_history') {
      data.createTime = Ext.Date.format(new Date(data.create_time), dt_fmt);
      data.updateTime = Ext.Date.format(new Date(data.update_time), dt_fmt);

      tpl = new Ext.XTemplate(
        '<div class="msg" style="opacity: 0">',
        `<h3>
          [{status_display}] {category_display}
          <img src="/static/img/icons/cross.png" class="close">
          <img src="/static/img/icons/control_pause.png" class="pause">
        </h3>`,
        '<span class="date" style="">작업 일시: {createTime} - {updateTime}</span>',
        '<p>실행자(이메일): {performer}({performer_email})</p>',
        '<p>결과 내용: {response}</p>',
        '</div>'
      ).apply(data);
    } else {
      tpl = new Ext.XTemplate(
        '<div class="msg" style="opacity: 0">',
        '<h3>{title}<img src="/static/img/icons/cross.png" class="close"></h3>',
        '<span class="date" style="">[{[Ext.Date.format(new Date(), "Y-m-d H:i:s")]}]</span>',
        '<p>{message}</p>',
        '</div>'
      ).apply(data);
    }

    return tpl;
  },

  slideIn: el => {
    const width = el.getWidth();
    const x = el.getX();

    el.setX(x + width);
    el.animate({
      to: { opacity: 1, x },
      duration: 300
    });
  },

  slideOut: el => {
    if (el.dom) {
      const width = el.getWidth();
      const x = el.getX();

      el.animate({
        easing: 'bounceOut',
        to: { opacity: 0, x: x + width },
        duration: 1000,
        remove: true
      });
    } else {
      el.destroy();
    }
  },

  findColumns: function(depth, columns, data, line, max) {
    var me = this;

    for (var i = 0, l = columns.length; i < l; i += 1) {
      var tempDepth =
        depth == ''
          ? columns[i].text
          : Ext.String.format('{0}%^&{1}', depth, columns[i].text);
      if (columns[i].hasOwnProperty('columns')) {
        max = me.findColumns(
          tempDepth,
          columns[i].columns,
          data,
          line + 1,
          max
        );
      } else {
        if (line + 1 > max) {
          max = line + 1;
        }
        data.push(tempDepth);
      }
    }
    return max;
  },

  getHeader: function(columns) {
    var me = this,
      tempData = [],
      max = 0,
      tempHeader = [],
      header = [],
      temp = [],
      i,
      l;

    max = me.findColumns('', columns, tempData, 0, max);
    for (i = 0, l = tempData.length; i < l; i += 1) {
      temp = tempData[i].split('%^&');
      for (var len = temp.length; len < max; len += 1) {
        temp.push(temp[len - 1]);
      }
      tempHeader.push(temp);
    }

    for (i = 0, l = max; i < l; i += 1) {
      temp = [];
      for (var j = 0, m = tempHeader.length; j < m; j += 1) {
        temp.push(tempHeader[j][i]);
      }
      header.push(temp);
    }
    return header;
  },

  getColumnInfo: function(columns, title) {
    var data = [];
    columns.forEach(column => {
      if (column.dataIndex) {
        data.push([
          column.text,
          column.dataIndex,
          parseInt(column.getWidth() * 0.8, 10)
        ]);
      }
    });

    return data;
  },

  humanSize: function(size) {
    var unitSeq = ['Bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB'],
      last = size,
      unit = unitSeq.shift(),
      rest;

    while (true) {
      rest = last / 1024.0;
      if (rest < 1) {
        break;
      }
      last = rest;
      unit = unitSeq.shift();
    }
    return Ext.String.format('{0} {1}', parseInt(last), unit);
  },
  humanSizeN: function(size) {
    var unitSeq = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB'],
      last = size,
      unit = unitSeq.shift(),
      rest;

    while (true) {
      rest = last / 1000;
      if (rest < 1) {
        break;
      }
      last = rest;
      unit = unitSeq.shift();
    }
    return Ext.String.format('{0} {1}', parseInt(last), unit);
  },

  activePage: function() {
    var mainPanel = apps.app.getMainView(),
      mainPage = mainPanel.items.items[1].items.items[1].items.items,
      selectPage = null;
    for (var i = 0, l = mainPage.length; i < l; i += 1) {
      if (!mainPage[i].hidden) {
        selectPage = mainPage[i];
      }
    }

    return Ext.String.format(
      '{0}_{1}',
      selectPage.xtype,
      selectPage.items.items[0].getActiveTab().xtype
    );
  },

  ipv4Check: function(ip) {
    var regExp = /^([01]?\d\d?|2[0-4]\d|25[0-5])(\.([01]?\d\d?|2[0-4]\d|25[0-5])){3}$/;

    return regExp.test(ip);
  },

  regExp: function(type) {
    switch (type) {
      case 'ip_address':
        return new RegExp(
          '^(' +
            // ipv4
            '((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)' +
            '|' +
            // ipv6
            '((([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]).){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])))' +
            ')$'
        );
      default:
        break;
    }
  },

  getIsSuperuser: function() {
    const session = this.getSession();
    if (session) {
      return session.get('is_superuser');
    } else {
      return false;
    }
  }
});

apps.ajax = apps.view.common.Util.ajax;
apps.search = apps.view.common.Util.search;
apps.recovery = apps.view.common.Util.recovery;
apps.timelineUpdate = apps.view.common.Util.timelineUpdate;
apps.redirectTo = apps.view.common.Util.redirectTo;
apps.moveAndSearch = apps.view.common.Util.moveAndSearch;
apps.getChartData = apps.view.common.Util.getChartData;
apps.renderMap = apps.view.common.Util.renderMap;
//apps.SeverityOverlay = apps.view.common.Util.SeverityOverlay;
apps.highlight = apps.view.common.Util.highlight;
apps.excel = apps.view.common.Util.excel;
apps.submit = apps.view.common.Util.submit;
apps.numberfieldKeydown = apps.view.common.Util.numberfieldKeydown;
apps.playDashboards = apps.view.common.Util.playDashboards;
apps.notify = apps.view.common.Util.notify;
apps.humanSize = apps.view.common.Util.humanSize;
apps.humanSizeN = apps.view.common.Util.humanSizeN;

apps.renderChart = apps.view.common.Util.renderChart;
apps.columnChart = apps.view.common.Util.columnChart;
apps.barChart = apps.view.common.Util.barChart;
apps.lineChart = apps.view.common.Util.lineChart;
apps.areaChart = apps.view.common.Util.areaChart;
apps.pieChart = apps.view.common.Util.pieChart;
apps.scatterChart = apps.view.common.Util.scatterChart;
apps.radarChart = apps.view.common.Util.radarChart;
apps.gaugeChart = apps.view.common.Util.gaugeChart;
apps.heatmapChart = apps.view.common.Util.heatmapChart;
apps.charByteSize = apps.view.common.Util.charByteSize;
apps.stringByteSize = apps.view.common.Util.stringByteSize;
apps.check_passwd = apps.view.common.Util.check_passwd;
apps.playSound = apps.view.common.Util.playSound;
apps.stopSound = apps.view.common.Util.stopSound;
apps.setAnimate = apps.view.common.Util.setAnimate;
apps.activePage = apps.view.common.Util.activePage;
apps.ipv4Check = apps.view.common.Util.ipv4Check;
apps.getNowView = apps.view.common.Util.getNowView;
apps.regExp = apps.view.common.Util.regExp;

apps.SeverityOverlay = function(map, lat, lng, level, text) {
  this.prototype = new google.maps.OverlayView();

  this.STYLES = [[53, 53], [56, 56], [66, 66], [78, 78], [90, 90]]; // [width, height] of m1, m2, m3, m4, m5
  this.map = map;
  this.lat = lat;
  this.lng = lng;
  this.level = level; // from 1 to 5
  this.text = text;
  this.width = this.STYLES[level - 1][0];
  this.height = this.STYLES[level - 1][1];

  this.div = null;
  this.center = new google.maps.LatLng(lat, lng);

  this.setMap(map);
};

apps.SeverityOverlay.prototype =
  typeof google != 'undefined' ? new google.maps.OverlayView() : null;
Ext.apply(apps.SeverityOverlay.prototype, {
  onAdd: function() {
    var me = this,
      div = document.createElement('div'),
      style = div.style,
      panes = me.getPanes();

    style.border = 'none';
    style.borderWidth = '0px';
    style.position = 'absolute';
    style.fontWeight = 'bold';
    style.fontSize = '11px';
    style.textAlign = 'center';
    style.verticalAlign = 'middle';
    style.width = me.width + 'px';
    style.height = me.height + 'px';
    style.lineHeight = me.height + 'px';
    //style.background = 'transparent url(/static/img/googlemap/m'+this.level+'_3d.png) no-repeat';
    style.background =
      'transparent url(/static/apps/resources/images/googlemap/m' +
      this.level +
      '_3d.png) no-repeat';
    div.innerHTML = me.text;
    me.div = div;

    panes.overlayLayer.appendChild(div);
  },
  getPosFromLatLng: function(latlng) {
    var pos = this.getProjection().fromLatLngToDivPixel(latlng);
    pos.x -= parseInt(this.width / 2, 10);
    pos.y -= parseInt(this.height / 2, 10);
    return pos;
  },
  draw: function() {
    var div = this.div,
      style = div.style,
      pos = this.getPosFromLatLng(this.center);
    style.left = pos.x + 'px';
    style.top = pos.y + 'px';
  },
  onRemove: function() {
    this.div.parentNode.removeChild(this.div);
    this.div = null;
  },
  hide: function() {
    if (this.div) {
      this.div.style.visibility = 'hidden';
    }
  },
  show: function() {
    if (this.div) {
      this.div.style.visibility = 'visible';
    }
  },
  toggle: function() {
    if (this.div) {
      if (this.div.style.visibility == 'hidden') {
        this.show();
      } else {
        this.hide();
      }
    }
  },
  toggleDOM: function() {
    if (this.getMap()) {
      this.setMap(null);
    } else {
      this.setMap(this.map);
    }
  }
});
