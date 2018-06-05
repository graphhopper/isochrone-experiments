# Isochrone Experiments

For these [isochrone](https://en.wikipedia.org/wiki/Isochrone_map) experiments you need a modified GraphHopper core server:

```bash
git clone https://github.com/graphhopper/graphhopper
cd graphhopper
git checkout isochrone-edgelist
./graphhopper.sh web your-area.pbf
```

## License

This project stands under the Apache License 2.0.

## Deck.gl Usage

uses edgelist-json

```bash
git clone https://github.com/graphhopper/isochrone-experiments
cd isochrone-experiments
git checkout deckgl
cd deckgl
# deck.gl requires a not too old npm version, I installed 10.x via nvm, then do:
npm install
export MapboxAccessToken=<your mapbox api key>
npm start
```

![image](./deckgl/img/isochrone-example1.png)

## Mapbox GL JS via JSON

uses result=edgelist-json

```bash
git clone https://github.com/graphhopper/isochrone-experiments
cd isochrone-experiments
git checkout deckgl
cd mapbox-json
npx http-server
http://127.0.0.1:8081/index.html?key=<mapbox key>
```

## Mapbox GL JS via binary

uses the native response via result=edgelist 
which is 5 times smaller (1) compared to the 'compact' JSON edge list

```bash
git clone https://github.com/graphhopper/isochrone-experiments
cd isochrone-experiments
git checkout deckgl
cd mapbox
npx http-server
http://127.0.0.1:8081/index.html?key=<mapbox key>
```

## Isochone as Vector Tile Source

See mvt folder and result=mvt

Problems:

 * couldn't get it display the mvt (size is small but according to vtzero it
   is a valid mvt)
 * it takes ages to create the mvt with the used Java lib (>10sec)
 * mapbox fetches the vector tiles per tile resulting in multiple calls where we would just need one