Ext.define('apps.overrides.ux.TreePicker', {
  override: 'Ext.ux.TreePicker',

  setValue: function(value) {
    var me = this,
      record;

    me.value = value;

    if (me.store.loading) {
      // Called while the Store is loading. Ensure it is processed by the onLoad method.
      return me;
    }

    // try to find a record in the store that matches the value
    record = value ? me.store.getNodeById(value) : me.store.getRoot();

    if (value === undefined) {
      record = me.store.getRoot();

      if (record) {
        me.value = record.getId();
      }
    } else {
      record = me.store.getNodeById(value);
    }

    // set the raw value to the record's display field if a record was found
    me.setRawValue(record ? record.get(me.displayField) : '');

    if (me.getBind() && value) {
      me.publishState('value', value);
    }

    return me;
  }
});
