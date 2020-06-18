/**
 * Created by zen on 17. 3. 23.
 */
Ext.define('apps.ux.form.ZqlForm', {
  extend: 'Ext.form.Panel',
  requires: ['apps.ux.ZqlBuilder'],
  xtype: 'zqlform',
  initComponent: function() {
    Ext.merge(this, {
      fieldDefaults: {
        getSubmitValue: function() {
          if (
            this.exclude ||
            _.contains(['startdate', 'enddate', 'tag'], this.name)
          ) {
            return this.getValue();
          }
          return {
            type: this.search_type || 'equal',
            value_type: this.value_type || 'string',
            value: this.getValue()
          };
        }
      }
    });
    this.callParent(arguments);
  },

  getZqlBuilder: function() {
    var formData = this.getValues();
    var where = [];
    for (var key in formData) {
      var o = formData[key];
      if (_.isArray(o.value) ? o.value.length > 0 : o.value) {
        if (o.type == 'equal') {
          where.push({
            column: key,
            value: o.value,
            type: o.value_type
          });
        } else if (o.type == 'like') {
          where.push({
            column: key,
            value: o.value,
            condition: 'like',
            type: 'string'
          });
        } else if (o.type == 'iplist') {
          if (!_.isArray(o.value)) {
            o.value = [o.value];
          }
          where.push({
            column: key,
            value: o.value,
            condition: 'iplist',
            type: 'string'
          });
        }
      }
    }
    var zqlBuilder = new apps.ux.ZqlBuilder();
    if (formData.tag) {
      zqlBuilder.tag(formData.tag);
    }
    if (formData.startdate) {
      zqlBuilder.startdate(formData.startdate);
    }
    if (formData.enddate) {
      zqlBuilder.enddate(formData.enddate);
    }
    zqlBuilder.where(where);
    return zqlBuilder;
  }
});
