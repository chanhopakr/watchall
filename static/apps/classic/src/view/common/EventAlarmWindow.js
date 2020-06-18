Ext.define('apps.view.common.EventAlarmWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'Ext.button.Button',
    'Ext.data.TreeModel',
    'Ext.data.TreeStore',
    'Ext.data.proxy.Ajax',
    'Ext.form.field.TextArea',
    'Ext.grid.column.Check',
    'Ext.layout.container.VBox',
    'Ext.tree.Column',
    'Ext.tree.Panel'
  ],

  title: '이벤트 알림',
  height: 500,
  width: 600,
  layout: { type: 'vbox', align: 'stretch' },
  bodyPadding: 10,
  showEmail: true,
  showSms: true,
  referenceHolder: true,
  defaultListenerScope: true,

  viewModel: {
    data: {
      formData: {}
    },
    stores: {
      treeStore: {
        type: 'tree',
        model: 'Ext.data.TreeModel',
        fields: ['id', 'text', 'type', 'value', 'email', 'sms'],
        proxy: {
          type: 'ajax',
          url: '/event_notice/tree' /*, extraParams: {notice: '{formId}'}*/
        },
        listeners: {
          beforeload: 'onBeforeTreeLoad',
          load: 'onTreeLoad'
        }

        //type: 'tree',
        //model: 'Ext.data.TreeModel',
        //proxy: { type: 'ajax', url: '/event_notice/tree' },
        //root: { text: '전체', id: 'group-0', type: 'group', rid: '0', expanded: true },
        //folderSort: true,
        //autoLoad: true
      }
    }
  },

  //initComponent: function() {
  //    if (me._data) {
  //        var to = me._data.notice_to;
  //        if (to && to.others) {
  //            me.email.setValue(to.others.email);
  //            me.sms.setValue(to.others.sms);
  //        }
  //    }
  //    me.callParent(arguments);
  //},

  items: [
    {
      xtype: 'treepanel',
      reference: 'tree',
      flex: 1,
      margin: '0 0 5 0',
      //store: me.store,
      //store: new Ext.data.TreeStore({
      //store: {
      //    fields: ['id', 'text', 'type', 'value', 'email', 'sms'],
      //    proxy: { type: 'ajax', url: '/event_notice/tree' /*, extraParams: { notice: me._data ? me._data.notice_id : null }*/ },
      //    listeners: {
      //        //beforeload: { fn: 'onBeforeTreeLoad', scope: 'this' },
      //        load: 'onTreeLoad'
      //    }
      //},
      bind: { store: '{treeStore}' },
      rootVisible: false,
      viewConfig: { markDirty: false },
      columns: [
        {
          xtype: 'treecolumn',
          text: '그룹',
          width: 300,
          sortable: false,
          dataIndex: 'text'
        },
        //if (me.showEmail)
        {
          xtype: 'checkcolumn',
          text: '이메일',
          align: 'center',
          width: 60,
          sortable: false,
          dataIndex: 'email',
          listeners: { checkchange: 'onCheckChange' }
        },
        //if (me.showSms)
        {
          xtype: 'checkcolumn',
          text: 'SMS',
          align: 'center',
          width: 60,
          sortable: false,
          dataIndex: 'sms',
          listeners: { checkchange: 'onCheckChange' }
        }
      ]
    },
    // hidden: !me.showEmail
    {
      xtype: 'textarea',
      reference: 'email',
      fieldLabel: '이메일',
      emptyText:
        '미등록 사용자의 이메일주소를 입력할 수 있습니다. 세미콜론(;)을 사용하여 구분.',
      bind: '{formData.others.email}'
    },
    // hidden: !me.showSms
    {
      xtype: 'textarea',
      reference: 'sms',
      fieldLabel: 'SMS',
      emptyText:
        '미등록 사용자의 휴대폰번호를 입력할 수 있습니다. 세미콜론(;)을 사용하여 구분.',
      bind: '{formData.others.sms}'
    }
  ],

  buttons: [
    { xtype: 'button', text: '저장', handler: 'onSave' },
    { xtype: 'button', text: '취소', handler: 'onCancel' }
  ],

  onBeforeTreeLoad: function(store) {
    var me = this,
      vm = me.getViewModel(),
      proxy = store.getProxy();
    proxy.setExtraParam('notice', vm.get('formId'));
  },

  onTreeLoad: function(store, records, successful, operation, node) {
    // 부모 노드가 체크돼 있으면, 데이터베이스에 저장된 데이터와 관계없이 자식 노드는 모두 체크 된 상태로 표시한다.
    // 자식 노드의 상태를 알고 싶으면, 자식 노드를 펼친 뒤에 체크해야 함.
    var email = node.get('email'),
      sms = node.get('sms'),
      i,
      l,
      record;

    for (i = 0, l = records.length; i < l; i++) {
      record = records[i];
      if (email) {
        record.set('email', true);
      }
      if (sms) {
        record.set('sms', true);
      }
    }
  },

  onCheckChange: function(checkcolumn, rowIndex, checked) {
    var me = this,
      tree = me.lookupReference('tree'),
      key = checkcolumn.dataIndex, // email/sms
      records = tree
        .getView()
        .getStore()
        .getRange(),
      record = records[rowIndex], // root node
      type = record.data.type;

    function setAll(root, key, checked) {
      root.set(key, checked);
      //if (key == 'sms') root.set('email', checked);
      root.eachChild(function(n) {
        if (n.hasChildNodes()) {
          setAll(n, key, checked);
        } else {
          n.set(key, checked);
          //if (key == 'sms') n.set('email', checked);
        }
      });
    }

    if (type == 'group') {
      setAll(record, key, checked);
    }
    var node = record.parentNode;
    if (checked) {
      while (true) {
        if (!node) break;
        var children = node.childNodes;
        var all_checked = true;
        for (var i = 0, l = children.length; i < l; i++) {
          if (!children[i].get(key)) {
            all_checked = false;
          }
        }
        if (all_checked) {
          node.set(key, checked);
          //if (key == 'sms') node.set('email', checked);
          node = node.parentNode;
        } else {
          break;
        }
      }
    } else {
      while (true) {
        if (!node) break;
        node.set(key, checked);
        //if (key == 'sms') node.set('email', checked);
        node = node.parentNode;
      }
    }
  },

  onSave: function() {
    var me = this,
      root = me
        .lookupReference('tree')
        .getStore()
        .getRootNode(),
      email = me.lookupReference('email').getValue(),
      sms = me.lookupReference('sms').getValue(),
      result = [],
      others = {},
      r;

    function getAll(root, result) {
      root.eachChild(function(n) {
        if (n.hasChildNodes()) {
          if (n.get('email') || n.get('sms')) {
            r = { type: n.get('type'), value: n.get('value') };
            if (me.showEmail) r['email'] = n.get('email') ? true : false;
            if (me.showSms) r['sms'] = n.get('sms') ? true : false;
            result.push(r);
          }
          getAll(n, result);
        } else {
          if (n.get('email') || n.get('sms')) {
            r = { type: n.get('type'), value: n.get('value') };
            if (me.showEmail) r['email'] = n.get('email') ? true : false;
            if (me.showSms) r['sms'] = n.get('sms') ? true : false;
            result.push(r);
          }
        }
      });
    }
    getAll(root, result);

    if (me.showEmail) others['email'] = email;
    if (me.showSms) others['sms'] = sms;

    me.fireEvent('save', me, { tree: result, others: others });
    me.close();
  },

  onCancel: function() {
    this.close();
  }
});
