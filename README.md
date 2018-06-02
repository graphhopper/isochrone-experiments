# Isochrone Experiments

For these experiments you need a modified GraphHopper core server:

```bash
git clone https://github.com/graphhopper/graphhopper
cd graphhopper
git checkout isochrone-edgelist
./graphhopper.sh web your-area.pbf
```

## License

This project stands under the Apache License 2.0.

## Deck.gl Usage

```
git clone https://github.com/graphhopper/isochrone-experiments
cd isochrone-experiments
git checkout deckgl
cd deckgl
# deck.gl requires a not too old npm version, I installed 10.x via nvm, then do:
npm install
export MapboxAccessToken=<your mapbox api key>
npm start
```

![image](./img/isochrone-example1.png)

## Mapbox GL JS Usage

git clone https://github.com/graphhopper/isochrone-experiments
cd isochrone-experiments
git checkout deckgl
cd mapbox
# TODO work in progress

