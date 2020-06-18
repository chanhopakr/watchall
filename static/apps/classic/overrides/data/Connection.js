/**
 * Created by go on 15. 7. 14.
 */
Ext.define('Admin.overrides.data.Connection', {
  override: 'Ext.data.Connection',

  requires: ['Ext.util.Cookies'],

  timeout: 600000,

  request: function(options) {
    options = options || {};

    var me = this,
      requestOptions,
      request;

    // zenlog patch
    if (!(/^http:.*/.test(options.url) || /^https:.*/.test(options.url))) {
      if (typeof options.headers == 'undefined') {
        options.headers = { 'X-CSRFToken': Ext.util.Cookies.get('csrftoken') };
      } else {
        Ext.apply(options.headers, {
          'X-CSRFToken': Ext.util.Cookies.get('csrftoken')
        });
      }
    }
    // zenlog patch

    if (me.fireEvent('beforerequest', me, options) !== false) {
      requestOptions = me.setOptions(options, options.scope || Ext.global);

      request = me.createRequest(options, requestOptions);

      return request.start(requestOptions.data);
    }

    Ext.callback(options.callback, options.scope, [
      options,
      undefined,
      undefined
    ]);

    return Ext.Deferred.rejected([options, undefined, undefined]);
  }
});
