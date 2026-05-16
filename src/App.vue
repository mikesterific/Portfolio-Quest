<script setup lang="ts">
// App.vue - Main application shell
</script>

<template>
  <router-view />
</template>

<style>
/* Font imports for Portfolio Quest style guide */
@import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700&family=Roboto:wght@400;500;700&display=swap");

/* Global styles for Portfolio Quest */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  font-family:
    "Roboto",
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Oxygen,
    Ubuntu,
    Cantarell,
    sans-serif;
}

#app {
  width: 100%;
  min-height: 100vh;
}

/* Ensure game canvas fills container when in game view */
canvas {
  display: block;
  touch-action: none; /* Prevent browser scrolling on touch */
}
</style>
