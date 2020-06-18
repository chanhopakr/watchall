Ext.define('apps.container.arbor.PeriodContainer', {
  extend: 'Ext.container.Container',

  requires: [
    'Ext.form.field.ComboBox',
    'Ext.form.field.Date',
    'Ext.layout.container.HBox',
    'apps.store.arbor.Period'
  ],

  alias: 'widget.arborperiodcontainer',

  layout: {
    type: 'hbox'
  },

  items: [
    {
      fieldLabel: '기간',
      name: 'period',
      itemId: 'period',
      value: 'today',
      xtype: 'combobox',
      store: {
        type: 'arbor.period'
      },
      listeners: {
        select: (cmp, record, eOpts) => {
          cmp.getRefOwner().fireEvent('selectPeriod', cmp, record, eOpts);
        }
      }
    },
    {
      fieldLabel: '시작 (Start)',
      name: 'start_ascii',
      itemId: 'start_ascii',
      xtype: 'datefield',
      editable: true,
      disabled: true,
      format: 'Y-m-d H:i',
      submitFormat: 'm/d/y H:i:s'
    },
    {
      fieldLabel: '마지막 (End)',
      name: 'end_ascii',
      itemId: 'end_ascii',
      xtype: 'datefield',
      editable: true,
      disabled: true,
      format: 'Y-m-d H:i',
      submitFormat: 'm/d/y H:i:s'
    }
  ],

  listeners: {
    selectPeriod: function(cmp, record, eOpts) {
      const ownerCt = cmp.getRefOwner();
      const period = record.get('value');
      const disable = period !== 'other';
      let start = null;
      let end = null;

      if (!disable) {
        // 현재 분 -> start 분, end 분 으로 만들기, 예:
        // 01:59 -> 01:55, 02:00
        const now = new Date();
        const minutes = parseInt(now.getMinutes() / 5, 10) * 5;
        start = new Date(now.setMinutes(minutes, 0, 0));
        end = Ext.Date.add(start, Ext.Date.MINUTE, 5);
      }

      const startDateField = ownerCt.getComponent('start_ascii');
      if (startDateField) {
        startDateField.setDisabled(disable);
        startDateField.setValue(start);
      }

      const endDateField = ownerCt.getComponent('end_ascii');
      if (endDateField) {
        endDateField.setDisabled(disable);
        endDateField.setValue(end);
      }
      this.fireEvent('afterSelectPeriod', cmp, record, eOpts);
    }
    // selectAfterPeriod: function(cmp, record, eOpts) {}
  }
});
