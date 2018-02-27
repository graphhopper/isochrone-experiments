var map = L.map('map').setView([52.517161014258136, 13.388729095458986], 13);

var polygons = [];
var maxTimeLimitInSeconds = 24 * 60;
var steps = 5;
var slider = document.getElementById("timelimit");
var vehicles = document.getElementById("vehicles");
var vehicle = "foot";

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    id: 'mapbox.streets'
}).addTo(map);

map.on('click', onMapClick);
slider.onchange = function(){
  document.getElementById("status").innerHTML = slider.value + "m";
}
document.getElementsByClassName("outer")[0].onclick = function(e){
  e.stopImmediatePropagation();
}

function toggle(id){
  var children = vehicles.children;
  for(var i = 0; i < children.length; i++){
    var child = children[i];
    if(child.id == id) {
      vehicle = id;
      child.style.color = "white";
    }else{
      child.style.color =  "#d3d3d3";
    }
  }
}

function onMapClick(e){
  maxTimeLimitInSeconds = document.getElementById("timelimit").value * 60;
  for(var i = 0; i < polygons.length; i++){
    map.removeLayer(polygons[i]);
  }
  for(var i = steps; i > 0; i--){
    polygons.push(L.polygon(apiCall(e.latlng.lat, e.latlng.lng, maxTimeLimitInSeconds / steps * i), {
      fillColor: hslToHex(220 / steps * (i - 1), 100, 50),
      fillOpacity: 0.5,
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

  return convexHull(points);
}

function convexHull(points) {
  points.sort(function (a, b) {
    return a[0] != b[0] ? a[0] - b[0] : a[1] - b[1];
  });

  var n = points.length;
  var hull = [];

  for (var i = 0; i < 2 * n; i++) {
    var j = i < n ? i : 2 * n - 1 - i;
    while (hull.length >= 2 && removeMiddle(hull[hull.length - 2], hull[hull.length - 1], points[j]))
      hull.pop();
    hull.push(points[j]);
  }

  hull.pop();
  return hull;
}

function removeMiddle(a, b, c) {
  var cross = (a[0] - b[0]) * (c[1] - b[1]) - (a[1] - b[1]) * (c[0] - b[0]);
  var dot = (a[0] - b[0]) * (c[0] - b[0]) + (a[1] - b[1]) * (c[1] - b[1]);
  return cross < 0 || cross == 0 && dot <= 0;
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
