Ext.define('apps.view.common.GoogleMapPanel', {
  extend: 'Ext.ux.GMapPanel',

  /*
    createMap: function(center, marker) {
        var me = this;
        var options = Ext.apply({}, this.mapOptions);

        options = Ext.applyIf(options, {
            zoom: 2,
            center: center,
            mapTypeId: google.maps.MapTypeId.ROADMAP//,
            //streetViewControl: false

            //center: new google.maps.LatLng(47.60, -122.32),
            //zoom: 2,
            //mapTypeId: google.maps.MapTypeId.ROADMAP

        });
        this.gmap = new google.maps.Map(this.body.dom, options);
        window.gmap = this.gmap;

        //for (var i = 0, l = me.markers.length; i < l; i++) {
        //    var m = me.markers[i];
        //    if (m.lat == null || m.lng == null)
        //        continue;
        //    new SeverityOverlay(this.gmap, m.lat, m.lng, m.level, m.text);
        //}
        this.fireEvent('mapready', this, this.gmap);
    },
    */

  getZoom: function() {
    return this.gmap.getZoom();
  },

  setZoom: function(zoom) {
    this.gmap.setZoom(zoom);
  },

  getCenter: function() {
    this.gmap.getCenter();
  },

  setCenter: function() {},

  getMapTypeId: function() {
    this.gmap.getMapTypeId();
  },

  setMapTypeId: function(typeId) {
    //google.maps.MapTypeId.HYBRID
    //google.maps.MapTypeId.ROADMAP
    //google.maps.MapTypeId.SATELLITE
    //google.maps.MapTypeId.TERRAIN
    this.gmap.setMapTypeId(typeId); // roadmap, satellite, hybrid, terrain
  }
});
