Ext.define('apps.grid.column.Counter', {
  extend: 'Ext.grid.column.Number',
  alias: ['widget.countercolumn'],

  colors: {
    default: null,
    min: null,
    max: null
  },

  maxValue: null,
  minValue: 0,
  metaDataAttr: {
    align: 'right'
  },

  defaultRenderer: function(value, metaData) {
    Ext.apply(metaData, this.metaDataAttr);

    if (this.minValue >= value) {
      metaData.tdStyle += 'color:' + this.colors.min;
    } else if (this.maxValue && this.maxValue <= value) {
      metaData.tdStyle += 'color:' + this.colors.max;
    } else {
      metaData.tdStyle += 'color:' + this.colors.default;
    }

    return Ext.util.Format.number(value, this.format);
  }
});
