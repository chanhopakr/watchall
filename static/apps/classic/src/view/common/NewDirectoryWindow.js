/**
 * Created by go on 16. 3. 4.
 */
Ext.define('apps.view.common.NewDirectoryWindow', {
  extend: 'Ext.window.Window',

  requires: [
    'Ext.button.Button',
    'Ext.form.field.Text',
    'Ext.layout.container.VBox'
  ],

  iconCls: 'x-fa fa-folder-open-o',
  title: '새 디렉토리',
  width: 500,
  bodyPadding: 5,
  layout: { type: 'vbox', align: 'stretch' },
  referenceHolder: true,
  defaultListenerScope: true,

  items: [
    { xtype: 'textfield', fieldLabel: '디렉토리명', reference: 'directory' }
  ],

  buttons: [
    { xtype: 'button', text: '저장', handler: 'onSave' },
    { xtype: 'button', text: '취소', handler: 'onCancel' }
  ],

  onSave: function() {
    var me = this,
      directory = me.lookupReference('directory'),
      dir = directory.getValue();

    if (!dir) {
      Ext.Msg.alert('오류', '디렉토리명을 입력해주세요.');
      directory.focus();
      return;
    }

    me.fireEvent('save', dir);
    me.close();
  },

  onCancel: function() {
    this.close();
  }
});
