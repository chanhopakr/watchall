Ext.define('apps.view.common.ChangeDayDate', {
  extend: 'Ext.container.Container',
  alias: 'widget.changedaydate',

  requires: [
    'Ext.button.Button',
    'Ext.form.Label',
    'Ext.form.field.Date',
    'Ext.layout.container.HBox'
  ],

  layout: { type: 'hbox', align: 'stretch' },
  bSearching: false, // 중복 클릭 안되게
  initComponent: function() {
    var me = this;
    me.leftButton = new Ext.Button({
      iconCls: 'resultset_previous',
      maxHeight: 23,
      handler: function() {
        me.onLeftClick();
      }
    });
    me.rightButton = new Ext.Button({
      maxHeight: 23,
      iconCls: 'resultset_next',
      handler: function() {
        me.onRightClick();
      }
    });
    me.date = new Ext.form.field.Date({
      anchor: '96%',
      name: 'sdatetime',
      editable: false,
      maxValue: new Date(),
      format: 'Y-m-d',
      value: new Date(),
      listeners: {
        change: function() {
          me.onLoad();
        }
      }
    });

    me.items = [
      { xtype: 'label', baseCls: 'calendar', text: '기간', margin: '3 30 0 0' },
      me.leftButton,
      me.date,
      me.rightButton
    ];
    me.callParent(arguments);
  },
  setValue: function(newDate) {
    this.date.setValue(newDate);
  },
  getRawValue: function() {
    return this.date.getRawValue();
  },
  setSearching: function() {
    // store있을 때에는 load시에 불러주어야 함.
    this.bSearching = false;
  },
  onLoad: function() {
    var me = this;
    if (me.store) {
      me.store.loadPage(1);
      me.bSearching = true;
    }
    if (me.chartLoad) {
      me.chartLoad();
    }
  },
  onRightClick: function() {
    var me = this;
    if (me.bSearching != true) {
      var today = me.date.getValue();
      var compareDate = Ext.Date.format(new Date(), 'Y-m-d');
      today = Ext.Date.add(today, Ext.Date.DAY, +1);
      compareDate = Ext.Date.parse(compareDate, 'Y-m-d');
      if (today.getTime() <= compareDate.getTime()) {
        me.setValue(today);
        me.onLoad();
      }
    }
  },
  onLeftClick: function() {
    var me = this;
    if (me.bSearching != true) {
      var today = me.date.getValue();
      today = Ext.Date.add(today, Ext.Date.DAY, -1);
      me.setValue(today);
      me.onLoad();
    }
  }
});
