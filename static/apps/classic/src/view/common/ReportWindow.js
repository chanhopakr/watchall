/**
 * Created by jjol on 17. 3. 10.
 */

Ext.define('apps.view.common.ReportWindow', {
  extend: 'Ext.window.Window',

  requires: ['Ext.button.Button'],

  uses: ['Ext.util.Cookies'],

  referenceHolder: true,
  defaultListenerScope: true,

  height: 800,
  scrollable: true,
  // resizable: true,
  // closable: false,
  tools: [
    {
      xtype: 'button',
      reference: 'download',
      // disabled: true,
      border: false,
      iconCls: 'x-fa fa-download',
      handler: 'download'
    }
  ],
  listeners: { boxready: 'onBoxready' },
  onBoxready: function() {
    var me = this;
    me.setLoading(false);
    Ext.Array.each(this.query('dashboard-part'), function(item) {
      item.onRefresh();
    });
  },
  setLoading: function(value) {
    var me = this,
      bt = me.lookupReference('download');
    bt.setIconCls(
      { true: 'x-fa fa-spinner fa-pulse', false: 'x-fa fa-download' }[value]
    );
    bt.setDisabled(value);
  },

  download: function() {
    var me = this;
    var promise_list = _.map(this.query('dashboard-part'), function(item) {
      var deferred = new Ext.Deferred();
      var size = item.getSize();
      var dom = $(item.getEl().dom)
        .find('[data-ref=body]')
        .css({ top: 0, margin: 0 })
        .get(0);
      domtoimage.toPng(dom).then(function(dataUrl) {
        deferred.resolve({
          image: dataUrl,
          title: item.getTitle(),
          width: size.width,
          height: size.height
        });
      });
      return deferred.promise;
    });
    Ext.Promise.all(promise_list).then(function(data) {
      var $form = jQuery('<form>')
        .attr('method', 'post')
        .attr('action', '/portal/download_report');
      jQuery("<input type='hidden'>")
        .attr('name', 'data')
        .attr('value', Ext.encode(data))
        .appendTo($form);
      jQuery("<input type='hidden'>")
        .attr('name', 'csrfmiddlewaretoken')
        .attr('value', Ext.util.Cookies.get('csrftoken'))
        .appendTo($form);
      $form.appendTo('body');
      $form.submit();
      // me.setLoading(false);
      me.fireEvent('done');
      me.close();
    });
  }
});
