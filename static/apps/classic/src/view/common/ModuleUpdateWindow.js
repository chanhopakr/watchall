Ext.define('apps.view.common.ModuleUpdateWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'Ext.button.Button',
    'Ext.layout.container.Fit',
    'Ext.selection.CheckboxModel',
    'apps.view.common.BaseGrid'
  ],

  height: 400,
  width: 700,
  border: false,
  title: '모듈 업데이트',
  layout: 'fit',
  initComponent: function() {
    var me = this;

    function render_module_name(value, meta, record) {
      if (record.data.need_reboot) {
        return '<b><span style="color: red; ">' + value + '</span></b>';
      } else {
        return value;
      }
    }

    me.grid = new apps.view.common.BaseGrid({
      url: '/agent/compare_module',
      paging: false,
      selModel: new Ext.selection.CheckboxModel({ checkOnly: true }),
      extFields: ['checked'],
      columns: [
        {
          text: '모듈명',
          dataIndex: 'module',
          flex: 1,
          sortable: false,
          renderer: render_module_name
        },
        //{ text: '최신버전 수정일시',  dataIndex: 'last_mtime',    width: 130, sortable: false, align: 'center' },
        {
          text: '최신버전 파일크기',
          dataIndex: 'last_size',
          width: 150,
          sortable: false,
          align: 'right'
        },
        //{ text: '에이전트 수정일시', dataIndex: 'agent_mtime',   width: 130, sortable: false },
        {
          text: '에이전트 파일크기',
          dataIndex: 'agent_size',
          width: 150,
          sortable: false,
          align: 'right'
        },
        {
          text: '체크섬',
          dataIndex: '',
          width: 100,
          sortable: false,
          renderer: me.renderChecksum
        }
      ]
    });

    me.items = [me.grid];
    me.buttons = [
      { xtype: 'button', text: '새로고침', scope: me, handler: me.loadStore },
      {
        xtype: 'button',
        text: '선택 업데이트',
        scope: me,
        handler: me.onUpdate
      },
      { xtype: 'button', text: '취소', scope: me, handler: me.onClose }
    ];

    me.callParent(arguments);
    me.loadStore();
  },
  renderChecksum: function(value, meta, record) {
    if (record.get('last_checksum') == record.get('agent_checksum')) {
      return 'O';
    } else {
      return 'X';
    }
  },
  loadStore: function() {
    var me = this;
    me.grid.store.load({
      params: { agent: me.xconfig.agent },
      callback: function(records) {
        var diff_list = [];
        var reboot_enable = false;

        for (var i = 0, l = records.length; i < l; i++) {
          var record = records[i];
          if (record.get('last_size') != record.get('agent_size')) {
            diff_list.push(record);
          }

          if (record.data.need_reboot) {
            reboot_enable = true;
          }
        }

        if (reboot_enable) {
          me.setTitle(
            Ext.String.format(
              '{0}<span style="color: red; ">&nbsp;&nbsp;&nbsp;&nbsp;<b>*재실행</b>이 필요한 모듈이 존재합니다.</span>',
              me.title
            )
          );
        }

        if (diff_list.length > 0) {
          me.grid.getSelectionModel().select(diff_list);
          me.grid.scrollByDeltaY(-100000); // private function
        }
        me.fireEvent('moduleload', me, records);
      }
    });
  },
  update: function() {
    var me = this;
    var diff_list = [];
    var records = me.grid.store.getRange();
    for (var i = 0, l = records.length; i < l; i++) {
      var record = records[i];
      if (record.get('last_size') != record.get('agent_size')) {
        diff_list.push(record.get('module'));
      }
    }
    me._update(diff_list, diff_list.length);
  },
  onUpdate: function() {
    var me = this;
    var records = me.grid.getSelectionModel().getSelection();
    var total = records.length;
    var modules = [];
    for (var l = records.length - 1; l >= 0; l--) {
      modules.push(records[l].get('module'));
    }
    me._update(modules, total);
  },
  _update: function(modules, total) {
    if (total > 0) {
      var me = this;
      Ext.Msg.confirm(
        '확인',
        Ext.String.format(
          '선택된 {0}개의 모듈을 업데이트 하시겠습니까?',
          total
        ),
        function(btn) {
          if (btn == 'no') return;

          var module = modules.pop();
          Ext.Msg.show({
            title: '업데이트',
            msg: module,
            progressText: '초기화...',
            width: 500,
            progress: true,
            closable: false
          });
          var params = { agent: me.xconfig.agent, module: module };
          function callback() {
            if (modules.length <= 0) {
              if (me.mode == 'nowin') {
                Ext.Msg.close();
                me.fireEvent('reloadOK');
              } else {
                Ext.Msg.confirm(
                  '확인',
                  '업데이트가 완료됐습니다. 에이전트를 리로드 하시겠습니까?',
                  function(btn) {
                    if (btn == 'no') return;
                    apps.ajax(
                      '/agent/reload',
                      { agent: me.xconfig.agent },
                      function() {
                        me.grid.setLoading(true);
                        Ext.defer(
                          function() {
                            me.grid.setLoading(false);
                            me.loadStore();
                          },
                          10000,
                          me
                        );
                      }
                    );
                  }
                );
              }
              return;
            }
            module = modules.pop();
            var pos = total - modules.length - 1;
            Ext.Msg.updateProgress(
              pos / total,
              Ext.String.format('{0} / {1}', pos, total),
              module
            );
            params['module'] = module;
            apps.ajax('/agent/update_module', params, callback);
          }
          apps.ajax('/agent/update_module', params, callback);
        }
      );
    }
  },
  onClose: function() {
    this.close();
  }
});
