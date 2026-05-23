import * as THREE from 'three'

export function useArRenderer() {
  const scene = new THREE.Scene()
  const camera = new THREE.Camera()

  let renderer: THREE.WebGLRenderer | null = null
  let container: HTMLElement | null = null
  let frameId: number | null = null

  function mount(target: HTMLElement) {
    container = target
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      premultipliedAlpha: false,
    })
    renderer.setClearColor(0x000000, 0)
    Object.assign(renderer.domElement.style, {
      background: 'transparent',
      inset: '0',
      pointerEvents: 'none',
      position: 'absolute',
      zIndex: '1',
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    resize()
    target.append(renderer.domElement)
  }

  function resize() {
    if (!renderer || !container)
      return

    renderer.setSize(container.clientWidth, container.clientHeight)
  }

  function startLoop(onFrame: () => void) {
    stopLoop()

    const tick = () => {
      onFrame()
      if (renderer)
        renderer.render(scene, camera)
      frameId = window.requestAnimationFrame(tick)
    }

    frameId = window.requestAnimationFrame(tick)
  }

  function stopLoop() {
    if (frameId === null)
      return

    window.cancelAnimationFrame(frameId)
    frameId = null
  }

  function dispose() {
    stopLoop()
    disposeSceneResources()
    scene.clear()
    renderer?.dispose()
    renderer?.domElement.remove()
    renderer = null
    container = null
  }

  return {
    camera,
    dispose,
    get domElement() {
      return renderer?.domElement ?? null
    },
    mount,
    resize,
    scene,
    startLoop,
    stopLoop,
  }

  function disposeSceneResources() {
    scene.traverse((object) => {
      const disposableObject = object as Partial<{
        geometry: THREE.BufferGeometry
        material: THREE.Material | THREE.Material[]
      }>

      disposableObject.geometry?.dispose()

      if (Array.isArray(disposableObject.material)) {
        disposableObject.material.forEach(material => material.dispose())
        return
      }

      disposableObject.material?.dispose()
    })
  }
}
