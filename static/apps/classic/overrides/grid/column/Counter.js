Ext.define('apps.overrides.grid.column.Counter', {
  override: 'apps.grid.column.Counter',
  colors: {
    default: '#0064ff',
    min: '#a2a2a2'
  },
  format: '0,000',
  minWidth: 100
});
