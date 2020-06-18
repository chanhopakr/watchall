Ext.define("apps.view.home.Home", {
  extend: "Ext.container.Container",

  requires: [
    "Ext.layout.container.VBox",
    "apps.view.home.HomeController",
    "apps.view.home.HomeModel"
  ],

  xtype: "home",

  viewModel: {
    type: "home"
  },

  controller: "home",

  layout: {
    type: "vbox",
    align: "stretch"
  },

  defaults: {
    border: true,
    margin: "10 0 0 0"
  },

  items: []
});
