Ext.define('apps.view.common.BaseGrid', {
  extend: 'Ext.grid.Panel',

  requires: ['Ext.data.Store', 'Ext.data.proxy.Ajax', 'Ext.toolbar.Paging'],

  loadMask: true,
  enableColumnMove: false,
  pageSize: 20,
  remoteSort: true,
  showLoading: true,

  initComponent: function() {
    var me = this;
    var i, l;
    if (me.enableTextSelection != false) {
      if (me.viewConfig) {
        me.viewConfig['enableTextSelection'] = true;
      } else {
        me.viewConfig = { enableTextSelection: true };
      }
    }

    if (me.ttitle || me.tbuttons) {
      if (me.ttitle) {
        me.tbar = [
          '<span class="x-window-header-text-default">' + me.ttitle + '</span>'
        ];
      } else {
        me.tbar = [];
      }
      if (me.tbuttons) {
        me.tbar.push('->');
        for (i = 0, l = me.tbuttons.length; i < l; i++) {
          me.tbar.push(me.tbuttons[i]);
        }
      }
    }

    if (!me.store) {
      var fields = ['id'];
      var f = null;
      if (me.extFields) {
        for (i = 0, l = me.extFields.length; i < l; i++) {
          fields.push(me.extFields[i]);
        }
      }
      if (me.columns && me.columns.length > 0) {
        for (i = 0, l = me.columns.length; i < l; i++) {
          if (me.columns[i] && me.columns[i].columns) {
            // grouped header
            for (var j = 0, k = me.columns[i].columns.length; j < k; j++) {
              f = { name: me.columns[i].columns[j].dataIndex };
              if (me.columns[i].columns[j].type) {
                f['type'] = me.columns[i].columns[j].type;
              }
              fields.push(f);
            }
          } else {
            f = { name: me.columns[i] ? me.columns[i].dataIndex : '' };
            if (me.columns[i] && me.columns[i].type) {
              f['type'] = me.columns[i].type;
            }
            fields.push(f);
          }
        }
      }
      me.store = new Ext.data.Store({
        fields: fields,
        pageSize: me.pageSize,
        remoteFilter: false,
        remoteSort: me.remoteSort,
        proxy: {
          type: 'ajax',
          url: me.url,
          reader: { rootProperty: 'data', totalProperty: 'totalCount' }
        },
        sorters: me.sorters //,
        //autoLoad: me.autoLoad || 'false'
      });
    }

    if (me.paging == undefined || me.paging) {
      me.pagingtoolbar = new Ext.PagingToolbar({
        store: me.store
      });
      me.bbar = me.pagingtoolbar;
    }

    me.callParent(arguments);
    if (me.showLoading) {
      //me.store.on('beforeload', function() {
      //    me.setLoading(true);
      //});
      //me.store.on('load', function() {
      //    me.setLoading(false);
      //});
    }
    //if(me.copyToClipboard) { // html => /static/js/zclip/jquery.zclip.min.js, ex. copyToClipboard: [0, 1, 2]
    //    me.on('cellclick', function(iView, iCellEl, iColIdx, iStore, iRowEl, iRowIdx, iEvent) {
    //        for(var i in me.copyClipboard) {
    //            if(i==iColIdx) {
    //                $(iCellEl).zclip({
    //                    path: '/static/js/zclip/ZeroClipboard.swf',
    //                    copy: iStore.get(me.columns[iColIdx].dataIndex),
    //                    setHandCursor: false,
    //                    afterCopy: function() {
    //                    }
    //                });
    //                break;
    //            }
    //        }
    //    });
    //}
  },
  setTTitle: function(ttitle) {
    var me = this;
    var tbar = me.getDockedItems('toolbar[dock="top"]')[0];
    tbar
      .getComponent(0)
      .setText(
        '<span class="x-window-header-text-default">' + ttitle + '</span>'
      );
  },
  getSelectedRecord: function() {
    var me = this;
    var sm = me.getSelectionModel();
    var records = sm.getSelection();
    if (records.length > 0) {
      return records[0];
    }
    return null;
  },
  setPageSize: function(pageSize) {
    var me = this;
    me.store.pageSize = pageSize;
  },
  moveSelectedRow: function(direction) {
    var me = this;
    var records = me.getSelectionModel().getSelection();
    if (!records) {
      return;
    }
    var record = records[0];
    var store = me.getStore();
    var index = store.indexOf(record);
    if (direction < 0) {
      index += 1;
      if (index < 0) {
        return;
      }
    } else {
      index += 1;
      if (index >= store.getCount()) {
        return;
      }
    }
    store.remove(record);
    store.insert(index, record);
    me.getSelectionModel().select(record);
  }
});
