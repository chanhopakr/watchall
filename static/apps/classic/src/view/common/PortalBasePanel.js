/**
 * Created by jjol on 16. 11. 14.
 */

Ext.define('apps.view.common.PortalBasePanel', {
  extend: 'Ext.panel.Panel',

  requires: ['Ext.tip.ToolTip'],

  referenceHolder: true,
  defaultListenerScope: true,

  // ui: 'portalPanel',

  // resizable: true,
  // draggable: true,
  // liveDrag: true,
  // simpleDrag: true,
  z: 0,
  initComponent: function() {
    var me = this;

    me.tooltip = new Ext.ToolTip({
      width: 200,
      height: 70,
      autoScroll: true,
      autoHide: true,
      dismissDelay: 2000
    });

    me.callParent();
  },
  listeners: {
    resize: 'onResize',
    afterrender: function(cp) {
      var el = cp.getEl();
      el.on('mouseup', function() {
        var xy = cp.getLocalXY();

        // cp.setPosition(cp.getCalibrate(xy[0]), cp.getCalibrate(xy[1]));
        cp.showTooltip();
      });
      el.on('mousedown', function() {
        cp.fireEvent('onTop', cp);
      });
    }
  },

  onResize: function(width, height) {
    var me = this;

    // me.setSize(me.getCalibrate(width), me.getCalibrate(height));
    me.showTooltip();
  },
  getCalibrate: function(value) {
    if (value < 0) {
      return 0;
    }
    return Math.round(value / 20) * 20;
  },
  showTooltip: function() {
    // var me = this,
    //     xy = me.getLocalXY(),
    //     x = me.getCalibrate(xy[0]),
    //     y = me.getCalibrate(xy[1]),
    //     size = me.getSize(),
    //     width = me.getCalibrate(size.width),
    //     height = me.getCalibrate(size.height);
    //
    // me.tooltip.setHtml(
    //     Ext.String.format(
    //         '<b>{0}</b><br>{1}x{2}<br>x: {3}, y: {4}',
    //         me.getTitle(), width, height, x, y
    //     )
    // );
    // me.tooltip.showAt(0, 0);
  }
});
