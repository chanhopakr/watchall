/**
 * Created by zen on 17. 4. 7.
 */
Ext.define('apps.ux.grid.ZqlGrid', {
  extend: 'Ext.grid.Panel',
  xtype: 'zqlgrid',
  requires: ['apps.ux.ZqlBuilder'],
  config: {
    ticketURL: '/zql/getTicket',
    downloadURL: '/zql/download',
    downloadRawCount: 100000,
    statsQuery: false,
    sourceName: null,
    zqlBuilder: null,
    query: null
  },
  autoLoad: false,
  maskElement: 'body',
  initComponent: function() {
    var me = this;
    var query = this.getQuery();
    var store = Ext.create('Ext.data.Store', {
      pageSize: 20,
      remoteSort: true,
      proxy: {
        url: '/zql/logs',
        type: 'ajax',
        timeout: 300 * 1000,
        reader: {
          type: 'json',
          rootProperty: 'data',
          totalProperty: 'totalCount'
        }
      },
      listeners: {
        beforeload: me.beforeload.bind(me),
        beforesort: me.sortColumnIndexChange.bind(me)
      }
    });
    if (query) {
      store
        .getProxy()
        .getReader()
        .setKeepRawData(true);
      store.on('load', function(store) {
        var rawData = store.getProxy().getReader().rawData;
        var columns = [];
        for (var i = 0, l = rawData.columns.length; i < l; i++) {
          column = rawData.columns[i];
          index = column;
          columns.push({
            text: column,
            dataIndex: index,
            width: column == '_raw' ? 1000 : 120,
            cellWrap: null
          });
        }
        me.reconfigure(store, columns);
      });
    }

    store.getSorters().$sortable.setDefaultSortDirection('DESC');
    Ext.apply(this, {
      store: store,
      dockedItems: [
        {
          xtype: 'pagingtoolbar',
          store: store,
          dock: 'bottom',
          displayInfo: true
        }
      ]
    });
    this.callParent(arguments);
    if (this.initLoad) {
      this.loadPage();
    }
  },

  loadPage: function() {
    var me = this;
    var query = me.getQuery();
    var store = this.getStore();
    var proxy = store.getProxy();
    if (query) {
      store.removeAll();
      if (me.isVisible()) {
        me.mask('loading..');
      }
      apps
        .ajax(this.ticketURL, {
          last_ticketid: me.last_ticketid,
          query: query
        })
        .then(function(res) {
          if (res.success) {
            me.last_ticketid = res.ticketid;
            proxy.setExtraParam('ticketid', res.ticketid);
            store.loadPage(1);
          }
        })
        .always(function() {
          if (me.isVisible()) {
            me.unmask();
          }
        })
        .done();
    } else {
      var fields = this.fields;
      if (!fields) {
        fields = _(this.getColumns())
          .reject(function(column) {
            return column.lookupField;
          })
          .map(function(field) {
            return field.dataIndex == 'date' ? '_date' : field.dataIndex;
          })
          .value();
      }
      var zqlBuilder = this.getZqlBuilder();
      if (this.ticketURL && fields && zqlBuilder) {
        store.removeAll();
        if (this.getStatsQuery()) {
          zqlBuilder.fields(fields);
          this.sortColumnIndexChange(store);
          store.loadPage(1);
        } else {
          zqlBuilder.fields(fields);
          if (me.isVisible()) {
            me.mask('loading..');
          }
          apps
            .ajax(this.ticketURL, {
              last_ticketid: me.last_ticketid,
              query: zqlBuilder.getQuery({ rawlog: true })
            })
            .then(function(res) {
              if (res.success) {
                var sourceName = me.getSourceName();
                me.last_ticketid = res.ticketid;
                if (me.sourceName) {
                  proxy.setExtraParam('source', sourceName);
                }
                proxy.setExtraParam('ticketid', res.ticketid);
                proxy.setExtraParam(
                  'lookup',
                  Ext.encode(zqlBuilder.getLookup())
                );
                proxy.setExtraParam(
                  'columns',
                  Ext.encode(zqlBuilder.getFields())
                );
                store.loadPage(1);
              }
            })
            .always(function() {
              if (me.isVisible()) {
                me.unmask();
              }
            })
            .done();
        }
      }
    }
  },

  removeSorter: function() {
    this.getStore()
      .getSorters()
      .clear();
    this.setStatsQuery(false);
  },

  sortColumnIndexChange: function(store) {
    var zqlBuilder = this.getZqlBuilder();
    if (zqlBuilder) {
      var sorters = store.getSorters();
      if (sorters.length > 0) {
        var sorter = sorters.first();
        var sortValue = sorter.getId();
        var direction = sorter.getDirection();
        // _date(내림차순)정렬은 원본로그 조회 API로 가져온다
        if (sortValue == 'date' && direction == 'DESC') {
          this.setStatsQuery(false);
        } else {
          this.setStatsQuery(true);
          if (sortValue == 'date') sortValue = '_date';
          var columns = zqlBuilder.columns;
          var index = columns.indexOf(sortValue);
          if (index > -1) {
            columns.splice(index, 1);
            columns.splice(0, 0, sortValue);
            zqlBuilder.direction = direction;
          }
        }
      }
    }
  },

  beforeload: function(store) {
    var zqlBuilder = this.getZqlBuilder();
    var proxy = store.getProxy();
    if (this.getStatsQuery()) {
      proxy.setUrl('/zql/stats_rawlog');
      var countBuilder = zqlBuilder
        .clone()
        .removeFields()
        .extra('stats count(_date) as totalCount');
      proxy.setExtraParam('count_query', countBuilder.getQuery());
      proxy.setExtraParam(
        'query',
        zqlBuilder.limit(store.pageSize * store.currentPage).getQuery()
      );
    } else if (this.getQuery()) {
      proxy.setUrl('/search/stat');
    } else {
      proxy.setUrl('/zql/logs');
    }
  },

  download: function(mode) {
    var me = this,
      downloadURL = me.getDownloadURL(),
      store = this.getStore(),
      totalCount = store.totalCount,
      deferred = new Ext.Deferred();
    if (totalCount == 0) {
      deferred.reject('데이터가 없습니다');
      return deferred.promise;
    }
    if (downloadURL) {
      this.getDownloadParams(mode).then(
        function(params) {
          params['mode'] = mode;
          params['fileName'] = me.fileName || params.source;
          params['lookup'] = Ext.encode(params.lookup);
          params['columns'] = Ext.encode(params.columns);
          params['columnsInfo'] = Ext.encode(params.columnsInfo);
          apps.excel(downloadURL, params);
        },
        function(errMsg) {
          deferred.reject(errMsg);
        }
      );
    } else {
      deferred.reject('downloadURL이 지정되지 않았습니다.');
    }
    return deferred.promise;
  },

  getDownloadParams: function(mode) {
    var deferred = new Ext.Deferred();
    var me = this,
      fields = me.fields,
      columns = me.getColumns(),
      store = me.getStore(),
      totalCount = store.getTotalCount(),
      zqlBuilder = me.getZqlBuilder(),
      columnsInfo = [],
      maxRows = 65536;

    if (!zqlBuilder) {
      deferred.reject('검색 조건이 존재하지 않습니다');
    }
    if (mode === 'xls' && totalCount > maxRows) {
      deferred.reject(
        Ext.String.format(
          '다운로드 데이터가 엑셀 최대 레코드 수({0})를 초과했습니다.' +
            'CSV 다운로드를 이용해주세요.',
          maxRows
        )
      );
    }
    if (!fields) {
      fields = _(columns)
        .reject(function(column) {
          return column.lookupField;
        })
        .map(function(column) {
          return column.dataIndex === 'date' ? '_date' : column.dataIndex;
        })
        .value();
    }
    _.each(columns, function(column) {
      columnsInfo.push({
        dataIndex: column.dataIndex,
        text: column.text,
        width: column.width
      });
    });
    zqlBuilder.fields(fields);
    apps
      .ajax(this.ticketURL, {
        query: zqlBuilder.getQuery({ rawlog: true })
      })
      .then(function(res) {
        var params = {
          type: 'zql',
          ticketid: res.ticketid,
          lookup: zqlBuilder.getLookup(),
          columns: zqlBuilder.getFields(),
          columnsInfo: columnsInfo,
          limit: me.downloadRawCount
        };
        var sourceName = me.getSourceName();
        if (sourceName) {
          params.source = sourceName;
        }
        deferred.resolve(params);
      });

    return deferred.promise;
  }
});
