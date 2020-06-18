Ext.define('apps.view.common.IPSearchWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'Ext.button.Button',
    'Ext.data.proxy.Ajax',
    'Ext.data.reader.Json',
    'Ext.form.Label',
    'Ext.form.Panel',
    'Ext.form.field.ComboBox',
    'Ext.form.field.Text',
    'Ext.grid.Panel',
    'Ext.grid.column.RowNumberer',
    'Ext.layout.container.Fit',
    'Ext.layout.container.HBox',
    'apps.ux.plugin.ClearButton'
  ],

  title: 'IP 설정',
  iconCls: 'x-fa fa-lock',
  width: 600,
  bodyPadding: 10,
  border: false,
  layout: 'fit',
  referenceHolder: true,
  defaultListenerScope: true,

  //initComponent: function() {
  //    var me = this;
  //
  //    me.data = me.target.getValue().split(", ");
  //
  //    me.ipGrid.setLoading({ msg: 'Loading...',  useTargetEl: true });
  //    me.lookupReference('recentIP').getStore().load({
  //        callback: function(r) {
  //        }
  //    });
  //    me.callParent(arguments);
  //},

  viewModel: {
    stores: {
      recentIPStore: {
        fields: ['ip', 'ctime'],
        proxy: {
          type: 'ajax',
          url: '/combo/recent_ip',
          reader: { type: 'json', rootProperty: 'data' }
        },
        autoLoad: true,
        listeners: { beforeload: 'beforeRecentIPStore' }
      },
      ipGridStore: {
        field: ['ip'],
        data: []
      }
    }
  },

  items: [
    {
      xtype: 'grid',
      reference: 'ipGrid',
      height: 270,
      store: {
        fields: ['ip', 'ctime']
      },
      loadMask: true,
      multiSelect: true,
      tbar: [
        {
          xtype: 'combobox',
          reference: 'cbxRecentIP',
          labelWidth: 50,
          width: 110,
          store: {
            fields: ['value', 'display'],
            data: [
              ['ip', '단일 IP']
              // ['band', 'IP 대역']
            ]
          },
          value: 'ip',
          listeners: {
            select: 'onIPSelect'
          }
        },
        {
          xtype: 'combobox',
          reference: 'recentIP',
          remoteMode: 'remote',
          emptyText: '최근IP',
          flex: 1,
          triggerAction: 'all',
          editable: true,
          valueField: 'ip',
          displayField: 'ip',
          maskRe: /[0-9\.]/,
          enableKeyEvents: true,
          plugins: 'clearbutton',
          fieldStyle: 'ime-mode: disabled;',
          tpl: Ext.create(
            'Ext.XTemplate',
            '<tpl for=".">',
            '<div class="x-boundlist-item">{ip} ({ctime})</div>',
            '</tpl>'
          ),
          listeners: { keydown: 'ipFieldKeydown', change: 'ipFieldChange' },
          vtype: 'IPAddress',
          bind: { store: '{recentIPStore}' }
        },
        {
          xtype: 'form',
          reference: 'bandIP',
          hidden: true,
          border: false,
          layout: { type: 'hbox' },
          items: [
            {
              xtype: 'textfield',
              name: 'startIP',
              emptyText: '시작IP',
              maxLength: 15,
              enforceMaxLength: true,
              fieldStyle: 'ime-mode: disabled;',
              maskRe: /[0-9\.]/,
              width: 120,
              listeners: { keydown: 'ipFieldKeydown', change: 'ipFieldChange' },
              vtype: 'IPAddress'
            },
            { xtype: 'label', text: '~', margin: '5 5 0 5' },
            {
              xtype: 'textfield',
              name: 'endIP',
              emptyText: '마지막IP',
              maxLength: 15,
              enforceMaxLength: true,
              fieldStyle: 'ime-mode: disabled;',
              maskRe: /[0-9\.]/,
              width: 120,
              listeners: { keydown: 'ipFieldKeydown', change: 'ipFieldChange' },
              vtype: 'IPAddress'
            }
          ]
        },
        {
          xtype: 'button',
          text: '추가',
          iconCls: 'x-fa fa-plus',
          handler: 'ipAdd'
        },
        {
          xtype: 'button',
          text: '삭제',
          iconCls: 'x-fa fa-minus',
          handler: 'onDelete',
          bind: { disabled: '{!ipGrid.selection}' }
        }
      ],
      columns: {
        items: [
          {
            xtype: 'rownumberer',
            text: 'No',
            align: 'center',
            width: 50,
            resizable: true
          },
          { text: 'IP주소', dataIndex: 'ip', flex: 1 }
          // {text: '최근로그인시간', dataIndex: 'ctime', width: 120}
        ]
      },
      bind: { store: '{ipGridStore}' }
    }
  ],
  buttons: [
    { xtype: 'button', text: '확인', handler: 'onSave' },
    { xtype: 'button', text: '취소', handler: 'onCancel' }
  ],
  listeners: { boxready: 'onBoxready' },

  onBoxready: function() {
    var me = this,
      vm = me.getViewModel(),
      ip = vm.get('target').split(','),
      store = vm.getStore('ipGridStore');

    store.removeAll();
    for (var i = 0, l = ip.length; i < l; i += 1) {
      if (ip[i] != '' && ip[i] != false && ip[i] != undefined) {
        store.add({ ip: ip[i] });
      }
    }
  },
  beforeRecentIPStore: function(store) {
    var userid = this.getViewModel().get('userid');
    store.getProxy().setExtraParam('userid', userid);
  },

  ipFieldKeydown: function(t) {
    if (t.getValue() != null && t.getValue().length >= 15) {
      t.selectText(14);
    }
  },
  ipFieldChange: function(cp, newValue) {
    if (newValue) {
      cp.setValue(newValue.replace(/[^0-9.]/g, ''));
    }
  },
  onIPLoad: function() {
    var me = this,
      ipGrid = me.lookupReference('ipGrid'),
      ipStore = ipGrid.getStore();

    function checkBandIP2(chkIP, startIP, endIP) {
      var sip = startIP.split('.');
      var eip = endIP.split('.');
      var ip = chkIP.split('.');

      if (sip[0] <= ip[0] && ip[0] <= eip[0]) {
        if (sip[1] <= ip[1] && ip[1] <= eip[1]) {
          if (sip[2] <= ip[2] && ip[2] <= eip[2]) {
            if (sip[3] <= ip[3] && ip[3] <= eip[3]) {
              return true;
            }
          }
        }
      }
      return false;
    }

    for (var i = 0; i < me.data.length; i++) {
      var tmpCtime = '';
      for (var j = 0; j < r.length; j++) {
        if (me.data[i] == r[j].get('ip')) {
          tmpCtime = r[j].get('ctime');
        } else if (me.data[i].indexOf('~') > -1) {
          var tmpBandIp = me.data[i].split(' ~ ');

          if (
            checkBandIP2(r[j].get('ip'), tmpBandIp[0], tmpBandIp[1]) == true
          ) {
            tmpCtime = r[j].get('ctime');
          }
        }
      }
      ipStore.insert(ipStore.getCount(), { ip: me.data[i], ctime: tmpCtime });
    }
    if (me.data == '') {
      ipStore.remove(ipStore.getRange(0, ipStore.getCount()));
    }
    me.lookupReference('ipGrid').setLoading(false);
  },

  onIPSelect: function(combobox) {
    var me = this,
      recentIP = me.lookupReference('recentIP'),
      bandIP = me.lookupReference('bandIP'),
      value = combobox.getValue();

    if (value == 'ip') {
      recentIP.setValue('');
      recentIP.setVisible(true);
      bandIP.setVisible(false);
    } else if (value == 'band') {
      bandIP.getForm().reset();
      recentIP.setVisible(false);
      bandIP.setVisible(true);
    }
  },

  ipAdd: function() {
    var me = this,
      ipGrid = me.lookupReference('ipGrid'),
      ipStore = ipGrid.getStore(),
      mode = me.lookupReference('cbxRecentIP').getValue(),
      tempStore,
      flag,
      i,
      l;

    function ipCheck(ip) {
      var result = true;
      var re = /^(1|2)?\d?\d([.](1|2)?\d?\d){3}$/;

      if (!re.test(ip)) {
        result = false;
      } else {
        if (ip == '0.0.0.0') {
          result = false;
        } else {
          var tmp_ip = ip.split('.');
          for (var i = 0; i < tmp_ip.length; i++) {
            if (tmp_ip[i] > 255) {
              result = false;
              break;
            }
          }
        }
      }
      return result;
    }

    if (mode == 'ip') {
      var rIP = me.lookupReference('recentIP').getValue();
      if (rIP != null && rIP != '') {
        var tmpIP = rIP.split('.');

        if (tmpIP.length != 4) {
          Ext.Msg.alert(
            '알림',
            '지원되지 않는 형식입니다.<br/>ex) 192.168.0.1'
          );
          return;
        } else if (!ipCheck(rIP)) {
          Ext.Msg.alert(
            '알림',
            '유효하지 않은 IP 주소입니다. 다시 확인해 주십시오.'
          );
          return;
        }

        tempStore = ipStore.getRange(0, ipStore.getCount());
        flag = 0;
        for (i = 0, l = ipStore.getCount(); i < l; i++) {
          if (rIP == tempStore[i].get('ip')) {
            flag = 1;
            break;
          }
        }

        if (flag == 0) {
          var tmpCtime = '';
          if (ipStore.findRecord('ip', rIP) != null) {
            tmpCtime = ipStore.findRecord('ip', rIP).get('ctime');
          }
          ipStore.insert(ipStore.getCount(), { ip: rIP, ctime: tmpCtime });
        }
        me.lookupReference('recentIP').setValue('');
      } else {
        Ext.Msg.alert('알림', 'IP를 입력하십시오.');
      }
    } else if (mode == 'band') {
      function checkBandIP(form) {
        var result = { success: false, errmsg: '' };
        var errmsg = null;
        var i;

        if (form.startIP.trim() == '') {
          result['errmsg'] = '대역의 시작 IP를 입력하십시오.';
        } else if (form.endIP.trim() == '') {
          result['errmsg'] = '대역의 마지막 IP를 입력하십시오.';
        } else {
          var sip = form.startIP.trim().split('.');
          if (sip.length == 4) {
            for (i = 0; i < sip.length; i++) {
              if (!sip[i]) {
                result['errmsg'] = '시작 IP가 올바르지 않습니다.';
                break;
              } else if (
                i == 0 &&
                sip[i] != '' &&
                (parseInt(sip[i], 10) <= 0 || parseInt(sip[i], 10) > 255)
              ) {
                result['errmsg'] = '시작 IP가 올바르지 않습니다.';
                break;
              } else if (
                i > 0 &&
                sip[i] != '' &&
                (parseInt(sip[i], 10) < 0 || parseInt(sip[i], 10) > 255)
              ) {
                result['errmsg'] = '시작 IP가 올바르지 않습니다.';
                break;
              }
            }

            if (result['errmsg'] == '') {
              var eip = form.endIP.trim().split('.');

              if (eip.length == 4) {
                for (i = 0; i < eip.length; i++) {
                  if (!eip[i]) {
                    result['errmsg'] = '마지막 IP가 올바르지 않습니다.';
                    break;
                  } else if (
                    (i == 0 && eip[i] != '' && parseInt(eip[i], 10) <= 0) ||
                    parseInt(eip[i], 10) > 255
                  ) {
                    result['errmsg'] = '마지막 IP가 올바르지 않습니다.';
                    break;
                  } else if (
                    (i > 0 && eip[i] != '' && parseInt(eip[i], 10) < 0) ||
                    parseInt(eip[i], 10) > 255
                  ) {
                    result['errmsg'] = '마지막 IP가 올바르지 않습니다.';
                    break;
                  }
                }

                if (result['errmsg'] == '') {
                  for (i = 0; i < sip.length; i++) {
                    if (parseInt(sip[i], 10) > parseInt(eip[i], 10)) {
                      result['errmsg'] = 'IP 대역이 올바르지 않습니다.';
                      break;
                    }
                  }
                }
              } else {
                result['errmsg'] = '마지막 IP가 올바르지 않습니다.';
              }
            }
          } else {
            result['errmsg'] = 'IP가 올바르지 않습니다.';
          }
        }
        if (result['errmsg'] == '') {
          result['success'] = true;
        }
        return result;
      }

      var formIP = me
        .lookupReference('bandIP')
        .getForm()
        .getValues();
      var checkIP = checkBandIP(formIP);

      if (checkIP.success) {
        tempStore = ipStore.getRange(0, ipStore.getCount());

        flag = 0;
        for (i = 0, l = ipStore.getCount(); i < l; i++) {
          if (formIP.startIP + ' ~ ' + formIP.endIP == tempStore[i].get('ip')) {
            flag = 1;
            break;
          }
        }

        if (flag == 0) {
          ipStore.insert(ipStore.getCount(), {
            ip: formIP.startIP + ' ~ ' + formIP.endIP,
            ctime: ''
          });
        }
        me.lookupReference('bandIP')
          .getForm()
          .reset();
      } else {
        Ext.Msg.alert('알림', checkIP.errmsg);
      }
    }
  },

  onDelete: function() {
    var me = this,
      ipGrid = me.lookupReference('ipGrid'),
      ipStore = ipGrid.getStore();

    var records = ipGrid.getSelectionModel().getSelection();
    for (var i = 0; i < records.length; ++i) {
      ipStore.remove(records[i]);
      me.lookupReference('recentIP').setValue('');
    }
  },

  onSave: function() {
    var me = this,
      ipGrid = me.lookupReference('ipGrid'),
      ipStore = ipGrid.getStore();

    var ipList = [];
    for (var i = 0, l = ipStore.getCount(); i < l; i += 1) {
      ipList.push(ipStore.getAt(i).get('ip'));
    }

    me.fireEvent('save', ipList);
    me.close();
  },

  onCancel: function() {
    this.close();
  }
});
