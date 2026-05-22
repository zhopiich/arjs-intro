import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const rendererMount = vi.fn()
const rendererStartLoop = vi.fn()
const rendererStopLoop = vi.fn()
const rendererDispose = vi.fn()
const projectionMatrixCopy = vi.fn()

const cameraStart = vi.fn()
const cameraStop = vi.fn()
const cameraSource = ref<{ ready: boolean } | null>({ ready: true })
const sourceElement = document.createElement('video')
const cameraSourceElement = ref<Element | null>(sourceElement)

const markerCreate = vi.fn()
const markerDispose = vi.fn()

const contextInit = vi.fn()
const contextUpdate = vi.fn()
const getProjectionMatrix = vi.fn(() => 'projection-matrix')
const contextConstructor = vi.fn()

vi.mock('../ar/useArRenderer', () => ({
  useArRenderer: () => ({
    camera: {
      projectionMatrix: {
        copy: projectionMatrixCopy,
      },
    },
    dispose: rendererDispose,
    mount: rendererMount,
    scene: { name: 'scene' },
    startLoop: rendererStartLoop,
    stopLoop: rendererStopLoop,
  }),
}))

vi.mock('../ar/useCameraLifecycle', () => ({
  useCameraLifecycle: () => ({
    source: cameraSource,
    sourceElement: cameraSourceElement,
    start: cameraStart,
    stop: cameraStop,
  }),
}))

vi.mock('../ar/useMarkerRoot', () => ({
  useMarkerRoot: () => ({
    create: markerCreate,
    dispose: markerDispose,
  }),
}))

vi.mock('@/vendor/ar-js/ar-threex.mjs', () => ({
  ArToolkitContext: class ArToolkitContext {
    constructor(parameters: unknown) {
      contextConstructor(parameters)
    }

    getProjectionMatrix = getProjectionMatrix
    init = contextInit
    update = contextUpdate
  },
}))

describe('useArScene', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    cameraStart.mockResolvedValue(undefined)
    cameraSource.value = { ready: true }
    cameraSourceElement.value = sourceElement
  })

  it('creates AR context, marker root, and starts the render loop after camera is ready', async () => {
    const { useArScene } = await import('../useArScene')
    const container = document.createElement('div')
    const scene = useArScene()

    const startPromise = scene.start(container)
    await vi.waitFor(() => expect(contextInit).toHaveBeenCalled())
    const [onContextReady] = contextInit.mock.calls[0] ?? []
    expect(onContextReady).toBeTypeOf('function')
    onContextReady()
    await startPromise

    expect(rendererMount).toHaveBeenCalledWith(container)
    expect(cameraStart).toHaveBeenCalled()
    expect(contextConstructor).toHaveBeenCalledWith({
      cameraParametersUrl: '/ar-js/camera_para.dat',
      detectionMode: 'mono',
    })
    expect(projectionMatrixCopy).toHaveBeenCalledWith('projection-matrix')
    expect(markerCreate).toHaveBeenCalledWith({ name: 'scene' }, expect.any(Object))
    expect(rendererStartLoop).toHaveBeenCalledWith(expect.any(Function))
    expect(scene.state.value).toBe('ready')
  })

  it('updates AR tracking once per frame when source is ready', async () => {
    const { useArScene } = await import('../useArScene')
    const scene = useArScene()

    const startPromise = scene.start(document.createElement('div'))
    await vi.waitFor(() => expect(contextInit).toHaveBeenCalled())
    const [onContextReady] = contextInit.mock.calls[0] ?? []
    expect(onContextReady).toBeTypeOf('function')
    onContextReady()
    await startPromise

    const [onFrame] = rendererStartLoop.mock.calls[0] ?? []
    expect(onFrame).toBeTypeOf('function')
    onFrame()

    expect(contextUpdate).toHaveBeenCalledWith(sourceElement)
  })

  it('skips AR tracking update when source is not ready', async () => {
    const { useArScene } = await import('../useArScene')
    const scene = useArScene()

    const startPromise = scene.start(document.createElement('div'))
    await vi.waitFor(() => expect(contextInit).toHaveBeenCalled())
    const [onContextReady] = contextInit.mock.calls[0] ?? []
    expect(onContextReady).toBeTypeOf('function')
    onContextReady()
    await startPromise

    cameraSource.value = { ready: false }
    const [onFrame] = rendererStartLoop.mock.calls[0] ?? []
    expect(onFrame).toBeTypeOf('function')
    onFrame()

    expect(contextUpdate).not.toHaveBeenCalled()
  })

  it('stops loop, camera, marker, and renderer resources on stop', async () => {
    const { useArScene } = await import('../useArScene')
    const scene = useArScene()

    scene.stop()

    expect(rendererStopLoop).toHaveBeenCalled()
    expect(cameraStop).toHaveBeenCalled()
    expect(markerDispose).toHaveBeenCalled()
    expect(rendererDispose).toHaveBeenCalled()
    expect(scene.state.value).toBe('idle')
  })
})
