var map = L.map('map').setView([52.517161014258136, 13.388729095458986], 13);
var concaveman = require('concaveman');

var shapes = [];
var polygons = [];
var maxTimeLimitInSeconds = 24 * 60;
var steps = 5;
var slider = document.getElementById("timelimit");
var vehicles = document.getElementById("vehicles");
var vehicle = "foot";

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/dark-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    id: 'mapbox.streets'
}).addTo(map);

map.on('click', onMapClick);
slider.onchange = function(){
  document.getElementById("status").innerHTML = slider.value + " MIN";
  document.getElementById("max").innerHTML = slider.value;
  document.getElementById("min").innerHTML = "<" + (slider.value / steps).toFixed(0);
}
document.getElementsByClassName("outer")[0].onclick = function(e){
  e.stopImmediatePropagation();
}

$("span").click(function(e){
  var children = $("span").children();
  var id = $(this).children()[0].id;
  for(var i = 0; i < children.length; i++){
    var child = children[i];
    if(child.id == id) {
      vehicle = id;
      child.style.color = "white";
    }else{
      child.style.color =  "#696969";
    }
  }
});

function onMapClick(e){
  maxTimeLimitInSeconds = document.getElementById("timelimit").value * 60;
  for(var i = 0; i < shapes.length; i++){
    map.removeLayer(shapes[i]);
  }
  updatePolygons(e);
}

function updatePolygons(e){
  var start = Date.now();
  for(var i = 1; i <= steps; i++){
    polygons[i] = apiCall(e.latlng.lat, e.latlng.lng, maxTimeLimitInSeconds / steps * i);
  }
  var delta = Date.now() - start;
  start = Date.now();
  drawIsochrones();
  var deltadraw = Date.now() - start;
  console.log("Hull: " + delta + "ms Draw: " + deltadraw + "ms");
}

function drawIsochrones(){
  for(var i = steps; i > 0; i--){
    shapes.push(L.polygon([polygons[i], polygons[i - 1] === undefined ? [] : polygons[i - 1]], {
      fill: true,
      color: hslToHex(260 / steps * (i - 1), 80, 60),
      fillColor: hslToHex(260 / steps * (i - 1), 80, 60),
      opacity: 1,
      weight: 4
    }).addTo(map));
  }
}

function apiCall(lat, lng, timeLimitInSeconds){
  var buckets = 1;
  //var timeLimitInSeconds = 60*6;
  var result = "pointlist";
  var url = "http://localhost:8989/isochrone?"
          + "point=" + lat + "%2C" + lng
          + "&time_limit=" + timeLimitInSeconds
          + "&vehicle=" + vehicle
          + "&buckets=" + buckets
          + "&result=" + result;

  var xhttp = new XMLHttpRequest();
      xhttp.open("GET", url, false);
      xhttp.setRequestHeader("Content-type", "application/json");
      xhttp.send();

  var points = JSON.parse(xhttp.responseText)["polygons"][0];

  //flip lat & lng
  for(var i = 0; i < points.length; i++){
    var _points = points[i];
    points[i] = [_points[1], _points[0]];
  }

  return concaveman(points, 2.5, 0);
}

function hslToHex(h, s, l) {
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
