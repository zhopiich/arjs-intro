import { beforeEach, describe, expect, it, vi } from 'vitest'

const disposeGeometry = vi.fn()
const disposeMaterial = vi.fn()
const markerControlsConstructor = vi.fn()

vi.mock('@/vendor/ar-js/ar-threex.mjs', () => ({
  ArMarkerControls: class ArMarkerControls {
    constructor(...args: unknown[]) {
      markerControlsConstructor(...args)
    }
  },
}))

describe('useMarkerRoot', () => {
  beforeEach(() => {
    vi.clearAllMocks()
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
