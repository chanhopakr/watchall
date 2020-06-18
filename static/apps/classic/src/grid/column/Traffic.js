Ext.define('apps.grid.column.Traffic', {
  extend: 'Ext.grid.column.Number',
  alias: ['widget.trafficcolumn'],

  unit: 'bps',

  colors: {
    default: null,
    byte: null,
    kb: null,
    mb: null,
    gb: null,
    tb: null,
    min: null,
    max: null
  },
  byteLimit: 1000,
  kbLimit: 1000000,
  mbLimit: 1000000000,
  gbLimit: 1000000000000,
  maxValue: null,
  minValue: 0,
  metaDataAttr: {},

  defaultRenderer: function(value, metaData, record) {
    Ext.apply(metaData, this.metaDataAttr);

    // if (this.minValue >= value) {
    //   metaData.tdStyle += `color: ${this.colors.min}`;
    // } else if (this.maxValue && this.maxValue <= value) {
    //   metaData.tdStyle += `color: ${this.colors.max}`;
    // } else if (this.byteLimit >= value) {
    //   metaData.tdStyle += `color: ${this.colors.byte}`;
    // } else if (this.kbLimit >= value) {
    //   metaData.tdStyle += `color: ${this.colors.kb}`;
    // } else if (this.mbLimit >= value) {
    //   metaData.tdStyle += `color: ${this.colors.mb}`;
    // } else if (this.gbLimit >= value) {
    //   metaData.tdStyle += `color: ${this.colors.gb}`;
    // } else if (this.gbLimit < value) {
    //   metaData.tdStyle += `color: ${this.colors.tb}`;
    // } else {
    //   metaData.tdStyle += `color: ${this.colors.default}`;
    // }

    return Ext.util.Format.traffic(value, 2, record.data.unit || this.unit);
  }
});
