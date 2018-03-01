var concaveman = require("concaveman");

function GHHelper(host){
  this.host = host; //localhost
}

module.exports = GHHelper;

GHHelper.prototype = {
  getPoints: function(lat, lng, vehicle, buckets, timeLimit){
    var result = "pointlist";
    var url = "http://" + this.host + "/isochrone?"
            + "point=" + lat + "%2C" + lng
            + "&time_limit=" + timeLimit
            + "&vehicle=" + vehicle
            + "&buckets=" + buckets
            + "&result=" + result;

    var xhttp = new XMLHttpRequest();
        xhttp.open("GET", url, false);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send();

    var polygons = JSON.parse(xhttp.responseText)["polygons"];
    var hull = [[]];

    //flip lat & lng
    for(var i = 0; i < polygons.length - 1; i++){
      var points = polygons[i];
      for(var j = 0; j < points.length; j++){
        var _points = points[j];
        points[j] = [_points[1], _points[0]];
      }
      hull[i] = concaveman(points, 1, 0.003);
    }

    return hull;
  },

  getLatLng: function(city){
    var url = "http://" + this.host + "/geocoder?q=" + city;
    var xhttp = new XMLHttpRequest();
        xhttp.open("GET", url, false);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send();
    var point = JSON.parse(xhttp.responseText)["hits"][0].point;
    return [point.lat, point.lng];
  }
};
