Ext.define('apps.view.common.IPSetWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'Ext.button.Button',
    'Ext.container.Container',
    'Ext.form.Panel',
    'Ext.form.RadioGroup',
    'Ext.form.field.Text',
    'Ext.form.field.TextArea',
    'Ext.layout.container.Fit',
    'Ext.layout.container.HBox',
    'Ext.layout.container.VBox'
  ],

  alias: 'widget.ipset-window',

  bind: {
    title: '{title}'
  },

  layout: 'fit',
  width: 500,
  height: 350,
  bodyPadding: 10,

  items: {
    xtype: 'form',
    reference: 'form1',
    layout: { type: 'vbox', align: 'stretch' },
    border: false,
    fieldDefaults: {
      msgTarget: 'side',
      labelWidth: 100,
      labelStyle: 'font-weight: bold'
    },
    items: [
      {
        xtype: 'radiogroup',
        fieldLabel: '대상',
        bind: { value: '{mode}' },
        defaults: { name: 'mode' },
        items: [
          { inputValue: 'src', boxLabel: 'Source IP', checked: true },
          { inputValue: 'dst', boxLabel: 'Destination IP' }
        ]
      },
      {
        xtype: 'container',
        layout: { type: 'hbox', align: 'stretch' },
        padding: '0 0 5 0',
        items: [
          {
            xtype: 'textfield',
            fieldLabel: '도메인',
            name: 'domain',
            bind: '{theRecord.domain}',
            flex: 1,
            emptyText: 'www.domain.com'
          },
          {
            xtype: 'button',
            text: 'IP검색',
            handler: 'onLookupClick',
            width: 80,
            margin: '0 0 0 5'
          }
        ]
      },
      {
        xtype: 'textarea',
        fieldLabel: 'IP',
        name: 'ip',
        bind: '{theRecord.ip}',
        height: 80,
        emptyText: '10.10.10.1\r\n10.10.10.0/24'
      },
      {
        xtype: 'textarea',
        fieldLabel: '비고',
        labelAlign: 'top',
        name: 'desc',
        flex: 1,
        bind: '{theRecord.desc}'
      }
    ]
  },

  buttons: [
    { text: '확인', handler: 'onSaveIPSetClick' },
    { text: '취소', handler: 'onCancelIPSetClick' }
  ]
});
