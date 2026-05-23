<script setup lang="ts">
import ArSceneCanvas from '@/components/ar-viewer/ArSceneCanvas.vue'
import { MULTI_MARKER_CONFIGS } from '@/composables/ar/markerConfigs'
</script>

<template>
  <main class="stage-two">
    <ArSceneCanvas :marker-configs="MULTI_MARKER_CONFIGS" />
  </main>
</template>

<style scoped>
.stage-two {
  min-height: 100vh;
  background: transparent;
  color: #fff;
}
</style>
