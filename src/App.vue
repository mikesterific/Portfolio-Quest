<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import {
  appRequiresKeyboardMouse,
  subscribeAppInputRequirement,
} from "./utils/requiresKeyboardAndMouse";

// App.vue - Main application shell (sync initial value avoids touch-device flash before mount)
const blockedByTouchInput = ref(appRequiresKeyboardMouse());
let unsubInputGate: (() => void) | undefined;

onMounted(() => {
  unsubInputGate = subscribeAppInputRequirement((value) => {
    blockedByTouchInput.value = value;
  });
});

onBeforeUnmount(() => {
  unsubInputGate?.();
});
</script>

<template>
  <div class="app-root">
    <div class="app-main" :class="{ 'app-main--blocked': blockedByTouchInput }">
      <router-view />
    </div>

    <div
      v-if="blockedByTouchInput"
      class="keyboard-mouse-gate"
      role="dialog"
      aria-live="polite"
      aria-modal="true"
      aria-labelledby="keyboard-mouse-heading"
    >
      <div class="keyboard-mouse-panel">
        <h1 id="keyboard-mouse-heading" class="keyboard-mouse-title">
          Keyboard and mouse required
        </h1>
        <p class="keyboard-mouse-body">
          Sorry — Portfolio Quest is not designed for phones or touch-only devices. Please use a
          physical keyboard and a mouse or trackpad.
        </p>
        <p class="keyboard-mouse-contact">
          Try again from a desktop or laptop when you would like the full experience.
        </p>
      </div>
    </div>
  </div>
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

.app-root {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

.app-main--blocked {
  pointer-events: none;
  user-select: none;
}

.keyboard-mouse-gate {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  background: radial-gradient(circle at 50% 20%, #132238 0%, #050913 72%);
  color: #dce7f8;
  text-align: center;
}

.keyboard-mouse-panel {
  max-width: 28rem;
  padding: 2rem 1.5rem;
  border-radius: 0.65rem;
  border: 1px solid rgba(120, 195, 255, 0.35);
  background: rgba(5, 12, 24, 0.92);
  box-shadow:
    0 0 0 1px rgba(0, 0, 0, 0.45),
    0 22px 50px rgba(0, 0, 0, 0.55);
}

.keyboard-mouse-title {
  font-family: Orbitron, system-ui, sans-serif;
  font-size: clamp(1.05rem, 4.5vw, 1.45rem);
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  margin-bottom: 1rem;
  color: #7fd9ff;
}

.keyboard-mouse-body,
.keyboard-mouse-contact {
  font-size: clamp(0.92rem, 3.8vw, 1.05rem);
  line-height: 1.55;
}

.keyboard-mouse-body {
  margin-bottom: 1rem;
  opacity: 0.95;
}

.keyboard-mouse-contact {
  margin-top: 0.25rem;
  opacity: 0.82;
}

/* Ensure game canvas fills container when in game view */
canvas {
  display: block;
  touch-action: none; /* Prevent browser scrolling on touch */
}
</style>
