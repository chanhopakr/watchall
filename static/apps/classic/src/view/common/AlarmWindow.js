/**
 * Created by jjol on 16. 5. 17.
 */

Ext.define('apps.view.common.AlarmWindow', {
  extend: 'Ext.window.Window',
  requires: ['Ext.layout.container.VBox'],

  uses: [
    'Ext.button.Button',
    'Ext.container.Container',
    'Ext.form.field.Display',
    'Ext.layout.container.HBox',
    'Ext.panel.Panel'
  ],

  referenceHolder: true,
  defaultListenerScope: true,

  ui: 'alarmWin',
  style: 'background: rgba(0, 0, 0, 0.5);',
  width: 300,
  modal: false,
  header: false,
  padding: '0 2 0 2 ',
  scrollable: true,
  layout: { type: 'vbox', align: 'stretch' },
  items: [],

  addEventItem: function(data) {
    var me = this,
      title = Ext.String.format(
        '{0} - {1}',
        data.event_name,
        Ext.Date.format(data.date, 'H:i:s')
      ),
      type = data.type,
      query = data.query,
      hostip = data.hostip,
      SEVERITY_MAP = {
        critical: '심각',
        major: '경계',
        minor: '주의',
        warning: '관심'
      },
      content;

    content =
      '소스: ' +
      data.source +
      '<br>등급: ' +
      SEVERITY_MAP[data.severity] +
      '<br>탐지수: ' +
      data.logcount;

    var tempItem = new Ext.panel.Panel({
      flex: 1,
      maxHeight: 80,
      minHeight: 80,
      margin: '2 0 0 0',
      bodyStyle: 'background: rgba(0, 0, 0, 0.5);',
      layout: { type: 'hbox', align: 'stretch' },
      items: [
        {
          xtype: 'displayfield',
          flex: 1,
          padding: '0 0 0 5',
          fieldStyle: 'margin-top: 3px;',
          labelStyle: 'margin-top: 3px;',
          value: Ext.String.format(
            '<span style="color: white; font-size: 15px;">{0}</span><br>' +
              '<span style="color: white;">{1}</span>',
            title,
            content
          )
        },
        {
          xtype: 'container',
          layout: { type: 'vbox' },
          items: [
            {
              xtype: 'button',
              style: 'background: rgb(83, 121, 175)',
              border: false,
              flex: 1,
              margin: '2 3 1 0',
              text: '<span style="color: white ">이동</span>',
              handler: function() {
                if (type == 'system') {
                  location.href = '/node_table';
                } else if (type == 'agent') {
                  search_agent(hostip);
                } else if (type == 'file') {
                  search_agent(hostip);
                } else {
                  apps.redirectTo('search', 0, function(tabPanel) {
                    var query = data.source,
                      tokens,
                      host,
                      tag;

                    if (type == 'generator') {
                      tokens = query.split(/-/);
                      host = tokens[0];
                      tag = tokens.slice(1).join('-');
                      query = Ext.String.format(
                        '_host="{0}" | _tag="{1}"',
                        host,
                        tag
                      );
                    }

                    tabPanel.lookupReference('query').setValue(query);
                    tabPanel.getController().onSearch();
                  });
                }

                // me.main.delEventItem();
                // tempItem.close();
              }
            },
            {
              xtype: 'button',
              style: 'background: rgb(187, 75, 57)',
              border: false,
              flex: 1,
              margin: '1 3 2 0',
              text: '<span style="color: white ">닫기</span>',
              handler: function() {
                me.main.delEventItem();
                tempItem.close();
              }
            }
          ]
        }
      ]
    });
    me.add(tempItem);
    apps.setAnimate(tempItem, 'fadeInRight');
  }
});
