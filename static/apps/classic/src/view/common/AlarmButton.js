/**
 * Created by jjol on 16. 5. 17.
 */

Ext.define('apps.view.common.AlarmButton', {
  extend: 'Ext.Button',
  requires: [],
  uses: [],

  xtype: 'alarmbutton',
  ui: 'portalButton',
  tooltip: '이벤트',
  bind: {
    text:
      '<span class="fa-stack fa-lg">' +
      '<i class="fa fa-bell fa-stack-1x"></i>' +
      '<i class="fa fa-circle fa-stack-1x" style="color: {alarmCountBackgroundColor}; line-height: 20px; margin: -2px 0px 0px -5px; text-align: right; vertical-align: top; font-size: 13px;"></i>' +
      '<i class="fa fa-stack-1x" style="color: {alarmCountFontColor}; line-height: 20px; margin: -2px 0px 0px -8px; text-align: right; vertical-align: top; font-size: 5px;"><b>{alarmCount}</b></i>' +
      '</span>'
  }
});
