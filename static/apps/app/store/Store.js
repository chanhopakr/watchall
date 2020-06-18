Ext.define('apps.store.Store', {
  extend: 'Ext.data.Store',

  requires: ['Ext.data.proxy.Ajax', 'Ext.data.reader.Json'],

  proxy: {
    type: 'ajax',
    reader: {
      type: 'json',
      rootProperty: data => {
        return data.items || data.data || data.children;
      }
    }
  },

  listeners: {
    beforeload: function(store, operation, eOpts) {
      const proxy = store.getProxy();
      const modelFields = store.model.getFields();
      let extraParams = {};

      if (modelFields) {
        extraParams.fields = [];
        modelFields.forEach(field => {
          if (field.persist) {
            extraParams.fields.push(field.name);
          }
        });
        extraParams.fields = JSON.stringify(extraParams.fields);
      }

      for (const key in extraParams) {
        proxy.setExtraParam(key, extraParams[key]);
      }
    }
  }
});
