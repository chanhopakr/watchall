/**
 * Created by go on 15. 12. 15.
 */
Ext.define('apps.view.common.ThresholdWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'Ext.button.Button',
    'Ext.container.Container',
    'Ext.form.FieldSet',
    'Ext.form.field.Checkbox',
    'Ext.form.field.ComboBox',
    'Ext.form.field.Number',
    'Ext.layout.container.VBox',
    'Ext.slider.Single'
  ],

  height: 500,
  width: 600,
  title: '임계치 설정',
  layout: { type: 'vbox', align: 'stretch' },
  fields: null,
  threshold: null,
  bodyPadding: 10,
  referenceHolder: true,
  defaultListenerScope: true,
  items: [
    {
      xtype: 'container',
      reference: 'cont',
      overflowX: 'hidden',
      overflowY: 'auto',
      flex: 1
    },
    {
      xtype: 'fieldset',
      title: '알람 설정',
      layout: 'vbox',
      items: [
        {
          xtype: 'checkbox',
          reference: 'alarm_enable',
          boxLabel: '사용',
          fieldLabel: '알람',
          checked: true
        },
        {
          xtype: 'numberfield',
          reference: 'alarm_loops',
          fieldLabel: '반복',
          minValue: 1,
          maxValue: 10,
          value: 3
        },
        {
          xtype: 'slider',
          reference: 'alarm_volume',
          width: 400,
          fieldLabel: '볼륨',
          minValue: 0,
          maxValue: 100,
          value: 100
        },
        {
          xtype: 'combobox',
          reference: 'alarm_file',
          fieldLabel: '사운드',
          //url: '/combo/alarmsound',
          editable: false,
          triggerAction: 'all',
          value: 'apps1.mp3' // default
        }
      ]
    }
  ],
  buttons: [
    { xtype: 'button', text: '확인', handler: 'onSave' },
    { xtype: 'button', text: '취소', handler: 'onCancel' }
  ],

  //initComponent: function() {
  //    var me = this;
  //
  //    me.comp_list = [];
  //
  //    me.items = [
  //    ];
  //    if (me.threshold) {
  //        me.alarm_enable.setValue(me.threshold.alarm.enable);
  //        me.alarm_loops.setValue(me.threshold.alarm.loops);
  //        me.alarm_volume.setValue(me.threshold.alarm.volume);
  //        me.alarm_file.setValue(me.threshold.alarm.file);
  //    }
  //    for (var i = 0, l = me.fields.length; i < l; i++) {
  //        var a = new Ext.form.field.Number({ labelWidth: 200, fieldLabel: me.fields[i] });
  //        var b = new Ext.form.field.Number({ labelWidth: 200, boxLabel: lang.search.below, padding: '0 0 0 5' });
  //        if (me.threshold && me.threshold.data && me.threshold.data[me.fields[i]]) {
  //            a.setValue(me.threshold.data[me.fields[i]][0]);
  //            b.setValue(me.threshold.data[me.fields[i]][1]);
  //        }
  //        me.comp_list.push([a, b]);
  //        me.cont.add({ xtype: 'container', layout: { type: 'hbox', align: 'stretch' }, padding: '0 0 5 0', items: [
  //            a, { xtype: 'label', margin: '4 0 0 5', text: lang.search.above },
  //            b, { xtype: 'label', margin: '4 0 0 5', text: lang.search.below }
  //        ] });
  //    }
  //    me.callParent(arguments);
  //    //me.addEvents('save');
  //},

  onSave: function() {
    var me = this,
      threshold = {},
      alarm = {
        enable: me.alarm_enable.getValue(),
        loops: me.alarm_loops.getValue(),
        volume: me.alarm_volume.getValue(),
        file: me.alarm_file.getValue()
      };

    var found = false;
    for (var i = 0, l = me.comp_list.length; i < l; i++) {
      var a = me.comp_list[i][0];
      var b = me.comp_list[i][1];
      var av = a.getValue();
      var bv = b.getValue();
      if (found == false && (av != null || bv != null)) {
        found = true;
      }
      threshold[a.getFieldLabel()] = [av, bv];
    }

    me.fireEvent('save', me, { data: found ? threshold : null, alarm: alarm });
    me.onCancel();
  },

  onCancel: function() {
    this.close();
  }
});
