/**
 * Created by go on 15. 7. 15.
 */
Ext.define('Admin.overrides.data.request.Ajax', {
  override: 'Ext.data.request.Ajax',

  onComplete: function(xdrResult) {
    var me = this,
      owner = me.owner,
      options = me.options,
      xhr = me.xhr,
      failure = { success: false, isException: false },
      result,
      success,
      response;

    if (!xhr || me.destroyed) {
      return (me.result = failure);
    }

    try {
      result = Ext.data.request.Ajax.parseStatus(xhr.status);

      if (result.success) {
        // This is quite difficult to reproduce, however if we abort a request
        // just before it returns from the server, occasionally the status will be
        // returned correctly but the request is still yet to be complete.
        result.success = xhr.readyState === 4;
      }
    } catch (e) {
      // In some browsers we can't access the status if the readyState is not 4,
      // so the request has failed
      result = failure;
    }

    success = me.success = me.isXdr ? xdrResult : result.success;

    if (success) {
      response = me.createResponse(xhr);

      // zenlog patch
      if (!me.isValidSession(response)) {
        return;
      }
      // zenlog patch

      owner.fireEvent('requestcomplete', owner, response, options);
      Ext.callback(options.success, options.scope, [response, options]);
    } else {
      if (result.isException || me.aborted || me.timedout) {
        response = me.createException(xhr);
      } else {
        response = me.createResponse(xhr);
      }

      owner.fireEvent('requestexception', owner, response, options);
      Ext.callback(options.failure, options.scope, [response, options]);
    }

    me.result = response;

    Ext.callback(options.callback, options.scope, [options, success, response]);

    owner.onRequestComplete(me);

    // zenlog patch
    //me.callParent([xdrResult]);
    me.callSuper([xdrResult]);
    // zenlog patch

    return response;
  },

  isValidSession: function(response) {
    var obj = Ext.decode(response.responseText);
    if (obj.errcode) {
      if (obj.errcode === 'SESSION_EXPIRED') {
        // TODO
        Ext.Msg.alert('오류', '세션이 만료되었습니다.', function() {
          document.location.href = '/logout';
        });
        return false;
      }
    }
    return true;
  }
});
