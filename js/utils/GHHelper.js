var concaveman = require("concaveman");

function GHHelper(host){
  this.host = host; //localhost
}

module.exports = GHHelper;

GHHelper.prototype = {
  getPoints: function(lat, lng, vehicle, buckets, timeLimit, callback){
    var result = "pointlist";
    var url = "http://" + this.host + "/isochrone?"
            + "point=" + lat + "%2C" + lng
            + "&time_limit=" + timeLimit
            + "&vehicle=" + vehicle
            + "&buckets=" + buckets
            + "&result=" + result;

    var xhttp = new XMLHttpRequest();
        xhttp.open("GET", url, true);
        xhttp.responseType = 'arraybuffer';
        xhttp.callback = callback;
        xhttp.setRequestHeader("Content-type", "application/json");

    var _this = this;

    xhttp.onload = function(e) {
      var arrayBuffer = xhttp.response;
      var dataView = new DataView(arrayBuffer);

      var pointer = 0;
      var polygons = [];
      var num_buckets = dataView.getInt16(pointer);
      pointer += 2;

      for(var i = 0; i < num_buckets; i++){
        var items_in_bucket = dataView.getUint16(pointer);
        pointer += 2;

        var bucket = [];
        for(var j = 0; j < items_in_bucket; j++){
          var x = dataView.getUint32(pointer);
          pointer += 4;
          var y = dataView.getUint32(pointer);
          pointer += 4;
          bucket.push([(y / 1000000), (x / 1000000)]);
        }
        polygons.push(concaveman(bucket, 2, 0));
      }

      callback(polygons);
    }

    xhttp.send();
  },

  getLatLng: function(city){
    var url = "https://graphhopper.com/api/1//geocode?limit=6&type=json&key=2a24e316-61ea-4850-b231-4ef2fe25d229&locale=de-DE&q=" + city;
    var xhttp = new XMLHttpRequest();
        xhttp.open("GET", url, false);
        xhttp.setRequestHeader("Content-type", "application/json");
        xhttp.send();
    var point = JSON.parse(xhttp.responseText)["hits"][0].point;
    return [point.lat, point.lng];
  }
};
