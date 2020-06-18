Ext.define('apps.view.main.Main', {
  extend: 'Ext.container.Viewport',

  requires: [
    'Ext.layout.container.Absolute',
    'Ext.layout.container.Card',
    'Ext.layout.container.HBox',
    'Ext.layout.container.VBox',
    'Ext.container.Container',
    'Ext.form.field.Display',
    'Ext.toolbar.Toolbar',
    'Ext.util.Cookies',
    'apps.ux.list.Tree',
    'Ext.toolbar.Fill',
    'apps.view.main.MainContainerWrap',
    'apps.view.main.MainController',
    'apps.view.main.MainModel'
  ],

  xtype: 'main',
  controller: 'main',
  viewModel: 'main',

  cls: 'sencha-dash-viewport',
  itemId: 'mainView',

  layout: {
    type: 'absolute',
    align: 'stretch'
  },

  items: [
    {
      xtype: 'toolbar',
      reference: 'headerBar', // referred by dashboard
      style:
        'background-color: transparent; z-index: 10000; top: 5px; right: 10px;',
      width: 230,
      margin: false,
      padding: false,
      layout: {
        type: 'hbox',
        align: 'middle',
        pack: 'end'
      },
      items: [
        // {
        //     iconCls: 'x-fa fa-bell',
        //     ui: 'circle',
        //     cls: 'bg_alarm',
        //     scale: 'medium',
        //     hrefTarget: '_blank',
        //     tooltip: '이벤트',
        //     handler: null
        // },
        // '->',
        {
          iconCls: 'x-fa fa-user',
          ui: 'circle',
          cls: 'bg_info',
          scale: 'medium',
          hrefTarget: '_blank',
          tooltip: '사용자',
          // handler: 'onShowUserWindow'
          handler: null
        },
        {
          xtype: 'displayfield',
          maxWidth: 100,
          fieldStyle:
            'color: #333; text-align: center; margin-top: 15px;' +
            'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;',
          bind: {
            value:
              '<span title="{session.username} ({session.full_name})">{session.username} ({session.full_name})</span>'
          }
        },
        {
          iconCls: 'x-fa fa-sign-out',
          style: 'background-color: #939598; border: 0;',
          href: '/logout',
          hrefTarget: '_self',
          tooltip: '로그아웃'
        }
        // {
        //     xtype:'displayfield',
        //     bind: {
        //         value: '<span style="top: 5px; position: relative">{logout_string}</span>',
        //         hidden: false
        //     }
        // }
      ]
    },
    {
      xtype: 'maincontainerwrap',
      bodyCls: 'box-shadow-left',
      margin: '0 5 0 0',
      id: 'main-view-detail-wrap',
      reference: 'mainContainerWrap',
      anchor: '100% 100%',
      x: 0,
      y: 0,
      defaults: {
        xtype: 'container'
      },
      items: [
        {
          reference: 'navigationContainer',
          cls: Ext.util.Cookies.get('navigation_micro') || 'expanded',
          width: Ext.util.Cookies.get('navigation_micro') ? 50 : 250,
          layout: {
            type: 'vbox',
            align: 'stretch'
          },
          items: [
            {
              xtype: 'component',
              reference: 'senchaLogo',
              cls: 'box-shadow-left',
              height: 50,
              tpl: [
                '<a href="#{hash}" class="navbar-brand" style="text-align: left;">',
                // '<span class="navbar-logo icon-zenlog_logo"></span>',
                '<img src="/static/apps/resources/images/KT%20CI.png" style="width: 40px; height: 30px; margin-top: 9px; margin-right: -5px; margin-left: 10px;">',
                '<span class="text-zenlog_logo" style="font-size: 30px; margin-left: 10px; color: #f82a2a; font-weight: bold;"><b>{title}</b> {version}</span>',
                '</a>'
              ],
              data: {
                hash: `${window.MAIN_HASH}`,
                title: `${window.document.title}`,
                version: ''
              }
            },
            {
              xtype: 'zen-treelist',
              cls: 'box-shadow-left',
              flex: 1,
              reference: 'navigationTreeList', // referred by dashboard
              itemId: 'navigationTreeList',
              store: 'NavigationTree',
              expandedWidth: 250,
              micro: Ext.util.Cookies.get('navigation_micro'),
              expanderFirst: false,
              expanderOnly: false,
              singleExpand: true,
              stateId: 'treelist',
              listeners: {
                selectionchange: 'onNavigationTreeSelectionChange',
                expanderClick: 'onToggleNavigationSize'
              }
            }
          ]
        },
        {
          flex: 1,
          reference: 'mainCardPanel',
          cls: 'sencha-dash-right-main-container',
          padding: '1 5 5 10',
          margin: '0 0 5 0',
          itemId: 'contentPanel',
          layout: { type: 'card', anchor: '100%' },
          defaults: { minTabWidth: 97 }
        }
      ]
    }
  ],

  listeners: {
    render: 'onMainViewRender'
  }
});
