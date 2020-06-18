Ext.define('apps.Application', {
  extend: 'Ext.app.Application',

  name: 'apps',

  requires: ['Ext.state.CookieProvider', 'Ext.state.Manager'],

  stores: ['NavigationTree'],

  defaultToken: 'dashboard',

  // The name of the initial view to create. This class will gain a "viewport" plugin
  // if it does not extend Ext.Viewport.
  //
  mainView: 'apps.view.main.Main',

  init: function() {
    // Extjs Xtemplate이 한글 처리를 하지 못하는 문제가 있음
    // underscore template 구분자를 Xtemplate과 같도록 맞춤
    _.templateSettings = {
      interpolate: /\{(.+?)\}/g
    };

    Ext.state.Manager.setProvider(Ext.create('Ext.state.CookieProvider'));
  },

  onAppUpdate: function() {
    Ext.Msg.confirm(
      'Application Update',
      'This application has an update, reload?',
      function(choice) {
        if (choice === 'yes') {
          window.location.reload();
        }
      }
    );
  },
  launch: function() {
    if (Number.prototype.hasOwnProperty('round') === false) {
      Number.prototype.round = function(digits, radix) {
        return (
          Math.round(this.valueOf() * Math.pow(radix || 10, digits)) /
          Math.pow(radix || 10, digits)
        );
      };
    }

    Ext.Ajax.on({
      requestexception: function(conn, response) {
        if (response.status === '0' && response.statusText === '') {
          location.href = '/';
        }

        if (response.status === 401) {
          Ext.Msg.alert('알림', response.responseText, function() {
            location.href = '/';
          });
        }
      }
    });
  }
});
