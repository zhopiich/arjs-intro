import * as THREE from 'three'

export function useMarkerRoot() {
  let root: THREE.Group | null = null

  function create(scene: THREE.Scene) {
    root = new THREE.Group()
    root.visible = false
    scene.add(root)
  }

  function dispose() {
    root?.removeFromParent()
    root = null
  }

  return {
    create,
    dispose,
    get root() {
      return root
    },
  }
}
