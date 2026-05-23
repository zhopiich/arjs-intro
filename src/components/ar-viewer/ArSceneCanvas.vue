<script setup lang="ts">
import type { MarkerConfig } from '@/composables/ar/useMarkers'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useArScene } from '@/composables/useArScene'

const props = defineProps<{
  markerConfigs: MarkerConfig[]
  onFrame?: (delta: number) => void
}>()

const container = ref<HTMLElement | null>(null)
const { error, markerRoots, start, state, stop, visibleMap } = useArScene(props.markerConfigs, props.onFrame)

onMounted(async () => {
  if (!container.value)
    return
  await start(container.value)
})

onBeforeUnmount(() => {
  stop()
})

defineExpose({ markerRoots, visibleMap })
</script>

<template>
  <section class="ar-scene-canvas">
    <div ref="container" class="ar-scene-canvas__viewport" />
    <div class="ar-scene-canvas__status">
      <span>{{ state }}</span>
      <span v-if="error">{{ error.message }}</span>
    </div>
  </section>
</template>

<style scoped>
.ar-scene-canvas {
  position: relative;
  min-height: 100vh;
  background: transparent;
  overflow: hidden;
}

.ar-scene-canvas__viewport {
  position: absolute;
  z-index: 0;
  inset: 0;
  background: transparent;
}

.ar-scene-canvas__status {
  position: absolute;
  left: 1rem;
  top: 1rem;
  z-index: 2;
  display: flex;
  max-width: min(28rem, calc(100vw - 2rem));
  flex-direction: column;
  gap: 0.25rem;
  border-radius: 0.5rem;
  background: rgb(0 0 0 / 64%);
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  line-height: 1.4;
}
</style>
