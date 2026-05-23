<script setup lang="ts">
import ArSceneCanvas from '@/components/ar-viewer/ArSceneCanvas.vue'
</script>

<template>
  <main class="home-view">
    <ArSceneCanvas />
  </main>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  background: transparent;
  color: #fff;
}
</style>
