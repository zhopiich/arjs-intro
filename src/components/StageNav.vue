<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

const stages = [
  { label: 'Stage 1: Basic Marker', to: '/' },
  { label: 'Stage 2: Multi Marker', to: '/stage/2' },
  { label: 'Stage 3: Animation', to: '/stage/3' },
]
</script>

<template>
  <nav class="stage-nav">
    <router-link
      v-for="stage in stages"
      :key="stage.to"
      :to="stage.to"
      :class="{ 'stage-nav__link--active': route.path === stage.to }"
      class="stage-nav__link"
    >
      {{ stage.label }}
    </router-link>
  </nav>
</template>

<style scoped>
.stage-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  display: flex;
  gap: 0;
  background: rgb(16 16 20 / 85%);
  backdrop-filter: blur(8px);
  padding: 0.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.stage-nav__link {
  flex-shrink: 0;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.8125rem;
  color: rgb(160 160 170);
  text-decoration: none;
  transition:
    color 0.15s,
    background 0.15s;
}

.stage-nav__link:hover {
  color: #fff;
  background: rgb(255 255 255 / 8%);
}

.stage-nav__link--active {
  color: #fff;
  background: rgb(59 130 246 / 60%);
}
</style>
