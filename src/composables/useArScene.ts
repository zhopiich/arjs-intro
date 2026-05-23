import type { MarkerConfig } from './ar/useMarkers'
import { readonly, ref } from 'vue'
import { publicAssetUrl } from './ar/publicAssetUrl'
import { useArRenderer } from './ar/useArRenderer'
import { useCameraLifecycle } from './ar/useCameraLifecycle'
import { useMarkers } from './ar/useMarkers'

export function useArScene(configs: MarkerConfig[] = [], onFrame?: (delta: number) => void) {
  const state = ref<'idle' | 'requesting' | 'ready' | 'error'>('idle')
  const error = ref<Error | null>(null)

  const renderer = useArRenderer()
  const camera = useCameraLifecycle()
  const markers = useMarkers(configs)
  let resizeTarget: HTMLElement | null = null
  let lastTime = 0

  async function start(container: HTMLElement) {
    state.value = 'requesting'
    error.value = null

    try {
      renderer.mount(container)
      await camera.start()
      camera.mountSourceElement(container)

      const { ArToolkitContext } = await import('@/vendor/ar-js/ar-threex.mjs')
      const context = new ArToolkitContext({
        cameraParametersUrl: publicAssetUrl('ar-js/camera_para.dat'),
        detectionMode: 'mono',
      })

      await new Promise<void>((resolve) => {
        context.init(() => {
          renderer.camera.projectionMatrix.copy(context.getProjectionMatrix())
          resolve()
        })
      })

      await markers.create(renderer.scene, context)
      resizeTarget = container
      syncSize()
      window.addEventListener('resize', syncSize)

      lastTime = performance.now()
      renderer.startLoop(() => {
        if (!camera.source.value?.ready || !camera.sourceElement.value)
          return

        context.update(camera.sourceElement.value)

        if (onFrame) {
          const now = performance.now()
          const delta = (now - lastTime) / 1000
          lastTime = now
          onFrame(delta)
        }
      })

      state.value = 'ready'
    }
    catch (cause) {
      error.value = cause instanceof Error ? cause : new Error(String(cause))
      state.value = 'error'
      stop()
    }
  }

  function stop() {
    window.removeEventListener('resize', syncSize)
    resizeTarget = null
    renderer.stopLoop()
    camera.stop()
    markers.dispose()
    renderer.dispose()

    if (state.value !== 'error')
      state.value = 'idle'
  }

  function syncSize() {
    if (!resizeTarget)
      return
    renderer.resize()
    if (renderer.domElement)
      camera.resize(renderer.domElement)
  }

  return {
    error: readonly(error),
    markerRoots: markers.roots,
    start,
    state: readonly(state),
    stop,
    visibleMap: markers.visibleMap,
  }
}
