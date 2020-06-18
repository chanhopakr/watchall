/**
 * Created by zen on 18. 4. 13.
 */
Ext.define('apps.ux.list.Tree', {
  extend: 'Ext.list.Tree',
  xtype: 'zen-treelist',
  element: {
    reference: 'element',
    cls: Ext.baseCSSPrefix + 'treelist ' + Ext.baseCSSPrefix + 'unselectable',
    listeners: {
      click: 'onClick',
      touchstart: 'onTouchStart',
      touchend: 'onTouchEnd',
      mouseenter: 'onMouseEnter',
      mouseleave: 'onMouseLeave',
      mouseover: 'onMouseOver'
    },
    children: [
      {
        reference: 'toolsElement',
        cls: Ext.baseCSSPrefix + 'treelist-toolstrip',
        listeners: {
          click: 'onToolStripClick',
          mouseover: 'onToolStripMouseOver'
        }
      },
      {
        reference: 'expander',
        cls: 'sidebar-minify-btn',
        html: Ext.String.format(
          '<i class="fa {0}"></i>',
          Ext.util.Cookies.get('navigation_micro')
            ? 'fa-angle-double-right'
            : 'fa-angle-double-left'
        ),
        listeners: {
          click: 'onExpanderClick'
        }
      }
    ]
  },

  onExpanderClick: function() {
    var collapsing = this.getMicro();
    var icon = $(this.element.dom).find('i');
    collapsing
      ? icon.attr('class', 'fa fa-angle-double-left')
      : icon.attr('class', 'fa fa-angle-double-right');
    this.fireEvent('expanderClick', !collapsing);
    if (!collapsing) {
      Ext.util.Cookies.set('navigation_micro', true);
    } else {
      Ext.util.Cookies.clear('navigation_micro');
    }
  }
});
