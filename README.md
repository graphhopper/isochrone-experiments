### Usage
```
git clone https://github.com/graphhopper/isochrone-experiments
cd isochrone-experiments
git checkout deckgl
# deck.gl requires a not too old npm version, I installed 10.x via nvm, then do:
npm install
export MapboxAccessToken=<your mapbox api key>
npm start
```

At the same time you need a modified GraphHopper core server:

```bash
git clone https://github.com/graphhopper/graphhopper
cd graphhopper
git checkout isochrone-edgelist
./graphhopper.sh web your-area.pbf
```
