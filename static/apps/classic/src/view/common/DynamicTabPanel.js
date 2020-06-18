Ext.define('apps.view.common.DynamicTabPanel', {
  extend: 'Ext.tab.Panel',

  requires: ['Ext.layout.container.boxOverflow.Scroller'],

  tabStretchMax: false,

  ui: 'main_tab',

  plain: true,

  tabBar: {
    maxWidth: 700,
    layout: {
      overflowHandler: {
        type: 'scroller',
        scrollIncrement: 100,
        wheelIncrement: 50
      }
    }
  },

  defaults: {
    style:
      'background-color: #fff; box-shadow: 3px 3px 5px 0px #404345; margin: 0px 5px 5px 0px; padding: 10px;'
  },

  initComponent: function() {
    const { childNodes } = this;

    if (childNodes) {
      const items = [];
      childNodes.forEach(node => {
        const xtype = node.get('viewType');
        const isAlias = Ext.ClassManager.getNameByAlias(`widget.${xtype}`);

        if (isAlias) {
          items.push({
            xtype,
            itemId: xtype,
            iconCls: node.get('iconCls'),
            title: node.get('text'),
            tabConfig: node.get('tabConfig') || null
          });
        }
      });

      Ext.apply(this, {
        items: (this.items || []).concat(items)
      });
    }
    this.callParent();
  },

  listeners: {
    // - 210: headerBar width in Main.js
    resize: (comp, width) => {
      return comp.getTabBar().setMaxWidth(width - 210);
    }
  }
});
