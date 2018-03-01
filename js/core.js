var host = "localhost:8989";

var map = L.map('map').setView([52.517161014258136, 13.388729095458986], 13);

var GHHelper = require("./utils/GHHelper");
var ghHelper = new GHHelper(host);

var GUI = require("./utils/GUI");
var gui = new GUI(map, ghHelper);
