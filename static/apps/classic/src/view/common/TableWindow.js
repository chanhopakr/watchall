/**
 * Created by go on 16. 1. 15.
 */
Ext.define('apps.view.common.TableWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'Ext.button.Button',
    'Ext.container.Container',
    'Ext.data.Model',
    'Ext.data.proxy.Ajax',
    'Ext.data.reader.Json',
    'Ext.form.field.ComboBox',
    'Ext.form.field.Text',
    'Ext.grid.Panel',
    'Ext.grid.column.Check',
    'Ext.grid.plugin.CellEditing',
    'Ext.layout.container.HBox',
    'Ext.layout.container.VBox'
  ],

  height: 600,
  width: 900,
  iconCls: 'x-fa fa-table',
  bind: {
    title: '테이블 스키마 ({table})'
  },
  bodyPadding: 10,
  layout: { type: 'vbox', align: 'stretch' },

  referenceHolder: true,
  defaultListenerScope: true,

  viewModel: {
    data: {
      showSyncColumn: false,
      showSyncColumnIfBig: false, // 레코드 수가 많으면 표시 동기화 필드 표시. codemap 에서 테이블이 크면 조금씩 동기화
      showSelectColumn: false,
      showRenameColumn: false,
      showUdateColumn: true, // _date

      showPK: false,
      pkStore: [],

      database_id: null,
      table: '',
      dbtype: '',
      formData: {
        where: '',
        primary_key: '',
        primary_key_condition: ''
      }
    }
  },

  //initComponent: function() {
  //    var me = this;
  //    if (me.showSyncColumnIfBig) {
  //        me.grid.store.on('load', function(store, records) {
  //            var count = store.proxy.reader.rawData.count;
  //            if (count < 10000) {
  //                var index = me.grid.headerCt.items.findIndex('dataIndex', 'sync');
  //                me.grid.headerCt.columnManager.getColumns()[index].hide();
  //                for (var i = 0, l = records.length; i < l; i++) {
  //                    records[i].set('sync', false);
  //                }
  //            }
  //        });
  //    }
  //},

  items: [
    {
      xtype: 'grid',
      reference: 'grid',
      store: {
        model: 'Ext.data.Model',
        proxy: {
          type: 'ajax',
          url: '/dbsearch/table_schema',
          reader: { type: 'json', rootProperty: 'data' }
        }
      },
      flex: 1,
      enableTextSelection: true,
      paging: false,
      extFields: ['convtype'],
      viewConfig: { markDirty: false },
      columns: [
        { text: '칼럼명', dataIndex: 'field', width: 140, sortable: false },
        { text: '타입', dataIndex: 'type', width: 120, sortable: false },
        {
          text: 'PRI-Key',
          dataIndex: 'pk',
          width: 80,
          sortable: false,
          align: 'center',
          renderer: 'renderPK'
        },
        {
          xtype: 'checkcolumn',
          text: '<span style="color: red;">*</span> 동기화',
          dataIndex: 'sync',
          width: 70,
          sortable: false,
          align: 'center',
          bind: { hidden: '{!showSyncColumn}' }, //if (me.showSyncColumn || me.showSyncColumnIfBig)
          listeners: {
            checkchange: 'onSyncCheck',
            beforecheckchange: 'onSyncBeforeCheck'
          }
        },
        {
          xtype: 'checkcolumn',
          text: '<span style="color: red;">*</span> 선택',
          dataIndex: 'select',
          width: 70,
          sortable: false,
          align: 'center',
          bind: { hidden: '{!showSelectColumn}' } //if (me.showSelectColumn)
        },
        {
          text: '<span style="color: red;">*</span> 칼럼명 변경',
          dataIndex: 'rename',
          width: 140,
          sortable: false,
          editor: { xtype: 'textfield' },
          bind: { hidden: '{!showRenameColumn}' } //if (me.showRenameColumn)
        },
        {
          text: '한글변환',
          dataIndex: 'binary_korean',
          width: 80,
          sortable: false,
          xtype: 'checkcolumn',
          listeners: { beforecheckchange: 'onKorean' },
          bind: { hidden: '{showBinaryKorean}' } //if (me._data.dbtype == 'mssql') { // mssql 텍스트가 바이너리로 저장돼 있을 경우
        },
        {
          text: '_date',
          dataIndex: '_date',
          width: 80,
          sortable: false,
          xtype: 'checkcolumn',
          listeners: { checkchange: 'onDateCheckChange' },
          bind: { hidden: '{showUdateColumn}' } //if (me.showUdateColumn) {
        },
        {
          text: '_date format',
          dataIndex: 'format',
          width: 160,
          sortable: false,
          editor: { xtype: 'textfield', reference: 'format_editor' },
          bind: { hidden: '{showUdateColumn}' } //if (me.showUdateColumn) {
        }
      ],
      plugins: [
        {
          ptype: 'cellediting',
          clicksToEdit: 1,
          listeners: {
            beforeedit: function(editor, e) {
              var field = e.field;
              var convtype = e.record.get('convtype');
              if (field == 'rename') {
                return true;
              } else if (field == 'format') {
                if (!e.record.get('_date')) {
                  // _date not chekced
                  return false;
                }
                return convtype == 'TEXT';
              } else {
                return false;
              }
            }
          }
        }
      ]
    },
    {
      xtype: 'container',
      layout: { type: 'hbox' },
      items: [
        {
          xtype: 'combobox',
          reference: 'pkCombo',
          fieldLabel: '기준 필드',
          bind: {
            hidden: '{showPK}',
            store: '{pkStore}',
            value: '{formData.primary_key}'
          }
        },
        {
          xtype: 'textfield',
          reference: 'pkCondition',
          flex: 1,
          fieldLabel: '조건',
          bind: {
            hidden: '{showPK}',
            value: '{formData.primary_key_condition}'
          }
        }
      ]
    },
    {
      xtype: 'textfield',
      reference: 'where',
      fieldLabel: '조건',
      padding: '10 0 0 0',
      bind: '{formData.where}'
    }
  ],

  buttons: [
    { xtype: 'button', text: '저장', handler: 'onSave' },
    { xtype: 'button', text: '취소', handler: 'onCancel' }
  ],

  listeners: { boxready: 'onReady' },

  onReady: function() {
    var me = this,
      vm = me.getViewModel(),
      formData = vm.get('formData'),
      grid = me.lookupReference('grid'),
      store = grid.getStore(),
      pkStore = [],
      extra = vm.get('extra'),
      pk = '',
      i,
      l;

    if (extra) {
      for (i = 0, l = extra.fields.length; i < l; i += 1) {
        store.add(extra.fields[i]);
        pkStore.push(extra.fields[i].field);
        if (extra.fields[i].pk) {
          pk = extra.fields[i].field;
        }
      }
      if (!formData.primary_key) {
        vm.set('formData.primary_key', pk);
      }
      vm.set('pkStore', pkStore);
    } else {
      store.load({
        params: {
          database_id: vm.get('database_id'),
          table: vm.get('table')
        },
        callback: function(r) {
          for (i = 0, l = r.length; i < l; i += 1) {
            var tempData = r[i].getData();
            pkStore.push(tempData.field);
            if (tempData.pk) {
              pk = tempData.field;
            }
          }
          if (!formData.primary_key) {
            vm.set('formData.primary_key', pk);
          }
          vm.set('pkStore', pkStore);
        }
      });
    }
  },

  renderPK: function(value) {
    return value ? 'Y' : '';
  },

  onSyncCheck: function(column, rowIndex) {
    this.singlSelect('sync', rowIndex);
  },

  onSyncBeforeCheck: function(checkcolumn, rowIndex) {
    var me = this,
      record = me
        .lookupReference('grid')
        .getStore()
        .getAt(rowIndex);

    if (record.get('binary_korean')) {
      Ext.Msg.alert('오류', '동기화 키 필드는 한글로 변환할 수 없습니다.');
      return false;
    }
  },

  onKorean: function(checkColumn, rowIndex) {
    var me = this,
      record = me
        .lookupReference('grid')
        .getStore()
        .getAt(rowIndex);

    if (record.get('convtype') != 'TEXT') {
      Ext.Msg.alert('오류', '텍스트 타입이 아닙니다.');
      return false;
    }
    if (record.get('sync')) {
      Ext.Msg.alert('오류', '동기화 키 필드는 한글로 변환할 수 없습니다.');
      return false;
    }
  },

  onDateCheckChange: function(column, rowIndex) {
    this.singleSelect('_date', rowIndex);
  },

  singleSelect: function(field, rowIndex) {
    var me = this,
      store = me.lookupReference('grid').getStore(),
      record,
      i,
      l;

    for (i = 0, l = store.getCount(); i < l; i++) {
      record = store.getAt(i);
      if (i == rowIndex) {
        if (field == '_date' && record.get('convtype') == 'TEXT') {
          record.set('format', '%Y-%m-%d %H:%M:%S');
        }
      } else {
        record.set(field, false);
        if (field == '_date') {
          record.set('format', '');
        }
      }
    }
  },

  onSave: function() {
    var me = this,
      store = me.lookupReference('grid').getStore(),
      vm = me.getViewModel(),
      data = vm.get('data'),
      where = me.lookupReference('where').getValue(),
      primary_key = me.lookupReference('pkCombo').getValue(),
      primary_key_condition = me.lookupReference('pkCondition').getValue(),
      fields = [],
      fieldList = [],
      i,
      l,
      record,
      d,
      selectCount = 0;

    for (i = 0, l = store.getCount(); i < l; i++) {
      record = store.getAt(i);
      var recordData = record.getData();
      d = {
        field: recordData.field,
        type: recordData.type,
        convtype: recordData.convtype,
        pk: recordData.pk,
        _date: recordData._date,
        format: recordData._date ? recordData.format : ''
      };
      //if (me.showSyncColumn || me.showSyncColumnIfBig) {
      if (vm.get('showSyncColumn')) {
        d['sync'] = recordData.sync;
      }
      if (vm.get('showSelectColumn')) {
        d['select'] = recordData.select;
      }
      if (vm.get('showRenameColumn')) {
        d['rename'] = recordData.rename;
        if (d.sync && d.rename != d.field) {
          // sync 필드로 지정됐지만, 필드명을 리네임 할 때
          Ext.Msg.alert('오류', '동기화 키 필드는 필드명을 바꿀 수 없습니다.');
          return;
        }
      }
      if (vm.get('dbtype') == 'mssql') {
        d['binary_korean'] = recordData.binary_korean;
      }
      fields.push(d);

      if (recordData.select) {
        selectCount += 1;
        fieldList.push(recordData.field);
      }
    }

    if (fieldList.indexOf(primary_key) < 0) {
      Ext.Msg.alert(
        '오류',
        "사용하지 않는 칼럼을 'PRI-Key'로 선택 되었습니다. 'PRI-Key'를 변경해야 합니다."
      );
      return;
    }

    if (selectCount < 2) {
      Ext.Msg.alert('오류', '선택된 칼럼이 2개 이상이어야 합니다');
      return;
    }
    data['fields'] = fields;
    data['primary_key'] = primary_key;
    data['primary_key_condition'] = primary_key_condition;
    data['where'] = where;
    me.fireEvent('save', me, data);
    me.onCancel();
  },

  onCancel: function() {
    this.close();
  }
});
