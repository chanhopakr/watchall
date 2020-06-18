Ext.define('apps.overrides.window.Window', {
  override: 'Ext.window.Window',

  constrainHeader: true,
  // constrain: true,
  modal: true,
  // resizable: false,
  draggable: true

  //referenceHolder: true,
  //defaultListenerScope: true,
});
