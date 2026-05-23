import type { MarkerConfig } from './useMarkers'
import * as THREE from 'three'

const hiroConfig: MarkerConfig = {
  id: 'hiro',
  patternUrl: '/ar-js/patt.hiro',
  createContent: () => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.6, 0.6),
      new THREE.MeshNormalMaterial(),
    )
    mesh.position.y = 0.4
    return mesh
  },
}

const kanjiConfig: MarkerConfig = {
  id: 'kanji',
  patternUrl: '/ar-js/patt.kanji',
  createContent: () => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.6, 32, 32),
      new THREE.MeshNormalMaterial(),
    )
    mesh.position.y = 0.6
    return mesh
  },
}

export const SINGLE_MARKER_CONFIG: MarkerConfig[] = [hiroConfig]

export const MULTI_MARKER_CONFIGS: MarkerConfig[] = [hiroConfig, kanjiConfig]
