import type { ArMarkerControls, ArToolkitContext } from '@/vendor/ar-js/ar-threex.mjs'
import * as THREE from 'three'
import { readonly, ref } from 'vue'

export function useMarkerRoot() {
  const visible = ref(false)

  let root: THREE.Group | null = null
  let cube: THREE.Mesh<THREE.BoxGeometry, THREE.MeshNormalMaterial> | null = null
  let markerControls: ArMarkerControls | null = null

  async function create(scene: THREE.Scene, context: ArToolkitContext) {
    const { ArMarkerControls } = await import('@/vendor/ar-js/ar-threex.mjs')

    root = new THREE.Group()
    root.visible = false

    cube = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshNormalMaterial(),
    )
    cube.position.y = 0.5
    root.add(cube)

    scene.add(root)

    markerControls = new ArMarkerControls(context, root, {
      preset: 'hiro',
      type: 'pattern',
    })
    window.addEventListener('markerFound', handleMarkerFound)
    window.addEventListener('markerLost', handleMarkerLost)
  }

  function handleMarkerFound(event: Event) {
    if (!isMarkerEventForCurrentControls(event))
      return

    setVisible(true)
  }

  function handleMarkerLost(event: Event) {
    if (!isMarkerEventForCurrentControls(event))
      return

    setVisible(false)
  }

  function isMarkerEventForCurrentControls(event: Event) {
    return event instanceof CustomEvent
      && event.detail === markerControls
  }

  function setVisible(nextVisible: boolean) {
    visible.value = nextVisible

    if (root)
      root.visible = nextVisible
  }

  function dispose() {
    window.removeEventListener('markerFound', handleMarkerFound)
    window.removeEventListener('markerLost', handleMarkerLost)
    cube?.geometry.dispose()
    cube?.material.dispose()
    root?.removeFromParent()
    markerControls = null
    cube = null
    root = null
    visible.value = false
  }

  return {
    create,
    get cube() {
      return cube
    },
    dispose,
    get root() {
      return root
    },
    setVisible,
    visible: readonly(visible),
  }
}
