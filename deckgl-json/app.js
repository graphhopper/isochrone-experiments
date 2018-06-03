/* global document, window */
import React, {Component} from 'react';
import {render} from 'react-dom';

import {StaticMap} from 'react-map-gl';
import DeckGL, {MapView, MapController, LineLayer, ScatterplotLayer} from 'deck.gl';
import {GraphHopper} from 'graphhopper-js-api-client';
import {setParameters} from 'luma.gl';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  latitude: 52.472743,
  longitude: 13.397827,
  zoom: 11,
  maxZoom: 16,
  pitch: 50,
  bearing: 0
};

function getColor(d) {
  const r = d[4] / 60.0 / 60000.0;

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

// TODO the GH client does not allow to specify result: "edgelist-json", currently must be the default
const globalVar = {};
const ghIsochrone = new GraphHopperIsochrone({key: "not-needed", host: "http://localhost:8989", vehicle: "car"});
ghIsochrone.doRequest({point: "52.472743,13.397827", "time_limit": 3600})
    .then(function (json) {
    // [{start:[11.568604,49.943267],end: [10.88685,49.892616]}]

    globalVar.callback(json.polygons);
    return true;
}).catch((error) => {
    console.log("Api call error");
    alert(error.message);
});

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
    console.log("render")
    const {
      strokeWidth = 5,

      onViewStateChange = (({viewState}) => this.setState({viewState})),
      viewState = this.state.viewState,

      mapboxApiAccessToken = MAPBOX_TOKEN,
      mapStyle = "mapbox://styles/mapbox/dark-v9"
    } = this.props;

    const layers = [
      new LineLayer({
        id: 'flight-paths',
        data: this.isochroneData,//[{start:[11.568604,49.943267],end: [11.087952,49.450272]}],
        strokeWidth,
        fp64: false,
        getSourcePosition: d => [d[0], d[1]],
        getTargetPosition: d => [d[2], d[3]],
        getColor,
//        pickable: Boolean(this.props.onHover),
//        onHover: this.props.onHover
      })
    ];

    return (
      <DeckGL
        layers={layers}
        views={new MapView({id: 'map'})}
        viewState={viewState}
        onViewStateChange={onViewStateChange}
        controller={MapController}
        onWebGLInitialized={this._initialize}
      >

        <StaticMap
          viewId="map"
          {...viewState}
          reuseMaps

          mapStyle={mapStyle}
          preventStyleDiffing={true}
          mapboxApiAccessToken={mapboxApiAccessToken}
        />

      </DeckGL>
    );
  }
}

render(<App />, document.body.appendChild(document.createElement('div')));
