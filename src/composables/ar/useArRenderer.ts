import * as THREE from 'three'

export function useArRenderer() {
  const scene = new THREE.Scene()
  const camera = new THREE.Camera()

  let renderer: THREE.WebGLRenderer | null = null
  let frameId: number | null = null

  function mount(container: HTMLElement) {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(container.clientWidth, container.clientHeight)
    container.append(renderer.domElement)
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
    scene.clear()
    renderer?.dispose()
    renderer?.domElement.remove()
    renderer = null
  }

  return {
    camera,
    dispose,
    mount,
    scene,
    startLoop,
    stopLoop,
  }
}
