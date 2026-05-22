import type { CameraLifecycleState } from './ar/useCameraLifecycle'
import { readonly, ref } from 'vue'
import { useArRenderer } from './ar/useArRenderer'
import { useCameraLifecycle } from './ar/useCameraLifecycle'
import { useMarkerRoot } from './ar/useMarkerRoot'

export type ArSceneState = CameraLifecycleState

export function useArScene() {
  const state = ref<ArSceneState>('idle')
  const error = ref<Error | null>(null)

  const renderer = useArRenderer()
  const camera = useCameraLifecycle()
  const marker = useMarkerRoot()

  async function start(container: HTMLElement) {
    state.value = 'requesting'
    error.value = null

    try {
      renderer.mount(container)
      await camera.start()
      marker.create(renderer.scene)
      state.value = 'ready'
    }
    catch (cause) {
      error.value = cause instanceof Error ? cause : new Error(String(cause))
      state.value = 'error'
      stop()
    }
  }

  function stop() {
    renderer.stopLoop()
    camera.stop()
    marker.dispose()
    renderer.dispose()

    if (state.value !== 'error')
      state.value = 'idle'
  }

  return {
    error: readonly(error),
    start,
    state: readonly(state),
    stop,
  }
}
