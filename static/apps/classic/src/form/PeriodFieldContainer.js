Ext.define('apps.form.PeriodFieldContainer', {
  extend: 'Ext.form.FieldContainer',
  alias: 'widget.periodfieldcontainer',

  requires: [
    'Ext.data.Store',
    'Ext.data.proxy.Memory',
    'Ext.form.field.ComboBox',
    'Ext.form.field.Date',
    'Ext.layout.container.HBox'
  ],

  config: {
    periodValue: 'today',
    format: 'Y-m-d H:i',
    submitFormat: 'Y-m-d\\TH:i:00'
  },

  layout: {
    type: 'hbox'
  },

  initComponent: function() {
    const me = this;

    const periodValue = me.getInitialConfig('periodValue');
    const dateFormat = me.getInitialConfig('format');
    const dateSubmitFormat = me.getInitialConfig('submitFormat');

    const periodStore = Ext.create('Ext.data.Store', {
      autoLoad: true,
      proxy: {
        type: 'memory',
        data: [
          {
            value: 'today',
            display: '오늘',
            start: {
              format: Ext.Date.HOUR,
              interval: -24
            },
            end: null
          },
          {
            value: 'yesterday',
            display: '어제',
            start: {
              format: Ext.Date.DAY,
              interval: -1,
              hours: 0,
              minutes: 0,
              seconds: 0,
              ms: 0
            },
            end: {
              format: Ext.Date.DAY,
              interval: -1,
              hours: 23,
              minutes: 59,
              seconds: 59,
              ms: 999
            }
          },
          {
            value: '2 days ago',
            display: '이틀 전',
            start: {
              format: Ext.Date.DAY,
              interval: -2,
              hours: 0,
              minutes: 0,
              seconds: 0,
              ms: 0
            },
            end: {
              format: Ext.Date.DAY,
              interval: -2,
              hours: 23,
              minutes: 59,
              seconds: 59,
              ms: 999
            }
          },
          {
            value: 'this week',
            display: '이번 주',
            start: {
              format: Ext.Date.DAY,
              interval: -7,
              hours: 0,
              minutes: 0,
              seconds: 0,
              ms: 0
            },
            end: null
          },
          {
            value: 'this month',
            display: '이번 달',
            start: {
              format: Ext.Date.DAY,
              interval: -28,
              hours: 0,
              minutes: 0,
              seconds: 0,
              ms: 0
            },
            end: null
          },
          {
            value: 'this year',
            display: '올해',
            start: {
              format: Ext.Date.MONTH,
              interval: -new Date().getMonth(),
              day: 1, // Set day 1
              hours: 0,
              minutes: 0,
              seconds: 0,
              ms: 0
            },
            end: null
          },
          {
            value: 'other',
            display: '기간설정',
            start: {
              format: null,
              interval: 0,
              hours: 0,
              minutes: 0,
              seconds: 0,
              ms: 0
            },
            end: {
              format: null,
              interval: 0,
              hours: 23,
              minutes: 59,
              seconds: 59,
              ms: 999
            }
          }
        ]
      }
    });
    const initRecord = periodStore.findRecord('value', periodValue);
    const startParams = initRecord.get('start');
    const endParams = initRecord.get('end');
    const now = new Date();
    let start = now; // Set default
    let end = now; // Set default

    if (startParams) {
      const { format, interval, hours, minutes, seconds, ms } = startParams;
      start = this.calculateDate(
        start,
        format,
        interval,
        hours,
        minutes,
        seconds,
        ms
      );
    }

    if (endParams) {
      const { format, interval, hours, minutes, seconds, ms } = endParams;
      end = this.calculateDate(
        end,
        format,
        interval,
        hours,
        minutes,
        seconds,
        ms
      );
    }

    me.items = [
      {
        xtype: 'combobox',
        name: 'period',
        itemId: 'period',
        value: periodValue,
        store: periodStore,
        queryMode: 'local',
        submitValue: false,
        listeners: {
          select: (cmp, record, eOpts) => {
            me.fireEvent('selectPeriod', cmp, record, eOpts);
          }
        }
      },
      {
        fieldLabel: '시작 (Start)',
        name: 'start_time',
        itemId: 'start',
        value: start,
        xtype: 'datefield',
        format: dateFormat,
        submitFormat: dateSubmitFormat,
        // maxValue: end,
        // reference: 'startDateField',
        // publishes: ['value'],
        // bind: {
        //   maxValue: '{endDateField.value}'
        // },
        listeners: {
          afterrender: cmp => {
            me.fireEvent('afterrenderDateField', cmp);
          }
        }
      },
      {
        fieldLabel: '마지막 (End)',
        name: 'end_time',
        itemId: 'end',
        value: end,
        xtype: 'datefield',
        format: dateFormat,
        submitFormat: dateSubmitFormat,
        // minValue: start,
        // reference: 'endDateField',
        // publishes: ['value'],
        // bind: {
        //   minValue: '{startDateField.value}'
        // },
        listeners: {
          afterrender: cmp => {
            me.fireEvent('afterrenderDateField', cmp);
          }
        }
      }
    ];

    me.callParent();
  },

  listeners: {
    selectPeriod: function(cmp, record) {
      const me = this;
      const startParams = record.get('start');
      const endParams = record.get('end');
      const value = record.get('value');
      const now = new Date();
      let start = now; // Set default
      let end = now; // Set default

      switch (value) {
        case 'other':
          start = new Date(now.setMinutes(0, 0, 0));
          end = new Date(now.setHours(23, 59, 59, 999));
          break;
        default:
          if (startParams) {
            const {
              format,
              interval,
              day,
              hours,
              minutes,
              seconds,
              ms
            } = startParams;
            start = me.calculateDate(
              start,
              format,
              interval,
              day,
              hours,
              minutes,
              seconds,
              ms
            );
          }

          if (endParams) {
            const {
              format,
              interval,
              day,
              hours,
              minutes,
              seconds,
              ms
            } = endParams;
            end = me.calculateDate(
              end,
              format,
              interval,
              day,
              hours,
              minutes,
              seconds,
              ms
            );
          }
          break;
      }
      const startDateField = me.getComponent('start');
      const endDateField = me.getComponent('end');
      // startDateField.setMaxValue(end);
      // endDateField.setMinValue(start);
      startDateField.setValue(start);
      endDateField.setValue(end);
    },

    afterrenderDateField: function(cmp) {
      this.addAutoSelectPeriodField(cmp, 'other');
    }
  },

  calculateDate: function(
    date,
    format,
    value,
    day,
    hours,
    minutes,
    seconds,
    ms
  ) {
    let result = format ? Ext.Date.add(date, format, value) : date;

    if (day) {
      result = new Date(result.setDate(day));
    }

    if (hours || hours === 0) {
      result = new Date(result.setHours(hours, minutes, seconds, ms));
    }

    return result;
  },

  addAutoSelectPeriodField: (cmp, value) => {
    const ownerCt = cmp.getRefOwner();
    const periodField = ownerCt.getComponent('period');

    cmp.getEl().dom.lastChild.addEventListener('click', () => {
      periodField.suspendEvent('select');
      periodField.setValue(value);
      periodField.resumeEvent('select');
    });
  }
});
