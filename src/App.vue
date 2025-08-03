<script setup lang="ts">
import GameContainer from '@/components/game/GameContainer.vue'
</script>

<template>
  <div id="app">
    <GameContainer />
  </div>
</template>

<style>
/* Global styles for Portfolio Quest */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  overflow: hidden;
}

#app {
  width: 100vw;
  height: 100vh;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Ensure game canvas fills container */
canvas {
  display: block;
  touch-action: none; /* Prevent browser scrolling on touch */
}
</style>
