Ext.define('apps.view.common.DirectoryDialog', {
  extend: 'Ext.window.Window',

  requires: [
    'Ext.button.Button',
    'Ext.data.TreeStore',
    'Ext.data.reader.Json',
    'Ext.form.field.Display',
    'Ext.layout.container.Border',
    'Ext.layout.container.Fit',
    'Ext.menu.Menu',
    'Ext.panel.Panel',
    'Ext.selection.CheckboxModel',
    'Ext.tree.Panel',
    'Ext.tree.plugin.TreeViewDragDrop',
    'apps.view.common.BaseGrid'
  ],

  uses: ['apps.view.common.NewDirectoryWindow'],

  width: 900,
  height: 500,
  border: false,
  iconCls: 'x-fa fa-folder-open-o',
  title: '디렉토리 선택',
  layout: 'border',
  initComponent: function() {
    var me = this;
    me.lastSelectedDir = null;

    var treeProxy = {
      type: 'ajax',
      url: '/' + me.type + '/getDirectories'
    };

    if (me.type != 'agent') {
      me.type = 'fileob';
      treeProxy = {
        type: 'ajax',
        url: '/' + me.type + '/listDirectory',
        extraParams: {
          directory: 1,
          limit: 10000
        },
        reader: {
          type: 'json',
          rootProperty: 'data',
          totalProperty: 'totalCount'
        }
      };
    }

    me.contextMenu = new Ext.menu.Menu({
      items: [
        new Ext.Action({
          text: '생성',
          handler: function() {
            var records = me.tree.getSelectionModel().getSelection();
            if (records.length == 0) {
              Ext.Msg.alert('알림', '디렉토리를 선택해주세요.');
              return;
            }
            new apps.view.common.NewDirectoryWindow({
              //opener: me, node: me.lastSelectedDir,
              listeners: {
                save: function(dialog, dir) {
                  var addr;
                  if (me.type == 'agent') {
                    addr = '/agent/makeDirectory';
                  } else {
                    addr = '/fileob/makeDirectory';
                  }

                  var params = {
                    ip: me.opener.ip,
                    name: me.opener.name,
                    node: me.node + '/' + dir,
                    id: me.hostId,
                    agent: me.agent,
                    svr_type: me.opener.svr_type,
                    hadoop_ip: me.opener.hadoop_ip,
                    hadoop_port: me.opener.hadoop_port,
                    hadoop_user: me.opener.hadoop_user
                  };

                  apps.ajax(addr, params, function() {
                    me.opener.treeStore.load({
                      node: me.opener.tree
                        .getRootNode()
                        .findChild('id', me.node, true),
                      id: me.hostId
                    });
                  });
                }
              }
            }).show();
          }
        }),
        new Ext.Action({
          text: '삭제',
          handler: function() {
            var records = me.tree.getSelectionModel().getSelection();
            if (records.length == 0) {
              Ext.Msg.alert('알림', '디렉토리를 선택해주세요.');
              return;
            }
            Ext.Msg.confirm('확인', '정말 실행하시겠습니까?', function(btn) {
              if (btn == 'no') return;
              var params = {
                ip: me.ip,
                name: me.name,
                node: me.lastSelectedDir,
                id: me.hostId,
                agent: me.agent,
                svr_type: me.svr_type,
                hadoop_ip: me.hadoop_ip,
                hadoop_port: me.hadoop_port,
                hadoop_user: me.hadoop_user
              };
              apps.ajax('/' + me.type + '/rmDirectory', params, function() {
                me.treeStore.load({
                  node: me.tree
                    .getRootNode()
                    .findChild('id', me.lastSelectedDir, true).parentNode,
                  id: me.hostId
                });
                // refresh
              });
            });
          }
        })
      ]
    });
    me.treeStore = new Ext.data.TreeStore({
      proxy: treeProxy,
      root: { text: '/', id: '/', expanded: true },
      folderSort: true,
      listeners: {
        beforeload: function(s) {
          var proxy = s.getProxy();
          proxy.setExtraParam('ip', me.ip);
          proxy.setExtraParam('name', me.name);
          proxy.setExtraParam('agent', me.agent);
          proxy.setExtraParam('svr_type', me.svr_type);
          proxy.setExtraParam('hadoop_ip', me.hadoop_ip);
          proxy.setExtraParam('hadoop_port', me.hadoop_port);
          proxy.setExtraParam('hadoop_user', me.hadoop_user);
        }
      }
    });

    me.tree = new Ext.tree.Panel({
      store: me.treeStore,
      border: false,
      rootVisible: true,
      multiSelect: false,
      singleExpand: false,
      viewConfig: {
        plugins: { ptype: 'treeviewdragdrop' },
        listeners: {
          beforedrop: function(
            node,
            data,
            overModel,
            dropPosition,
            dropFunction
          ) {
            var from = data.records[0].get('id');
            var to = overModel.get('id');

            dropFunction.wait = true;
            Ext.MessageBox.confirm('확인', '드롭하시겠습니까?', function(btn) {
              if (btn == 'yes') {
                var params = {
                  ip: me.ip,
                  name: me.name,
                  from: from,
                  to: to,
                  id: me.hostId,
                  agent: me.agent,
                  svr_type: me.svr_type,
                  hadoop_ip: me.hadoop_ip,
                  hadoop_port: me.hadoop_port,
                  hadoop_user: me.hadoop_user
                };
                apps.ajax('/' + me.type + '/moveDirectory', params, function() {
                  dropFunction.processDrop();
                  me.treeStore.load({
                    node: me.tree.getRootNode().findChild('id', to, true)
                      .parentNode,
                    id: me.hostId
                  });
                });
              } else {
                dropFunction.cancelDrop();
              }
            });
          }
        }
      },

      listeners: {
        itemcontextmenu: function(grid, record, item, index, e) {
          if (me.type == 'agent') {
            return;
          }
          e.stopEvent();
          me.contextMenu.showAt(e.getXY());
          return false;
        },
        itemclick: function(panel, record) {
          var proxy;
          if (me.type == 'agent' && record.get('id') == '/') {
            proxy = me.grid.store.getProxy();
            proxy.setExtraParam('ip', me.ip);
            proxy.setExtraParam('node', '/');
            proxy.setExtraParam('id', me.hostId);
            proxy.setExtraParam('agent', me.agent);
            me.grid.store.load();
            me.pathDisplay.setValue('/');
            return;
          }

          //if (record.get('iconCls') != 'folder') {
          //    //me.grid.store.removeAll();
          //    return;
          //}
          var node = record.get('id'),
            patten = /\/[a-zA-Z]:/;

          if (patten.test(node)) {
            node = node.replace('/', '');
          }
          me.lastSelectedDir = node;
          // load file grid
          proxy = me.grid.store.getProxy();
          proxy.setExtraParam('ip', me.ip);
          proxy.setExtraParam('node', node);
          proxy.setExtraParam('id', me.hostId);
          proxy.setExtraParam('agent', me.agent);
          proxy.setExtraParam('name', me.name);
          // hadoop
          proxy.setExtraParam('svr_type', me.svr_type);
          proxy.setExtraParam('hadoop_ip', me.hadoop_ip);
          proxy.setExtraParam('hadoop_port', me.hadoop_port);
          proxy.setExtraParam('hadoop_user', me.hadoop_user);
          me.grid.store.load();
          // load directory tree
          if (node != '/') {
            //me.treeStore.load({node: me.tree.getRootNode().findChild('id', me.lastSelectedDir, true)});
          }
          me.pathDisplay.setValue(me.lastSelectedDir);
        }
      }
    });

    me.treePanel = {
      region: 'west',
      split: true,
      minWidth: 200,
      xtype: 'panel',
      width: 250,
      bodyStyle: 'border-top: 0px;',
      layout: 'fit',
      items: [me.tree]
    };

    function render_filetype(value, meta, record) {
      var img = null;
      var cls = null;
      if (record.data.iconCls == 'folder') {
        cls = 'x-fa fa-folder-o';
        //img = '/static/js/extjs/resources/ext-theme-gray/images/tree/folder.gif';
      } else {
        cls = 'x-fa fa-file-o';
        //img = '/static/js/extjs/resources/ext-theme-gray/images/tree/leaf.gif';
      }
      //return '<span style="background-image: url('+img+'); background-position: 0px 0px; background-repeat: no-repeat;">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+value+'</span>';
      //return '<span class="x-fa fa-folder-o"> '+value+'</span>';
      return '<span class="' + cls + '"> ' + value + '</span>';
    }

    me.pathDisplay = new Ext.form.Display({ value: '', margin: '0 0 0 5' });
    var gridSelModel = null;
    if (me.type == 'agent') {
      me.uploadButton = new Ext.Button({
        text: 'Upload',
        handler: function() {
          new AgentFileUpload({
            path: me.lastSelectedDir,
            fileGrid: me.grid
          }).show();
        }
      });
      me.gridTbar = [me.pathDisplay, '->', me.uploadButton];
      gridSelModel = new Ext.selection.CheckboxModel({
        checkOnly: true
      });
    } else {
      me.gridTbar = [me.pathDisplay];
    }

    me.grid = new apps.view.common.BaseGrid({
      selModel: gridSelModel,
      multiSelect: true,
      region: 'center',
      minWidth: 400,
      enableTextSelection: false,
      url: '/' + me.type + '/listDirectory',
      tbar: me.gridTbar,
      columns: [
        {
          text: '이름',
          dataIndex: 'name',
          flex: 1,
          sortable: false,
          renderer: render_filetype
        },
        {
          text: '크기',
          dataIndex: 'size',
          width: 100,
          sortable: false,
          align: 'right'
        },
        { text: '수정일', dataIndex: 'mtime', width: 140, sortable: false }
      ]
    });
    var proxy = me.grid.store.getProxy();
    proxy.setExtraParam('directory', 0);
    proxy.setExtraParam('file', 1);

    me.items = [me.treePanel, me.grid];
    //if(me.type!='agent') {
    me.buttons = [
      { xtype: 'button', text: '선택', scope: me, handler: me.onSave },
      { xtype: 'button', text: '취소', scope: me, handler: me.onCancel }
    ];
    //}
    me.callParent(this);
  },

  onSave: function() {
    var me = this,
      record = me.grid.getSelectedRecord();

    if (record) {
      var directory = me.lastSelectedDir + '/' + record.get('name');
      me.fireEvent('save', me, false, directory);
    } else {
      me.fireEvent('save', me, true, me.lastSelectedDir);
    }
    me.onCancel();
  },

  onCancel: function() {
    this.close();
  }
});
