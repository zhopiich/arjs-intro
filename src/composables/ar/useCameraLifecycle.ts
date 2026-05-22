export type CameraLifecycleState = 'idle' | 'requesting' | 'ready' | 'denied' | 'error'

export function useCameraLifecycle() {
  async function start() {
    // AR.js source setup will be added in the next implementation stage.
  }

  function stop() {
    // Camera stream cleanup will be added with AR.js source ownership.
  }

  return {
    start,
    stop,
  }
}
