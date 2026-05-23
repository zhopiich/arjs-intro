# AR.js

Marker-based AR viewer with multi-marker tracking.

## Demo

Three progressive stages:

- **Stage 1** — Hiro marker detection with cube overlay
- **Stage 2** — Simultaneous multi-marker tracking (Hiro + Kanji) with distinct 3D content per marker
- **Stage 3** — Per-marker Three.js animations (rotation, floating) driven by AR tracking state

## Quick Start

```sh
pnpm install
pnpm dev --host 0.0.0.0
```

Access from a phone on the same network, or use a tunnel (Cloudflare, ngrok) to serve over HTTPS — camera access requires a secure context.

## Architecture

```
Vue route → ArSceneCanvas (viewport)
  ├── Camera video layer (z-index 0)
  ├── Three.js transparent canvas (z-index 1)
  └── Status overlay (z-index 2)

Three scene → N marker roots (one per tracked marker)
  └── Marker content (geometry + material)
```

AR.js vendor build and calibration assets are fetched automatically on `postinstall`.

## Project Structure

```
src/
├── App.vue
├── main.ts
├── router/
│   └── index.ts
├── composables/
│   ├── ar/
│   │   ├── useArRenderer.ts       — Three.js scene, camera, RAF loop
│   │   ├── useCameraLifecycle.ts  — AR.js webcam source lifecycle
│   │   ├── useMarkers.ts          — N-marker tracking via ArMarkerControls
│   │   ├── useMarkerAnimation.ts  — Time-based per-object animation
│   │   └── markerConfigs.ts       — Shared marker definitions
│   └── useArScene.ts              — Orchestrator: context, resize, loop
├── views/
│   ├── HomeView.vue
│   ├── StageTwoView.vue
│   └── StageThreeView.vue
└── components/
    ├── ar-viewer/ArSceneCanvas.vue
    └── StageNav.vue
```
