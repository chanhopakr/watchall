Ext.define('apps.view.common.GroupListWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'Ext.button.Button',
    'Ext.data.TreeStore',
    'Ext.data.proxy.Ajax',
    'Ext.form.field.Text',
    'Ext.layout.container.VBox',
    'Ext.tree.Column',
    'Ext.tree.Panel',
    'apps.ux.plugin.EnterKeyHandler'
  ],

  title: '그룹선택',
  iconCls: 'x-fa fa-group',
  width: 600,
  layout: { type: 'vbox', align: 'stretch' },
  referenceHolder: true,
  defaultListenerScope: true,

  items: [
    {
      xtype: 'treepanel',
      reference: 'tree',
      height: 400,
      rootVisible: false,
      multiSelect: false,
      singleExpand: false,
      tbar: [
        {
          xtype: 'textfield',
          labelWidth: 60,
          plugins: { ptype: 'enterkeyhandler', handler: 'onSearch' },
          fieldLabel: '이름',
          reference: 'name'
        },
        {
          xtype: 'textfield',
          labelWidth: 60,
          plugins: { ptype: 'enterkeyhandler', handler: 'onSearch' },
          fieldLabel: '설명',
          reference: 'desc'
        },
        { xtype: 'button', text: '검색', handler: 'onSearch' }
      ],
      store: {
        type: 'tree',
        proxy: { type: 'ajax', url: '/group/group_list' },
        root: {
          text: 'ALL',
          id: 'group-0',
          type: 'group',
          rid: '0',
          expanded: true
        },
        folderSort: true,
        fields: ['text', 'type', 'desc', 'rid']
      },
      columns: [
        {
          xtype: 'treecolumn',
          text: '이름',
          width: 300,
          sortable: false,
          dataIndex: 'text'
        },
        { text: '비고', flex: 1, sortable: false, dataIndex: 'desc' }
      ]
    }
  ],

  buttons: [
    {
      xtype: 'button',
      text: '선택',
      handler: 'onSave',
      bind: { disabled: '{!tree.selection}' }
    },
    { xtype: 'button', text: '취소', handler: 'onCancel' }
  ],

  onSearch: function() {
    var me = this,
      name = me.lookupReference('name').getValue(),
      desc = me.lookupReference('desc').getValue(),
      store = me.lookupReference('tree').getStore();

    store.getProxy().setExtraParams({
      name: name,
      desc: desc
    });
    store.loadPage(1);
  },

  onSave: function() {
    var me = this,
      record = me.lookupReference('tree').getSelection()[0];

    me.fireEvent('save', record.get('rid'), record.get('text'));
    me.close();
  },

  onCancel: function() {
    this.close();
  }
});
