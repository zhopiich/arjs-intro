import type { ArMarkerControls, ArToolkitContext } from '@/vendor/ar-js/ar-threex.mjs'
import * as THREE from 'three'
import { readonly, ref } from 'vue'

export interface MarkerConfig {
  id: string
  patternUrl: string
  createContent: () => THREE.Object3D
}

export function useMarkers(configs: MarkerConfig[]) {
  const visibleMap = ref<Record<string, boolean>>({})
  const roots: THREE.Group[] = []
  let controlsList: ArMarkerControls[] = []

  async function create(scene: THREE.Scene, context: ArToolkitContext) {
    const { ArMarkerControls } = await import('@/vendor/ar-js/ar-threex.mjs')

    for (const [index, config] of configs.entries()) {
      const root = new THREE.Group()
      root.visible = false
      roots[index] = root
      visibleMap.value[config.id] = false

      const content = config.createContent()
      root.add(content)
      scene.add(root)

      controlsList[index] = new ArMarkerControls(context, root, {
        patternUrl: config.patternUrl,
        type: 'pattern',
      })
    }

    window.addEventListener('markerFound', handleMarkerFound)
    window.addEventListener('markerLost', handleMarkerLost)
  }

  function handleMarkerFound(event: Event) {
    syncVisibility(event, true)
  }

  function handleMarkerLost(event: Event) {
    syncVisibility(event, false)
  }

  function syncVisibility(event: Event, visible: boolean) {
    if (!(event instanceof CustomEvent))
      return
    const idx = controlsList.findIndex(c => c === event.detail)
    if (idx === -1)
      return
    const root = roots[idx]
    const config = configs[idx]
    if (!root || !config)
      return
    root.visible = visible
    visibleMap.value[config.id] = visible
  }

  function dispose() {
    window.removeEventListener('markerFound', handleMarkerFound)
    window.removeEventListener('markerLost', handleMarkerLost)
    for (const root of roots) {
      root.traverse((obj) => {
        const mesh = obj as THREE.Mesh
        mesh.geometry?.dispose()
        const mat = mesh.material
        if (Array.isArray(mat))
          mat.forEach(m => m.dispose())
        else
          mat?.dispose()
      })
      root.removeFromParent()
    }
    roots.length = 0
    controlsList = []
    visibleMap.value = {}
  }

  return {
    roots,
    visibleMap: readonly(visibleMap),
    create,
    dispose,
  }
}
