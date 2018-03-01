var _this;

function GUI(map, ghHelper){
  this.map = map;
  this.GHHelper = ghHelper;

  this.buckets = 5; //Number of Isochrone Parts
  this.maxTimeLimitInSeconds = 24 * 60; //Max Time Limit for GH isochrones

  this.slider = document.getElementById("timelimit"); //Slider Control
  this.vehicles = document.getElementById("vehicles"); //Vehicles Div
  this.vehicle = "foot"; //Current vehicle
  this.input = document.getElementsByClassName("search")[0]; //Search Bar (Geocoder)
  this.menubar = document.getElementsByClassName("menubar")[0];

  this.status = document.getElementById("status"); //Menu Bar Status
  this.max = document.getElementById("max"); //Legend max
  this.min = document.getElementById("min"); //Legend min

  this.shapes = [];
  this.polygons = [];

  this.init();
}

module.exports = GUI;

GUI.prototype = {
  init: function(){
    L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 18,
        id: 'mapbox.streets'
    }).addTo(this.map);

    this.setUpHandlers();
  },

  setUpHandlers: function(){
    _this = this;
    this.map.on('click', this.onMapClick);
    this.slider.addEventListener('change', this.onSliderChange);
    this.input.addEventListener('keydown', this.onInputKeyDown);
    this.menubar.addEventListener('click', function(e){
      e.stopPropagation();
    });

    $("span").click(this.toggleVehicle);
  },

  toggleVehicle: function(e){
    var children = $("span").children();
    var id = $(this).children()[0].id;
    for(var i = 0; i < children.length; i++){
      var child = children[i];
      if(child.id == id) {
        _this.vehicle = id;
        child.style.color = "white";
      }else{
        child.style.color =  "#696969";
      }
    }
  },

  onInputKeyDown: function(e){
    /*if (e.keyCode == 13) {
      getLatLng(input.value);
    }*/
  },

  onSliderChange: function(){
    _this.status.innerHTML = _this.slider.value + " MIN";
    _this.max.innerHTML = _this.slider.value;
    _this.min.innerHTML = "<" + (_this.slider.value / _this.buckets).toFixed(0);
    _this.maxTimeLimitInSeconds = _this.slider.value * 60;
  },

  onMapClick: function(e){
    for(var i = 0; i < _this.shapes.length; i++){
      _this.map.removeLayer(_this.shapes[i]);
    }
    _this.updatePolygons(e);
  },

  updatePolygons: function(e){
    var start = Date.now();
    _this.polygons = _this.GHHelper.getPoints(e.latlng.lat, e.latlng.lng, _this.vehicle, _this.buckets, _this.maxTimeLimitInSeconds);
    var delta = Date.now() - start;
    start = Date.now();
    _this.drawIsochrones();
    var deltadraw = Date.now() - start;
    console.log("Hull: " + delta + "ms Add: " + deltadraw + "ms");
  },

  drawIsochrones: function(){
    for(var i = _this.polygons.length - 1; i >= 0; i--){
      _this.shapes.push(L.polygon([_this.polygons[i], _this.polygons[i - 1] === undefined ? [] : _this.polygons[i - 1]], {
        fill: true,
        color: _this.hslToHex(260 / _this.buckets * (i - 1), 80, 60),
        fillColor: _this.hslToHex(260 / _this.buckets * (i - 1), 80, 60),
        opacity: 1,
        weight: 4
      }).addTo(_this.map));
    }
  },

  hslToHex: function(h, s, l){
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;
    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
      };
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }
    const toHex = x => {
      const hex = Math.round(x * 255).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }
};
