import { beforeEach, describe, expect, it, vi } from 'vitest'

const init = vi.fn()
const onResizeElement = vi.fn()
const copyElementSizeTo = vi.fn()
const stopTrack = vi.fn()

class ArToolkitSource {
  domElement = document.createElement('video')
  ready = false

  constructor(public parameters: { sourceType: 'webcam' }) {
    Object.defineProperty(this.domElement, 'srcObject', {
      configurable: true,
      value: {
        getTracks: () => [{ stop: stopTrack }],
      },
    })
  }

  init(onReady: () => void, onError?: (error: unknown) => void) {
    init(onReady, onError)
  }

  onResizeElement = onResizeElement
  copyElementSizeTo = copyElementSizeTo
}

vi.mock('@/vendor/ar-js/ar-threex.mjs', () => ({
  ArToolkitSource,
}))

describe('useCameraLifecycle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('starts a webcam source and exposes it after init completes', async () => {
    const { useCameraLifecycle } = await import('../useCameraLifecycle')
    const camera = useCameraLifecycle()

    const startPromise = camera.start()
    await vi.waitFor(() => expect(init).toHaveBeenCalled())
    const [onReady] = init.mock.calls[0] ?? []
    expect(onReady).toBeTypeOf('function')
    onReady()
    await startPromise

    expect(camera.state.value).toBe('ready')
    expect(camera.source.value).toBeInstanceOf(ArToolkitSource)
    expect(camera.sourceElement.value).toBe(camera.source.value?.domElement)
  })

  it('moves to error state when source init fails', async () => {
    const { useCameraLifecycle } = await import('../useCameraLifecycle')
    const camera = useCameraLifecycle()

    const startPromise = camera.start()
    await vi.waitFor(() => expect(init).toHaveBeenCalled())
    const [, onError] = init.mock.calls[0] ?? []
    expect(onError).toBeTypeOf('function')
    onError(new Error('camera denied'))

    await expect(startPromise).rejects.toThrow('camera denied')
    expect(camera.state.value).toBe('error')
    expect(camera.error.value?.message).toBe('camera denied')
  })

  it('forwards resize to AR.js source and renderer canvas', async () => {
    const { useCameraLifecycle } = await import('../useCameraLifecycle')
    const camera = useCameraLifecycle()
    const canvas = document.createElement('canvas')

    const startPromise = camera.start()
    await vi.waitFor(() => expect(init).toHaveBeenCalled())
    const [onReady] = init.mock.calls[0] ?? []
    expect(onReady).toBeTypeOf('function')
    onReady()
    await startPromise

    camera.resize(canvas)

    expect(onResizeElement).toHaveBeenCalled()
    expect(copyElementSizeTo).toHaveBeenCalledWith(canvas)
  })

  it('stops camera stream tracks and clears source references', async () => {
    const { useCameraLifecycle } = await import('../useCameraLifecycle')
    const camera = useCameraLifecycle()

    const startPromise = camera.start()
    await vi.waitFor(() => expect(init).toHaveBeenCalled())
    const [onReady] = init.mock.calls[0] ?? []
    expect(onReady).toBeTypeOf('function')
    onReady()
    await startPromise

    camera.stop()

    expect(stopTrack).toHaveBeenCalled()
    expect(camera.state.value).toBe('idle')
    expect(camera.source.value).toBeNull()
    expect(camera.sourceElement.value).toBeNull()
  })
})
