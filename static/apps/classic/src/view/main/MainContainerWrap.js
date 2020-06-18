Ext.define('apps.view.main.MainContainerWrap', {
  extend: 'Ext.container.Container',
  xtype: 'maincontainerwrap',

  requires: ['Ext.layout.container.HBox'],

  layout: {
    type: 'hbox',
    align: 'stretch',

    // Tell the layout to animate the x/width of the child items.
    animate: true,
    animatePolicy: {
      x: true,
      width: true
    }
  }
});
