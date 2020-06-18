Ext.define('Ext.overrides.exporter.util.Format', {
  override: 'Ext.util.Format',
  decToHex: function(a, d) {
    var c = '',
      b;
    for (b = 0; b < d; b++) {
      c += String.fromCharCode(a & 255);
      a = a >>> 8;
    }
    return c;
  }
});
