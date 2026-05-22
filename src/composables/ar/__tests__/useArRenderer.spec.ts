import { beforeEach, describe, expect, it, vi } from 'vitest'

const render = vi.fn()
const setPixelRatio = vi.fn()
const setSize = vi.fn()
const disposeRenderer = vi.fn()
const removeCanvas = vi.fn()
const clearScene = vi.fn()

const disposableGeometry = { dispose: vi.fn() }
const disposableMaterial = { dispose: vi.fn() }

vi.mock('three', () => {
  class Camera {}

  class Scene {
    children: unknown[] = []
    clear = clearScene
    traverse(callback: (object: unknown) => void) {
      this.children.forEach(callback)
    }
  }

  class WebGLRenderer {
    domElement = document.createElement('canvas')
    dispose = disposeRenderer
    render = render
    setPixelRatio = setPixelRatio
    setSize = setSize

    constructor() {
      this.domElement.remove = removeCanvas
    }
  }

  return {
    Camera,
    Scene,
    WebGLRenderer,
  }
})

describe('useArRenderer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('devicePixelRatio', 2)
  })

  it('mounts a renderer canvas sized to its container', async () => {
    const { useArRenderer } = await import('../useArRenderer')
    const container = document.createElement('div')
    Object.defineProperty(container, 'clientWidth', { value: 320 })
    Object.defineProperty(container, 'clientHeight', { value: 240 })

    const renderer = useArRenderer()

    renderer.mount(container)

    expect(setPixelRatio).toHaveBeenCalledWith(2)
    expect(setSize).toHaveBeenCalledWith(320, 240)
    expect(container.querySelector('canvas')).toBeTruthy()
  })

  it('resizes the renderer to new container dimensions', async () => {
    const { useArRenderer } = await import('../useArRenderer')
    const container = document.createElement('div')
    Object.defineProperty(container, 'clientWidth', { value: 640 })
    Object.defineProperty(container, 'clientHeight', { value: 480 })

    const renderer = useArRenderer()
    renderer.mount(container)
    setSize.mockClear()

    renderer.resize()

    expect(setSize).toHaveBeenCalledWith(640, 480)
  })

  it('stops the animation loop before disposing renderer resources', async () => {
    const { useArRenderer } = await import('../useArRenderer')
    const requestAnimationFrame = vi.fn(() => 7)
    const cancelAnimationFrame = vi.fn()
    vi.stubGlobal('requestAnimationFrame', requestAnimationFrame)
    vi.stubGlobal('cancelAnimationFrame', cancelAnimationFrame)

    const renderer = useArRenderer()
    renderer.mount(document.createElement('div'))
    renderer.startLoop(vi.fn())

    renderer.dispose()

    expect(cancelAnimationFrame).toHaveBeenCalledWith(7)
    expect(disposeRenderer).toHaveBeenCalled()
    expect(removeCanvas).toHaveBeenCalled()
  })

  it('disposes traversed scene resources before clearing the scene', async () => {
    const { useArRenderer } = await import('../useArRenderer')
    const renderer = useArRenderer()
    renderer.scene.children.push({
      geometry: disposableGeometry,
      material: disposableMaterial,
    } as never)

    renderer.dispose()

    expect(disposableGeometry.dispose).toHaveBeenCalled()
    expect(disposableMaterial.dispose).toHaveBeenCalled()
    expect(clearScene).toHaveBeenCalled()
  })
})
