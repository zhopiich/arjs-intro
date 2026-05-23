<script setup lang="ts">
import ArSceneCanvas from '@/components/ar-viewer/ArSceneCanvas.vue'
import { SINGLE_MARKER_CONFIG } from '@/composables/ar/markerConfigs'
</script>

<template>
  <main class="home-view">
    <ArSceneCanvas :marker-configs="SINGLE_MARKER_CONFIG" />
  </main>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  background: transparent;
  color: #fff;
}
</style>
