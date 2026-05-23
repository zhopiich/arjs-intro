<script setup lang="ts">
import * as THREE from 'three'
import { ref } from 'vue'
import ArSceneCanvas from '@/components/ar-viewer/ArSceneCanvas.vue'
import { MULTI_MARKER_CONFIGS } from '@/composables/ar/markerConfigs'
import { useMarkerAnimation } from '@/composables/ar/useMarkerAnimation'

const arCanvas = ref<InstanceType<typeof ArSceneCanvas> | null>(null)

const animHiro = useMarkerAnimation({ type: 'rotate-y', speed: 1 })
const animKanji = useMarkerAnimation({ type: 'float', speed: 1 })

let initialized = false

function onFrame(_delta: number) {
  if (!initialized) {
    const roots = arCanvas.value?.markerRoots
    if (!roots || roots.length < 2)
      return
    const hc = roots[0]?.children[0]
    const kc = roots[1]?.children[0]
    if (hc instanceof THREE.Object3D)
      animHiro.setTarget(hc)
    if (kc instanceof THREE.Object3D)
      animKanji.setTarget(kc)
    animHiro.start()
    animKanji.start()
    initialized = true
  }

  const vmap = arCanvas.value?.visibleMap ?? {}
  if (vmap.hiro)
    animHiro.tick(_delta)
  if (vmap.kanji)
    animKanji.tick(_delta)
}
</script>

<template>
  <main class="stage-three">
    <ArSceneCanvas
      ref="arCanvas"
      :marker-configs="MULTI_MARKER_CONFIGS"
      :on-frame="onFrame"
    />
  </main>
</template>

<style scoped>
.stage-three {
  min-height: 100vh;
  background: transparent;
  color: #fff;
}
</style>
