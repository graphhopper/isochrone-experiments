/* global document, window */
import React, {Component} from 'react';
import {render} from 'react-dom';

import {StaticMap} from 'react-map-gl';
import DeckGL, {MapView, MapController, LineLayer, ScatterplotLayer, GeoJsonLayer} from 'deck.gl';
import {GraphHopper} from 'graphhopper-js-api-client';
import {setParameters} from 'luma.gl';

// Set your maptiler token here: https://www.maptiler.com/cloud/
const VT_TOKEN = process.env.Token; // eslint-disable-line

const LAT = 51.436327;
const LON = 14.248281;
const INITIAL_VIEW_STATE = {
  latitude: LAT,
  longitude: LON,
  zoom: 9,
  maxZoom: 16,
  pitch: 50,
  bearing: 0
};

function getColor(d) {
  // use time as color
   const r = d[2] / 60.0 / 70.0;
  // using distance as color does not make a big difference but time reflects a 'fastest' path tree best
//  const r = d[3] / 1000.0 / 60.0;

  return [255 * (1 - r), 128 * r, 255 * r, 255];
}

function getSize(type) {
  if (type.search('major') >= 0) {
    return 100;
  }
  if (type.search('small') >= 0) {
    return 30;
  }
  return 60;
}

const globalVar = {};
const isochroneNative = function(lng, lat, vehicle, timeLimit, callback){
    var url = "http://localhost:8989/isochrone?"
            + "point=" + lat + "%2C" + lng
            + "&time_limit=" + timeLimit
            + "&vehicle=" + vehicle
            + "&result=edgelist";

    var xhttp = new XMLHttpRequest();
        xhttp.open("GET", url, true);
        xhttp.responseType = 'arraybuffer';
        xhttp.callback = callback;
        xhttp.setRequestHeader("Content-type", "application/octet-stream");

    var _this = this;

    // TODO error handling if exception or http code 500

    xhttp.onload = function(e) {
      var arrayBuffer = xhttp.response;
      var dataView = new DataView(arrayBuffer);

      var pointer = 0;
      var entries = dataView.getInt32(pointer);
      var entrySize = dataView.getInt32(pointer + 4);
      pointer += 8;

      if(dataView.byteLength - pointer != entries * entrySize)
         console.log("expected byte size does not match "  + (dataView.byteLength + pointer) + " vs " + entries * entrySize);

      var coordinates = [];
      for(var i = 0; i < entries; i++) {

         var x1 = dataView.getFloat32(pointer);
         var y1 = dataView.getFloat32(pointer + 4);
         var x2 = dataView.getFloat32(pointer + 8);
         var y2 = dataView.getFloat32(pointer + 12);
         var time = dataView.getFloat32(pointer + 16);
         var distance = dataView.getFloat32(pointer + 20);
         coordinates.push([[x1,y1], [x2, y2], time, distance]);

         pointer += entrySize;
      }

      callback(coordinates);
    }

    xhttp.send();
}

isochroneNative(LON, LAT, "car", 3600, function (coordinates) {
    globalVar.callback(coordinates);
})

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {viewState: INITIAL_VIEW_STATE};
  }

  _initialize(gl) {
    setParameters(gl, {
      blendFunc: [gl.SRC_ALPHA, gl.ONE, gl.ONE_MINUS_DST_ALPHA, gl.ONE],
      blendEquation: gl.FUNC_ADD
    });
  }

  componentWillMount() {
    globalVar.callback = (data) => {
      // looks like a hack ;)
      this.isochroneData = data;
      this.forceUpdate();
    }
  }

  render() {
    const {
      strokeWidth = 5,

      onViewStateChange = (({viewState}) => this.setState({viewState})),
      viewState = this.state.viewState,

      // mapStyle = 'mapbox://styles/mapbox/dark-v9'
      // use MapTiler cloud instead
      mapStyle = 'https://free.tilehosting.com/styles/darkmatter/style.json?key=' + VT_TOKEN
    } = this.props;

    const layers = [
      new LineLayer({
        id: 'isochrone-data',
        data: this.isochroneData,
        strokeWidth,
        fp64: false,
        getSourcePosition: d => [d[0][0], d[0][1]],
        getTargetPosition: d => [d[1][0], d[1][1]],
        getColor,
        highlightColor: [255, 255, 0, 255],
        autoHighlight: true,
        pickable: true,
        // interesting for debugging:
        //onHover: info => console.log('Hovered:', info),
        //onClick: info => console.log('Clicked:', info)
      })
        /* display json, details: http://uber.github.io/deck.gl/#/documentation/deckgl-api-reference/layers/geojson-layer
       ,new GeoJsonLayer({
          id: 'geojson-layer',
          data: {
                "type": "FeatureCollection",
                "features": [{
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [13.387785, 52.515855]
                    },
                    "properties": {"title": "Test Location 1"}
                }, {
                    "type": "Feature",
                    "geometry": {
                        "type": "Point",
                        "coordinates": [14.219055, 51.427471]
                    },
                    "properties": {"title": "Test Location 2"}
                }]
          },
          pickable: true,
          extruded: true,
          pointRadiusMinPixels: 10,
          getFillColor: d => [255, 255, 0, 255],
          getColor: d => [255, 255, 0, 255]
        })
        */

        /* instead streets, print the junctions:
        ,new ScatterplotLayer({
            id: 'scatterplot-layer',
            data: this.isochroneData,
            pickable: true,
            opacity: 0.8,
            radiusScale: 3,
            radiusMinPixels: 1,
            radiusMaxPixels: 50,
            getPosition: d => [d[0][0], d[0][1]],
            getRadius: d => 1,
            getColor
        })*/
    ];

    return (
      <DeckGL layers={layers} views={new MapView({id: 'map'})} viewState={viewState} onViewStateChange={onViewStateChange}
        controller={MapController} onWebGLInitialized={this._initialize}>

        <StaticMap width={400} height={400} viewId="map" {...viewState} reuseMaps mapStyle={mapStyle} preventStyleDiffing={true}/>

      </DeckGL>
    );
  }
}

render(<App />, document.body.appendChild(document.createElement('div')));
