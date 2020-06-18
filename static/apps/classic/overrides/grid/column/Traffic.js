Ext.define('apps.overrides.grid.column.Traffic', {
  override: 'apps.grid.column.Traffic',
  colors: {
    default: '#0064ff',
    min: '#a2a2a2',
    // byte: '#3e3e3e',
    byte: '#49b6d6',
    kb: '#04724d',
    mb: '#ff5f00',
    gb: '#ff0000',
    tb: '#ff00ff'
  },
  format: '0,000',
  minWidth: 0,
  metaDataAttr: {
    align: 'right'
  }
});
