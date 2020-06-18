Ext.define('apps.ux.plugin.HelpIcon', {
  extend: 'Ext.plugin.Abstract',
  alias: 'plugin.helpicon',

  config: {
    tag: 'div',
    style:
      'width: 24px; height: 16px; background: url(/static/img/icons/help.png) no-repeat;' +
      'display: table-cell; border: 8px solid transparent;',
    'data-qtip': null
  },

  init: function(comp) {
    this.setCmp(comp);

    if (!comp.rendered) {
      comp.on('afterrender', this.createIcon, this);
    } else {
      this.createIcon();
    }
  },

  createIcon: function() {
    var cmp = this.getCmp();
    var config = this.getConfig();

    var cmpDataQtip =
      cmp.getConfig('data-qtip') ||
      (cmp.getConfig('autoEl') && cmp.getConfig('autoEl')['data-qtip']) ||
      config['data-qtip'];

    if (cmpDataQtip && cmpDataQtip.length) {
      // Apply data-qtip (combobox -> this)
      this.setConfig('data-qtip', cmpDataQtip);

      /**
       * sample code
       * Ext.apply(config, {cls: cmp.inputCls + '-default'});  // Add icon style
       * var config = Ext.create('Ext.Component', {html: '?', autoEl: config}).getElConfig();
       */

      cmp.el.createChild(this.getConfig(), false);
    }
  }
});
