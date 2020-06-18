/**
 * Created by zen on 17. 6. 20.
 */
Ext.define('apps.ux.window.TargetWindow', {
  extend: 'Ext.window.Window',
  y: 0,
  x: 0,
  style: 'opacity:0',
  constrain: false,
  constrainHeader: false,
  resizable: false,
  draggable: false,
  autoShow: true,
  cls: 'menu-window',
  layout: 'fit',
  modal: true,
  config: {
    target: '',
    formData: {}
  },
  defaultListenerScope: true,
  initComponent: function() {
    if (this.title) {
      Ext.apply(this, {
        header: {
          cls: 'small-header',
          title: this.title
        }
      });
    }
    this.callParent();
  },
  listeners: {
    show: function(menu) {
      var me = this;
      me.arrow = menu.body.createChild({
        role: 'presentation',
        cls: 'tip-arrow arrow'
      });
      if (this.border) {
        me.arrow.setStyle('top', '-38px');
      }
      var $target = me.getTarget();
      var offset = $target.offset();
      if (this.modal) {
        var $clone = $target.clone().css({ margin: 0 });
        this.$clone = $clone;
        $clone.addClass('text-clone').css({
          position: 'absolute',
          top: offset.top,
          left: offset.left,
          'z-index': 29000,
          width: $target.outerWidth() + 2
        });
        $('body').append($clone);
      }
      setTimeout(function() {
        me.updatePosition();
      }, 0);
    },
    close: function() {
      if (this.$clone) {
        this.$clone.remove();
      }
    }
  },
  updatePosition: function() {
    var me = this;
    me.setStyle({ opacity: 0 });
    var $target = me.getTarget();
    if ($target.length == 0) return;
    var offset = $target.offset();
    var target_width = $target.outerWidth();
    var win_width = me.getWidth();
    offset.left += (target_width - win_width) / 2;
    var height = this.$clone
      ? this.$clone.outerHeight()
      : $target.outerHeight();
    var tip_height = me.arrow.getHeight();
    if (offset.left < 0) {
      me.arrow.setStyle(
        'left',
        `${parseInt($target.offset().left) + parseInt(target_width / 2)}px`
      );
      me.showAt(0, offset.top + height + tip_height);
    } else if (offset.left + win_width > window.outerWidth) {
      let window_left = window.outerWidth - win_width - 5;
      let tip_left =
        parseInt($target.offset().left) +
        parseInt(target_width / 2) -
        window_left;
      me.arrow.setStyle('left', `${tip_left}px`);
      me.showAt(window_left, offset.top + height + tip_height);
    } else {
      me.arrow.setStyle('left', '50%');
      me.showAt(offset.left, offset.top + height + tip_height);
    }
    me.animate({
      duration: 200,
      from: {
        opacity: 0
      },
      to: {
        opacity: 1
      }
    });
  }
});
