import type { ArToolkitSource } from '@/vendor/ar-js/ar-threex.mjs'
import { readonly, ref } from 'vue'

export type CameraLifecycleState = 'idle' | 'requesting' | 'ready' | 'denied' | 'error'

export function useCameraLifecycle() {
  const state = ref<CameraLifecycleState>('idle')
  const error = ref<Error | null>(null)
  const source = ref<ArToolkitSource | null>(null)
  const sourceElement = ref<ArToolkitSource['domElement'] | null>(null)

  async function start() {
    state.value = 'requesting'
    error.value = null

    const { ArToolkitSource } = await import('@/vendor/ar-js/ar-threex.mjs')
    const nextSource = new ArToolkitSource({ sourceType: 'webcam' })
    source.value = nextSource
    sourceElement.value = nextSource.domElement

    await new Promise<void>((resolve, reject) => {
      nextSource.init(
        () => {
          state.value = 'ready'
          resolve()
        },
        (cause: unknown) => {
          const nextError = cause instanceof Error ? cause : new Error(String(cause))
          error.value = nextError
          state.value = 'error'
          reject(nextError)
        },
      )
    })
  }

  function resize(target: HTMLElement) {
    source.value?.onResizeElement()
    source.value?.copyElementSizeTo(target)
  }

  function stop() {
    const element = sourceElement.value
    const stream = element instanceof HTMLVideoElement ? element.srcObject : null
    if (isMediaStream(stream))
      stream.getTracks().forEach(track => track.stop())

    source.value = null
    sourceElement.value = null

    if (state.value !== 'error')
      state.value = 'idle'
  }

  return {
    error: readonly(error),
    resize,
    source: readonly(source),
    sourceElement: readonly(sourceElement),
    start,
    state: readonly(state),
    stop,
  }
}

function isMediaStream(value: unknown): value is MediaStream {
  return typeof value === 'object'
    && value !== null
    && 'getTracks' in value
    && typeof value.getTracks === 'function'
}
