Ext.define('apps.view.common.HostConfigWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'Ext.button.Button',
    'Ext.container.Container',
    'Ext.grid.column.Check',
    'Ext.form.RadioGroup',
    'Ext.form.field.Checkbox',
    'Ext.form.field.Number',
    'Ext.form.field.Text',
    'Ext.grid.Panel',
    'Ext.layout.container.Fit',
    'Ext.layout.container.HBox',
    'Ext.layout.container.VBox',
    'Ext.slider.Single',
    'Ext.tab.Panel'
  ],

  uses: ['apps.view.common.GroupListWindow'],

  width: 670,
  title: '에이전트 기본설정',
  layout: 'fit',
  referenceHolder: true,
  defaultListenerScope: true,
  items: {
    xtype: 'tabpanel',
    border: false,
    deferredRender: false,
    items: [
      {
        xtype: 'container',
        title: '에이전트',
        padding: 5,
        layout: { type: 'vbox', align: 'stretch' },
        items: [
          {
            xtype: 'container',
            margin: '0 0 5 0',
            flex: 1,
            layout: { type: 'hbox', align: 'stretch' },
            items: [
              {
                xtype: 'textfield',
                fieldLabel: '그룹명',
                readOnly: true,
                flex: 1,
                bind: '{groupname}'
              },
              {
                xtype: 'button',
                margin: '0 0 0 5',
                text: '변경',
                width: 60,
                handler: 'onGroupSelect'
              }
            ]
          },
          {
            xtype: 'textfield',
            fieldLabel: '에이전트명',
            bind: '{systemname}'
          },
          { xtype: 'textfield', fieldLabel: '에이전트IP', bind: '{localip}' },
          { xtype: 'textfield', fieldLabel: '인코딩', bind: '{encoding}' },
          { xtype: 'textfield', fieldLabel: '수집서버IP', bind: '{remoteip}' },
          {
            xtype: 'container',
            margin: '0 0 5 0',
            flex: 1,
            layout: { type: 'hbox', align: 'stretch' },
            items: [
              {
                xtype: 'textfield',
                fieldLabel: '수집서버 포트',
                flex: 1,
                margin: '0 10 0 0',
                bind: '{remoteport}'
              }
              // {xtype: 'checkbox', boxLabel: 'TLS 암호화', bind: '{usetls}'}
            ]
          },
          {
            xtype: 'textfield',
            fieldLabel: '파일삭제(시간)',
            bind: '{deletefilehours}'
          },
          {
            xtype: 'textfield',
            fieldLabel: '삭제 디렉토리',
            bind: '{deletedirectory}'
          },
          {
            xtype: 'textfield',
            fieldLabel: '인덱스 파일',
            bind: '{indexfile}'
          },
          {
            xtype: 'textfield',
            fieldLabel: '전송갯수',
            maskRe: /[0-9]/,
            flex: 1,
            bind: '{logchunksize}'
          },
          {
            xtype: 'textfield',
            fieldLabel: '수집갯수제한',
            maskRe: /[0-9]/,
            bind: '{queuelength}'
          },
          {
            xtype: 'grid',
            reference: 'runtimeGrid',
            //flex: 1,
            //selModel: new Ext.selection.CheckboxModel({ checkOnly: true }),
            bind: { store: '{runtimeStore}' },
            height: 200,
            columnLines: true,
            selModel: 'cellmodel',
            viewConfig: { markDirty: false, stripeRows: false },
            //tbar: [ /*'실행시간'*/ ],
            columns: [
              {
                text: '요일',
                dataIndex: 'day',
                width: 60,
                sortable: false,
                align: 'center'
              },
              {
                text: '00',
                dataIndex: '00',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '01',
                dataIndex: '01',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '02',
                dataIndex: '02',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '03',
                dataIndex: '03',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '04',
                dataIndex: '04',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '05',
                dataIndex: '05',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '06',
                dataIndex: '06',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '07',
                dataIndex: '07',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '08',
                dataIndex: '08',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '09',
                dataIndex: '09',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '10',
                dataIndex: '10',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '11',
                dataIndex: '11',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '12',
                dataIndex: '12',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '13',
                dataIndex: '13',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '14',
                dataIndex: '14',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '15',
                dataIndex: '15',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '16',
                dataIndex: '16',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '17',
                dataIndex: '17',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '18',
                dataIndex: '18',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '19',
                dataIndex: '19',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '20',
                dataIndex: '20',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '21',
                dataIndex: '21',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '22',
                dataIndex: '22',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              },
              {
                text: '23',
                dataIndex: '23',
                width: 40,
                sortable: false,
                renderer: 'renderRuntime'
              }
            ],
            listeners: { cellclick: 'onRuntimeSelect' }
          }
        ]
      },
      {
        xtype: 'container',
        title: 'SMS',
        padding: 5,
        flex: 1,
        layout: { type: 'vbox', align: 'stretch' },
        defaults: {
          labelWidth: 60,
          margin: '0 0 0 0',
          defaults: { labelWidth: 60, margin: '0 0 0 0' }
        },
        items: [
          {
            xtype: 'radiogroup',
            reference: 'audit_process',
            bind: { value: '{audit}' },
            fieldLabel: '감시',
            items: [
              { boxLabel: '사용', name: 'mode', inputValue: '1' },
              { boxLabel: '미사용', name: 'mode', inputValue: '0' }
            ]
          },
          {
            xtype: 'container',
            layout: { type: 'hbox', align: 'stretch' },
            margin: '0 0 5 0',
            items: [
              {
                xtype: 'slider',
                fieldLabel: 'CPU',
                increment: 1,
                minValue: 0,
                maxValue: 100,
                flex: 1,
                bind: '{cpu_threshold}'
              },
              {
                xtype: 'numberfield',
                minValue: 0,
                maxValue: 100,
                width: 80,
                margin: '0 0 0 5',
                bind: '{cpu_threshold}'
              }
            ]
          },
          {
            xtype: 'container',
            layout: { type: 'hbox', align: 'stretch' },
            margin: '0 0 5 0',
            items: [
              {
                xtype: 'slider',
                fieldLabel: 'Memory',
                increment: 1,
                minValue: 0,
                maxValue: 100,
                flex: 1,
                bind: '{memory_threshold}'
              },
              {
                xtype: 'numberfield',
                minValue: 0,
                maxValue: 100,
                width: 80,
                margin: '0 0 0 5',
                bind: '{memory_threshold}'
              }
            ]
          },
          {
            xtype: 'container',
            layout: { type: 'hbox', align: 'stretch' },
            margin: '0 0 5 0',
            items: [
              {
                xtype: 'slider',
                fieldLabel: 'Swap',
                increment: 1,
                minValue: 0,
                maxValue: 100,
                flex: 1,
                bind: '{swap_threshold}'
              },
              {
                xtype: 'numberfield',
                minValue: 0,
                maxValue: 100,
                width: 80,
                margin: '0 0 0 5',
                bind: '{swap_threshold}'
              }
            ]
          },
          {
            xtype: 'container',
            layout: { type: 'hbox', align: 'stretch' },
            margin: '0 0 5 0',
            items: [
              {
                xtype: 'slider',
                fieldLabel: 'Disk',
                increment: 1,
                minValue: 0,
                maxValue: 100,
                flex: 1,
                bind: '{disk_threshold}'
              },
              {
                xtype: 'numberfield',
                minValue: 0,
                maxValue: 100,
                width: 80,
                margin: '0 0 0 5',
                bind: '{disk_threshold}'
              }
            ]
          },
          {
            xtype: 'container',
            layout: { type: 'hbox', align: 'stretch' },
            margin: '0 0 5 0',
            items: [
              {
                xtype: 'slider',
                fieldLabel: 'Network',
                increment: 1,
                minValue: 0,
                maxValue: 100,
                flex: 1,
                bind: '{network_threshold}'
              },
              {
                xtype: 'numberfield',
                minValue: 0,
                maxValue: 100,
                width: 80,
                margin: '0 0 0 5',
                bind: '{network_threshold}'
              }
            ]
          },
          {
            xtype: 'grid',
            reference: 'volumeGrid',
            flex: 1,
            bind: { store: '{diskStore}' },
            columns: {
              defaults: {
                sortable: false
              },
              items: [
                {
                  xtype: 'checkcolumn',
                  dataIndex: 'checked',
                  text: null,
                  width: 40,
                  align: 'center',
                  headerCheckbox: true
                  // style: 'border-color: #d0d0d0;'
                },
                {
                  text: '파일시스템',
                  dataIndex: 'filesystem',
                  flex: 1
                },
                {
                  text: '사용률',
                  dataIndex: 'usage',
                  width: 100,
                  align: 'right'
                },
                {
                  text: '크기',
                  dataIndex: 'size',
                  width: 120,
                  align: 'right'
                }
              ]
            }
          }
        ]
      }
    ]
  },
  buttons: [
    { xtype: 'button', text: '저장', handler: 'onSave' },
    { xtype: 'button', text: '취소', handler: 'onClose' }
  ],
  renderRuntime: function(value, meta) {
    if (value && meta) {
      meta.tdStyle = 'background-color: #b8cfee';
    }
    return '&nbsp;';
  },
  onRuntimeSelect: function(grid, td, cellIndex, record) {
    var column = ('0' + (cellIndex - 1)).slice(-2);

    if (cellIndex == 0)
      // disallow clicking days
      return;

    if (!td) return;

    if (record.get(column) == 1) {
      td.style.backgroundColor = '#ffffff';
      record.set(column, 0);
    } else {
      td.style.backgroundColor = '#b8cfee';
      record.set(column, 1);
    }
  },
  onGroupSelect: function() {
    var me = this;
    new apps.view.common.GroupListWindow({
      onSave: function() {
        var me = this;
        var record = me.grid.getSelectionModel().getSelection()[0];
        me.fireEvent('save', record.get('rid'), record.get('text'));
        me.close();
      },
      listeners: {
        save: function(id, name) {
          me.groupname.setValue(name);
        }
      }
    }).show();
  },

  onSave: function() {
    var me = this,
      runtimeRecords = me
        .lookupReference('runtimeGrid')
        .getStore()
        .getRange(),
      runningtime = me.toRuntimeConfig(runtimeRecords),
      records = me
        .lookupReference('volumeGrid')
        .getStore()
        .getRange(),
      len = records.length,
      i = 0,
      record,
      disk_directory = [],
      d = me.getViewModel().getData();

    for (i = 0; i < len; i += 1) {
      record = records[i];
      if (!record.get('checked')) {
        continue;
      }
      disk_directory.push(record.get('filesystem'));
    }

    disk_directory = disk_directory.join(',');

    Ext.Msg.confirm(
      '확인',
      '변경내용을 저장하시겠습니까? 시스템에 영향을 줄 수 있습니다.',
      function(btn) {
        if (btn === 'no') {
          return;
        }

        me.fireEvent('save', me, {
          // agent
          groupname: d.groupname,
          systemname: d.systemname,
          localip: d.localip,
          encoding: d.encoding,
          remoteip: d.remoteip,
          remoteport: d.remoteport,
          usetls: d.usetls,
          deletefilehours: d.deletefilehours,
          deletedirectory: d.deletedirectory,
          indexfile: d.indexfile,
          logchunksize: d.logchunksize,
          queuelength: d.queuelength,
          runningtime: runningtime,
          // sms
          audit_process: d.audit.mode,
          cpu_threshold: d.cpu_threshold,
          memory_threshold: d.memory_threshold,
          swap_threshold: d.swap_threshold,
          disk_threshold: d.disk_threshold,
          network_threshold: d.network_threshold,
          disk_directory: disk_directory
        });
      }
    );
  },

  onClose: function() {
    this.close();
  },

  toRuntimeConfig: function(records) {
    var days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'],
      map = {},
      tokens = [],
      day,
      record,
      start,
      end,
      d,
      value,
      result,
      i,
      l;

    function pack(s, e) {
      if (e - s == 1) {
        return ('0' + s).slice(-2);
      } else {
        return ('0' + s).slice(-2) + '-' + ('0' + e).slice(-2);
      }
    }

    for (i = 0, l = records.length; i < l; i++) {
      record = records[i];
      day = days[i];

      d = [];
      start = null;
      for (var j = 0, k = 24; j < k; j++) {
        value = record.get(('0' + j).slice(-2));
        if (value == 1 && start == null) {
          start = j;
          if (j == 23) {
            // pack
            end = 24;
            d.push(pack(start, end));
            start = null;
          }
        } else if (value == 1 && start != null) {
          if (j == 23) {
            // pack
            end = 24;
            d.push(pack(start, end));
            start = null;
          }
        } else if (value == 0 && start == null) {
          // pass
        } else if (value == 0 && start != null) {
          // pack
          end = j;
          d.push(pack(start, end));
          start = null;
        }
      }
      map[day] = d;
    }

    for (i = 0, l = days.length; i < l; i++) {
      day = days[i];
      tokens.push(Ext.String.format('{0}({1})', day, map[day].join(', ')));
    }
    result = tokens.join(', ');

    if (
      result ==
      'mon(00-24), tue(00-24), wed(00-24), thu(00-24), fri(00-24), sat(00-24), sun(00-24)'
    ) {
      return '';
    } else {
      return result;
    }
  }
});
