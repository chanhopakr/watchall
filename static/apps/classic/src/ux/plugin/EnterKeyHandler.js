/**
 * Created by go on 15. 7. 30.
 */
Ext.define('apps.ux.plugin.EnterKeyHandler', {
  extend: 'Ext.plugin.Abstract',
  alias: 'plugin.enterkeyhandler',

  handler: null,

  init: function(field) {
    var me = this;
    field.enableKeyEvents = true;
    field.on('keydown', function(field, e) {
      if (e.keyCode == 13 && me.handler) {
        Ext.callback(me.handler, field.scope, [field, e], 0, field);
      }
    });
  }
});
