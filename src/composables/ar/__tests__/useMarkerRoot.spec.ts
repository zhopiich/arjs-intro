import { beforeEach, describe, expect, it, vi } from 'vitest'

const disposeGeometry = vi.fn()
const disposeMaterial = vi.fn()
const markerControlsConstructor = vi.fn()
let createdMarkerControls: unknown = null

function captureMarkerControls(instance: unknown) {
  createdMarkerControls = instance
}

vi.mock('@/vendor/ar-js/ar-threex.mjs', () => ({
  ArMarkerControls: class ArMarkerControls {
    readonly markerControlsMock = true

    constructor(...args: unknown[]) {
      captureMarkerControls(this)
      markerControlsConstructor(...args)
    }
  },
}))

describe('useMarkerRoot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    createdMarkerControls = null
  })

  it('creates a hidden marker root with a cube child', async () => {
    const THREE = await import('three')
    const { useMarkerRoot } = await import('../useMarkerRoot')
    const scene = new THREE.Scene()

    const marker = useMarkerRoot()

    await marker.create(scene, {} as never)

    expect(marker.root).toBeInstanceOf(THREE.Group)
    expect(marker.root?.visible).toBe(false)
    expect(scene.children).toContain(marker.root)

    const cube = marker.cube
    expect(cube).toBeInstanceOf(THREE.Mesh)
    expect(marker.root?.children).toContain(cube)
    expect(cube?.position.y).toBe(0.5)
  })

  it('registers Hiro marker controls against the marker root', async () => {
    const THREE = await import('three')
    const { useMarkerRoot } = await import('../useMarkerRoot')
    const scene = new THREE.Scene()
    const context = { name: 'context' }

    const marker = useMarkerRoot()

    await marker.create(scene, context as never)

    expect(markerControlsConstructor).toHaveBeenCalledWith(
      context,
      marker.root,
      {
        preset: 'hiro',
        type: 'pattern',
      },
    )
  })

  it('updates root visibility from marker lifecycle callbacks', async () => {
    const THREE = await import('three')
    const { useMarkerRoot } = await import('../useMarkerRoot')
    const scene = new THREE.Scene()
    const marker = useMarkerRoot()

    await marker.create(scene, {} as never)

    marker.setVisible(true)
    expect(marker.visible.value).toBe(true)
    expect(marker.root?.visible).toBe(true)

    marker.setVisible(false)
    expect(marker.visible.value).toBe(false)
    expect(marker.root?.visible).toBe(false)
  })

  it('syncs visibility from AR.js markerFound and markerLost events', async () => {
    const THREE = await import('three')
    const { useMarkerRoot } = await import('../useMarkerRoot')
    const scene = new THREE.Scene()
    const marker = useMarkerRoot()

    await marker.create(scene, {} as never)

    window.dispatchEvent(new CustomEvent('markerFound', { detail: createdMarkerControls }))

    expect(marker.visible.value).toBe(true)
    expect(marker.root?.visible).toBe(true)

    window.dispatchEvent(new CustomEvent('markerLost', { detail: createdMarkerControls }))

    expect(marker.visible.value).toBe(false)
    expect(marker.root?.visible).toBe(false)
  })

  it('ignores marker lifecycle events for other marker controls', async () => {
    const THREE = await import('three')
    const { useMarkerRoot } = await import('../useMarkerRoot')
    const scene = new THREE.Scene()
    const marker = useMarkerRoot()

    await marker.create(scene, {} as never)

    window.dispatchEvent(new CustomEvent('markerFound', { detail: { other: true } }))

    expect(marker.visible.value).toBe(false)
    expect(marker.root?.visible).toBe(false)
  })

  it('removes marker lifecycle listeners on dispose', async () => {
    const THREE = await import('three')
    const { useMarkerRoot } = await import('../useMarkerRoot')
    const scene = new THREE.Scene()
    const marker = useMarkerRoot()

    await marker.create(scene, {} as never)
    marker.dispose()

    window.dispatchEvent(new CustomEvent('markerFound', { detail: createdMarkerControls }))

    expect(marker.visible.value).toBe(false)
    expect(marker.root).toBeNull()
  })

  it('disposes cube resources and removes the root from the scene', async () => {
    const THREE = await import('three')
    const { useMarkerRoot } = await import('../useMarkerRoot')
    const scene = new THREE.Scene()
    const marker = useMarkerRoot()

    await marker.create(scene, {} as never)
    marker.cube!.geometry.dispose = disposeGeometry
    ;(marker.cube!.material as { dispose: () => void }).dispose = disposeMaterial

    marker.dispose()

    expect(disposeGeometry).toHaveBeenCalled()
    expect(disposeMaterial).toHaveBeenCalled()
    expect(scene.children).not.toContain(marker.root)
    expect(marker.root).toBeNull()
    expect(marker.cube).toBeNull()
    expect(marker.visible.value).toBe(false)
  })
})
