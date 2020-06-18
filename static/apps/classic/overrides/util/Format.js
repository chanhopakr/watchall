Ext.define('apps.overrides.util.Format', {
  override: 'Ext.util.Format',

  traffic: (function() {
    var byteLimit = 1000,
      kbLimit = 1000000,
      mbLimit = 1000000000,
      gbLimit = 1000000000000;

    return function(size, digits = 1, unit = 'bps') {
      var out;
      if (size < byteLimit) {
        if (size === 1) {
          out = `1 ${unit}`;
        } else {
          out =
            Math.round((size * Math.pow(10, digits)) / Math.pow(10, digits)) +
            ` ${unit}`;
        }
      } else if (size < kbLimit) {
        out =
          Math.round((size * Math.pow(10, digits)) / byteLimit) /
            Math.pow(10, digits) +
          ' K' +
          unit;
      } else if (size < mbLimit) {
        out =
          Math.round((size * Math.pow(10, digits)) / kbLimit) /
            Math.pow(10, digits) +
          ' M' +
          unit;
      } else if (size < gbLimit) {
        out =
          Math.round((size * Math.pow(10, digits)) / mbLimit) /
            Math.pow(10, digits) +
          ' G' +
          unit;
      } else {
        out =
          Math.round((size * Math.pow(10, digits)) / gbLimit) /
            Math.pow(10, digits) +
          ' T' +
          unit;
      }
      return out;
    };
  })()
});
