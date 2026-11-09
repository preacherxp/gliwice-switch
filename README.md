# Gliwice switch

Contemporary Gliwice in pixel art: the Rynek with its green-roofed Ratusz and Neptune fountain, the renovated theatre on Nowy Świat, and Beer Brothers at Górnych Wałów 30. Café terraces with guests, pedestrians, the Rynek's pigeons, young plane trees, a yellow Metrorower and warm evening lights replace the former industrial scene. No build step or dependencies.

The landmarks form a compressed city panorama, rather than a literal street view.

[Live demo](https://preacherxp.github.io/gliwice-switch/) · [60 fps MP4](gliwice-day-night-60fps.mp4) · [Download the 7-second GIF](gliwice-day-night.gif) (full animated switch, 960 × 600, 3.94 MiB)

Drag to move through the hours. Tap or press Space to toggle. Use the arrow keys to step through time.

## Run locally

```sh
python3 -m http.server 8000
```

Open http://localhost:8000.

## Use the switch

Copy `city-switch.js` and `gliwice.js` into your site, then include:

```html
<script src="city-switch.js"></script>
<script src="gliwice.js"></script>
<gliwice-switch style="display: block; width: min(680px, 100%);"></gliwice-switch>
```

The element exposes `checked`, `position`, and `jump(night)`. Listen for `change` events (`detail.night`) and `scrub` events (`detail.position`, `detail.hour`, `detail.dark`).

## Publishing

GitHub Pages serves the root of the `main` branch. Push changes to `main` to update the demo.

## Attribution

The engine is derived from `tokyo-switch.js`; the original idea is “住人のいるスイッチ” by @Lattice_Node ([original project](https://ludion.ai/p/toggle-daylight), MIT), as credited in the engine source.

## Check the scene

```sh
node test-scene.cjs
```

Checks rendering through day, dusk, night and dawn, Beer Brothers lighting, the cat and pigeon interaction and reduced motion using the real scene engine.

## Landmark references

- [Beer Brothers — official pub and shop website](https://beerbrothers.shop/), Górnych Wałów 30.
- [Beer Brothers — venue-maintained profile](https://beer-brothers.ontap.pl/).
- [Gliwice landmarks and theatre façade](https://gliwice.eu/content/ciekawe-miejsca).
- [Theatre address on Nowy Świat 55–57](https://teatr.gliwice.pl/adresy-i-telefony/). The scene uses the familiar Teatr Muzyczny name requested for this illustration.
- [London planes planted on the Rynek](https://gliwice.eu/aktualnosci/miasto/rynek-wypieknieje-bedzie-wiecej-zieleni) and [the planting in 2022](https://gliwice.eu/aktualnosci/miasto/zielonegliwice-sadza-drzewa-na-rynku).
- [Metrorower in Gliwice](https://gliwice.eu/aktualnosci/ekologia/metrorower-wystartowal), the yellow-and-black metropolitan hire bike.
- [Pigeons on the Rynek and the Neptune fountain](https://www.24gliwice.pl/wiadomosci/golebie-brudza-i-niewiele-mozna-z-tym-zrobic-wg-rozporzadzenia-ministra-srodowiska-sa-pod-ochrona/), local press photographs.

[RESEARCH.md](RESEARCH.md) lists the photographs opened for these additions and what could not be verified.

The MP4 is a seven-second recording of the complete browser-rendered switch at 800 × 500 and 60 fps, including the moving glass lens.
