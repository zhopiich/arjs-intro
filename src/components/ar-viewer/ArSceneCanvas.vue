<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useArScene } from '@/composables/useArScene'

const container = ref<HTMLElement | null>(null)
const { error, start, state, stop } = useArScene()

onMounted(async () => {
  if (!container.value)
    return

  await start(container.value)
})

onBeforeUnmount(() => {
  stop()
})
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
  overflow: hidden;
}

.ar-scene-canvas__viewport {
  position: absolute;
  inset: 0;
}

.ar-scene-canvas__status {
  position: absolute;
  left: 1rem;
  top: 1rem;
  z-index: 1;
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
