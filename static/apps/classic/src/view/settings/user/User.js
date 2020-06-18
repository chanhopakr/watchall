Ext.define('apps.view.settings.user.User', {
  extend: 'Ext.Container',

  requires: [
    'Ext.button.Button',
    'Ext.container.Container',
    'Ext.form.Panel',
    'Ext.form.field.ComboBox',
    'Ext.form.field.Date',
    'Ext.form.field.Text',
    'Ext.grid.Panel',
    'Ext.grid.column.Check',
    'Ext.grid.column.Date',
    'Ext.layout.container.HBox',
    'Ext.layout.container.VBox',
    'Ext.toolbar.Fill',
    // apps
    // 'apps.ux.plugin.ClearButton',
    'apps.ux.plugin.ClearButton',
    'apps.ux.toolbar.Paging',
    'apps.view.common.SearchButton',
    'apps.view.settings.user.UserModel',
    'apps.view.settings.user.UserController'
  ],

  xtype: 'user',

  viewModel: {
    type: 'user'
  },

  controller: 'user',

  layout: {
    type: 'vbox',
    align: 'stretch'
  },

  defaults: {
    border: true,
    margin: '10 0 0 0'
  },

  items: [
    {
      reference: 'searchForm',
      itemId: 'search',
      xtype: 'form',
      bodyPadding: '0 10 10 10',
      layout: {
        type: 'vbox',
        align: 'stretch'
      },
      defaults: {
        xtype: 'container',
        margin: '10 0 0 0',
        layout: {
          type: 'hbox'
        },
        defaults: {
          margin: '0 10 0 0',
          xtype: 'textfield',
          // plugins: ['clearbutton'],
          enableKeyEvents: true,
          listeners: {
            keydown: 'onKeydown'
          }
        }
      },
      items: [
        {
          items: [
            {
              fieldLabel: '사용자 ID',
              name: 'username'
            },
            {
              fieldLabel: '사용자 명',
              name: 'full_name'
            },
            { xtype: 'tbfill' },
            {
              reference: 'searcher',
              xtype: 'searchbutton',
              handler: 'onSearch',
              margin: 0
            }
          ]
        },
        {
          items: [
            {
              fieldLabel: '권한',
              xtype: 'combobox',
              name: 'authority',
              value: '',
              bind: {
                store: '{authorities}'
              }
            },
            {
              fieldLabel: '활성화',
              name: 'is_active',
              xtype: 'combobox',
              value: '',
              bind: {
                store: '{actives}'
              }
            }
          ]
        }
      ]
    },
    {
      reference: 'usersGrid',
      itemId: 'grid',
      xtype: 'grid',
      flex: 1,
      tools: [
        {
          tooltip: 'Excel 다운로드',
          itemId: 'xls',
          iconCls: 'x-fa fa-download',
          cls: 'bg_download',
          xtype: 'button',
          scale: 'medium',
          ui: 'circle',
          hrefPOST: '/user/downloads',
          handler: 'onExcelDown'
        },
        {
          tooltip: '등록',
          itemId: 'create',
          iconCls: 'x-fa fa-plus',
          cls: 'bg_create',
          xtype: 'button',
          scale: 'medium',
          ui: 'circle',
          handler: 'onCreate'
        },
        {
          tooltip: '수정',
          itemId: 'update',
          iconCls: 'x-fa fa-check',
          cls: 'bg_update',
          xtype: 'button',
          scale: 'medium',
          ui: 'circle',
          bind: {
            disabled: '{!usersGrid.selection}'
          },
          handler: 'onUpdate'
        },
        {
          tooltip: '삭제',
          itemId: 'delete',
          iconCls: 'x-fa fa-minus',
          cls: 'bg_delete',
          xtype: 'button',
          scale: 'medium',
          ui: 'circle',
          bind: {
            disabled: '{!usersGrid.selection}'
          },
          handler: 'onDelete'
        }
      ],
      columns: {
        defaults: {
          width: 150
        },
        items: [
          {
            text: '사용자 ID',
            dataIndex: 'username'
          },
          {
            text: '사용자 명',
            dataIndex: 'full_name'
          },
          {
            text: '부서',
            dataIndex: 'department'
          },
          {
            text: '연락처',
            dataIndex: 'phone'
          },
          {
            text: '이메일',
            dataIndex: 'email'
          },
          {
            text: '권한',
            dataIndex: 'authority',
            width: 100,
            renderer: 'onRendererAuthority'
          },
          {
            text: '고객 명',
            dataIndex: 'customer_name'
          },
          {
            text: 'MO',
            dataIndex: 'mo_name'
          },
          {
            text: '활성화',
            dataIndex: 'is_active',
            xtype: 'checkcolumn',
            width: 80,
            disabled: true,
            disabledCls: ''
          },
          {
            text: '고객 웹 표시 국가',
            dataIndex: 'countries_name',
            flex: 1,
            minWidth: 200
          },
          {
            text: '마지막 로그인 일시',
            dataIndex: 'last_login',
            xtype: 'datecolumn',
            format: 'Y-m-d H:i',
            width: 140,
            align: 'center'
          }
        ]
      },
      bind: {
        store: '{users}'
      },
      bbar: { xtype: 'uxpagingtoolbar', bind: { store: '{users}' } },
      listeners: {
        itemdblclick: 'onItemdblclickGrid'
      }
    }
  ]
});
