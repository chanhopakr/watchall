/**
 * Created by go on 16. 3. 23.
 */
Ext.define('apps.view.common.AlarmConfigWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'Ext.button.Button',
    'Ext.container.Container',
    'Ext.form.RadioGroup',
    'Ext.form.field.ComboBox',
    'Ext.layout.container.HBox',
    'Ext.layout.container.VBox'
  ],

  iconCls: 'x-fa fa-bell-o',
  title: '알람설정',
  width: 400,
  bodyStyle: 'padding: 5px;',
  layout: { type: 'vbox', align: 'stretch' },
  referenceHolder: true,
  defaultListenerScope: true,

  viewModel: {
    data: {
      eventType: '', // generator, scenario, query
      eventName: ''
    }
  },

  //initComponent: function() {
  //    var me = this;
  //    me.bMute = false;
  //    for (key in apps.G_ALARM_RULE) {
  //        rule = apps.G_ALARM_RULE[key];
  //        if (key == me.event_type+'-'+me.event_name) {
  //            if (rule[2]) {
  //                me.bMute = true;
  //                me.mode.setValue({ mute: 'true' });
  //                me.duration.setValue('0');
  //            }
  //        }
  //    }
  //    me.callParent(arguments);
  //},

  items: [
    {
      xtype: 'container',
      layout: 'hbox',
      items: [
        {
          xtype: 'combobox',
          reference: 'duration',
          width: 100,
          editable: false,
          store: {
            fields: ['value', 'display'],
            data: [
              ['5', '5분'],
              ['10', '10분'],
              ['20', '20분'],
              ['30', '30분'],
              ['60', '1시간'],
              ['120', '2시간'],
              ['180', '3시간'],
              ['360', '6시간'],
              ['540', '9시간'],
              ['720', '12시간']
            ]
          },
          value: '30'
        },
        { xtype: 'box', padding: '5px;', html: '동안 이 이벤트를' }
      ]
    },
    {
      xtype: 'radiogroup',
      reference: 'mode',
      columns: 2,
      items: [
        {
          boxLabel: '표시안함',
          name: 'mode',
          inputValue: 'ignore',
          checked: true
        },
        { boxLabel: '음소거', name: 'mode', inputValue: 'mute' }
      ]
    }
  ],

  buttons: [
    { xtype: 'button', text: '저장', handler: 'onSave' },
    { xtype: 'button', text: '취소', handler: 'onCancel' }
  ],

  insertAlarmRule: function(data) {
    var event_type = data.event_type,
      event_name = data.event_name,
      duration = data.duration,
      mode = data.mode,
      found = false,
      now = new Date().getTime() / 1000.0,
      key = event_type + '-' + event_name,
      rules = apps.G_ALARM_RULE,
      k,
      rule,
      stime,
      etime;

    for (k in rules) {
      rule = rules[k];
      if (rule[1] < now) {
        delete rules[k];
        continue;
      }
      if (k == key) {
        found = true;
      }
    }
    if (!found) {
      stime = new Date().getTime() / 1000.0;
      etime = stime + duration * 60;
      rules[key] = {
        stime: stime,
        etime: etime,
        mode: mode,
        duration: duration
      };
    }
  },

  onSave: function() {
    var me = this,
      vm = me.getViewModel(),
      eventType = vm.get('eventType'),
      eventName = vm.get('eventName'),
      duration = parseInt(me.lookupReference('duration').getValue()),
      mode = me.lookupReference('mode').getValue().mode,
      params = {
        event_type: eventType,
        event_name: eventName,
        duration: duration,
        mode: mode
      };

    apps.ajax('/alarm_config/update', params, function() {
      me.insertAlarmRule(params);
      me.onCancel();
    });
  },

  onCancel: function() {
    this.close();
  }
});
