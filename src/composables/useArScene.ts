import type { CameraLifecycleState } from './ar/useCameraLifecycle'
import { readonly, ref } from 'vue'
import { useArRenderer } from './ar/useArRenderer'
import { useCameraLifecycle } from './ar/useCameraLifecycle'
import { useMarkerRoot } from './ar/useMarkerRoot'

export type ArSceneState = CameraLifecycleState

const cameraParametersUrl = '/ar-js/camera_para.dat'

export function useArScene() {
  const state = ref<ArSceneState>('idle')
  const error = ref<Error | null>(null)

  const renderer = useArRenderer()
  const camera = useCameraLifecycle()
  const marker = useMarkerRoot()
  let resizeTarget: HTMLElement | null = null

  async function start(container: HTMLElement) {
    state.value = 'requesting'
    error.value = null

    try {
      renderer.mount(container)
      await camera.start()
      camera.mountSourceElement(container)

      const { ArToolkitContext } = await import('@/vendor/ar-js/ar-threex.mjs')
      const context = new ArToolkitContext({
        cameraParametersUrl,
        detectionMode: 'mono',
      })

      await new Promise<void>((resolve) => {
        context.init(() => {
          renderer.camera.projectionMatrix.copy(context.getProjectionMatrix())
          resolve()
        })
      })

      await marker.create(renderer.scene, context)
      resizeTarget = container
      syncSize()
      window.addEventListener('resize', syncSize)
      renderer.startLoop(() => {
        if (!camera.source.value?.ready || !camera.sourceElement.value)
          return

        context.update(camera.sourceElement.value)
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
    marker.dispose()
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
    start,
    state: readonly(state),
    stop,
  }
}
