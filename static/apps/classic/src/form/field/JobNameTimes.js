Ext.define('apps.form.field.JobNameTimes', {
  extend: 'Ext.form.FieldContainer',
  alias: ['widget.jobnametimes', 'widget.jobnametimesfield'],

  requires: [
    'Ext.data.proxy.Ajax',
    'Ext.data.reader.Json',
    'Ext.form.field.ComboBox',
    'Ext.layout.container.HBox',
    'apps.ux.plugin.ClearButton'
  ],

  config: {
    enableKeyEvents: false,
    value: {
      job_name: null,
      job_year: null,
      job_time: null
    }
  },

  layout: 'hbox',

  defaults: {
    margin: '0 0 0 2',
    plugins: ['clearbutton']
  },

  initComponent: function() {
    const me = this;

    me.jobName = Ext.create('Ext.form.field.ComboBox', {
      name: 'job_name',
      displayField: 'value',
      emptyText: '전체',
      editable: true,
      queryMode: 'local',
      margin: 0,
      flex: 1,
      value: me.value.job_name,
      store: {
        autoLoad: true,
        pageSize: 0,
        proxy: {
          type: 'ajax',
          url: '/port_scan_job/histories',
          reader: {
            type: 'json',
            rootProperty: 'data'
          }
        }
      },
      plugins: ['clearbutton'],
      enableKeyEvents: me.enableKeyEvents,
      getValue: function() {
        return this.getRawValue();
      },
      listeners: {
        keydown: (comp, e, eOpts) => {
          const { ownerCt } = comp;

          if (e.keyCode === 13) {
            /**
             * 입력된 text 를 combobox 목록에서 선택하지 않고 검색시
             * 현재 입력된 text 를 기준으로 combobox 목록에서 찾아 선택하기
             */
            const store = comp.getStore();
            const value = comp.getValue();
            const index = store.find('value', value);

            if (index > -1) {
              comp.setSelection(store.getAt(index));
            }
          }

          ownerCt.fireEvent('keydown', comp, e, eOpts);
        },
        select: (comp, record, eOpts) => {
          const { ownerCt } = comp;
          const itemId = 'job_year';
          const item = ownerCt.getComponent(itemId);

          if (item) {
            const records = record.get('times');
            const itemStore = item.getStore();
            itemStore.add(records);
            item.setSelection(itemStore.first());
          }

          // Call event from parent widget
          ownerCt.fireEvent('select', ownerCt, comp, record, eOpts);
        },
        beforedeselect: (comp, record, index, eOpts) => {
          const { ownerCt } = comp;

          ['job_year', 'job_time'].forEach(itemId => {
            const item = ownerCt.getComponent(itemId);

            if (item) {
              item.getStore().removeAll();
              item.setValue(null);
            }
          });

          // Call event from parent widget
          ownerCt.fireEvent('deselect', ownerCt, comp, record, index, eOpts);
        }
      }
    });

    me.items = [
      me.jobName,
      {
        xtype: 'combobox',
        name: 'job_year',
        itemId: 'job_year',
        displayField: 'value',
        emptyText: '년도',
        editable: false,
        queryMode: 'local',
        width: 100,
        value: me.value.job_year,
        store: {
          autoLoad: true,
          fields: ['value']
        },
        listeners: {
          select: function(comp, record) {
            const itemId = 'job_time';
            const item = comp.ownerCt.getComponent(itemId);
            if (item) {
              const records = record.get('times');
              const itemStore = item.getStore();
              itemStore.add(records);
              item.setSelection(itemStore.first());
            }
          },
          beforedeselect: comp => {
            const itemId = 'job_time';
            const item = comp.ownerCt.getComponent(itemId);
            if (item) {
              item.getStore().removeAll();
              item.setValue(null);
            }
          }
        }
      },
      {
        xtype: 'combobox',
        name: 'job_time',
        itemId: 'job_time',
        emptyText: '월-일',
        editable: false,
        queryMode: 'local',
        width: 145,
        value: me.value.job_time,
        store: {
          autoLoad: true,
          fields: ['value', 'display']
        }
      }
    ];

    if (me.value.job_name) {
      me.jobName.getStore().on('load', store => {
        const index = store.find('value', me.value.job_name);

        if (index > -1) {
          me.jobName.fireEvent('select', me.jobName, store.getAt(index));

          const { ownerCt } = me.jobName;
          ['job_year', 'job_time'].forEach(itemId => {
            const item = ownerCt.getComponent(itemId);
            item.setValue(me.value[itemId]);
          });
        }
      });
    }

    me.callParent();
  }
});
