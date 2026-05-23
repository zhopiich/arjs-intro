import type * as THREE from 'three'
import type { Ref } from 'vue'

export type AnimationType = 'rotate-y' | 'float' | 'pulse'

export interface AnimationConfig {
  type: AnimationType
  speed?: number
  enabled?: Ref<boolean>
}

export function useMarkerAnimation(config: AnimationConfig) {
  const speed = config.speed ?? 1
  let target: THREE.Object3D | null = null
  let elapsed = 0
  let running = false

  function setTarget(obj: THREE.Object3D) {
    target = obj
  }

  function start() {
    running = true
  }

  function stop() {
    running = false
  }

  function tick(delta: number) {
    if (!running || !target)
      return
    if (config.enabled && !config.enabled.value)
      return

    elapsed += delta * speed

    switch (config.type) {
      case 'rotate-y':
        target.rotation.y = elapsed
        break
      case 'float':
        target.position.y = Math.sin(elapsed * 2) * 0.3
        break
      case 'pulse': {
        const scale = 1 + Math.sin(elapsed * 3) * 0.15
        target.scale.setScalar(scale)
        break
      }
    }
  }

  return { setTarget, start, stop, tick }
}
