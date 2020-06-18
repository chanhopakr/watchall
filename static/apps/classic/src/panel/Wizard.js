Ext.define('apps.panel.Wizard', {
  extend: 'Ext.panel.Panel',

  requires: ['Ext.layout.container.Card'],

  alias: ['widget.panelwizard'],

  layout: 'card',

  config: {
    theme_pressed_color: '#5FA2DD'
  },

  tbar: {
    itemId: 'progress',
    layout: {
      pack: 'center'
    },
    defaults: {
      iconAlign: 'top',
      enableToggle: true,
      style: 'border: 0px; background-color: transparent; cursor: default;'
    },
    items: [],
    listeners: {}
  },

  items: [],

  bbar: {
    itemId: 'bbar',
    items: [
      { xtype: 'tbfill' },
      {
        xtype: 'button',
        text: '&laquo; 이전',
        itemId: 'prev',
        disabled: true,
        handler: null
      },
      {
        xtype: 'button',
        text: '다음 &raquo;',
        itemId: 'next',
        handler: null
      },
      {
        xtype: 'button',
        text: '저장',
        itemId: 'submit',
        hidden: true,
        handler: null
      }
    ]
  },

  initComponent: function() {
    const me = this;
    const tbar = me.tbar;

    me.items.forEach(item => {
      tbar.items.push({
        itemId: item.itemId,
        text: item.title || item.text || item.label,
        iconCls: item.iconCls || item.icon
      });

      item.header = false;
    });

    if (tbar.items.length) {
      tbar.listeners.scope = me;
      tbar.listeners.boxready = me.onBoxreadyTbar;
    }

    if (me.bbar.items.length) {
      me.bbar.items.forEach(item => {
        if (item.xtype === 'button' && item.itemId) {
          const eventName = `on${item.itemId.capitalize()}`;

          Object.assign(item, { scope: me, handler: me[eventName] });
        }
      });
    }

    me.callParent();
  },

  listeners: {
    activate: function() {}
  },

  /**
   * onBoxreadyTbar
   * 최초 tbar.progress.items 중 첫번째 item 선택하기
   * @param comp
   * @protected
   */
  onBoxreadyTbar: function(comp) {
    const btn = comp.items.items[0];
    const theme_pressed_color = this.getConfig('theme_pressed_color');

    btn.btnIconEl.setStyle('color', theme_pressed_color);
    btn.btnInnerEl.setStyle('color', theme_pressed_color);
  },

  /**
   * onPrev
   * @param comp {Ext.button.Button}
   * @protected
   */
  onPrev: function(comp) {
    const card = this.getLayout().prev();
    this.doCardNavigation(card);
  },

  /**
   * onNext
   * @param comp {Ext.button.Button}
   * @protected
   */
  onNext: function(comp) {
    const card = this.getLayout().next();
    this.doCardNavigation(card);
  },

  /**
   *doCardNavigation
   * @param comp
   * @param incr
   * @protected
   */
  doCardNavigation: function(card) {
    const layout = this.getLayout();
    const activeItemId = card.getItemId();
    const theme_pressed_color = this.getConfig('theme_pressed_color');
    const bbar = this.getDockedComponent('bbar');

    this.getDockedComponent('progress')
      .getRefItems()
      .forEach(item => {
        const isActive = item.getItemId() === activeItemId;
        const color = isActive ? theme_pressed_color : null;

        item.setPressed(isActive);
        item.btnIconEl.setStyle('color', color);
        item.btnInnerEl.setStyle('color', color);
      });

    if (!layout.getNext()) {
      bbar.getComponent('prev').setDisabled(false);
      bbar.getComponent('next').setHidden(true);
      bbar.getComponent('submit').setHidden(false);
    } else if (!layout.getPrev()) {
      bbar.getComponent('prev').setDisabled(true);
      bbar.getComponent('next').setHidden(false);
      bbar.getComponent('submit').setHidden(true);
    } else {
      bbar.getComponent('prev').setDisabled(false);
      bbar.getComponent('next').setDisabled(false);
      bbar.getComponent('submit').setHidden(true);
    }
  },

  setActiveItem: function(newCard) {
    const card = this.getLayout().setActiveItem(newCard);
    this.doCardNavigation(card);
  },

  /**
   * onSubmit
   * 저장하기
   */
  onSubmit: function() {
    this.fireEvent('onSubmit');
  }
});
