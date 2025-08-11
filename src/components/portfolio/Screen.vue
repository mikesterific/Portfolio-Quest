<template>
  <div class="hud-container">
    <!-- Radar -->
    <div class="radar">
      <div class="circle circle1"></div>
      <div class="circle circle2"></div>
      <div class="circle circle3"></div>
      <div class="circle circle4"></div>
      <div class="crosshair vertical"></div>
      <div class="crosshair horizontal"></div>
    </div>

    <!-- Telemetry -->
    <div class="telemetry">
      <div class="telemetry-box">
        <span class="label">VECTOR</span>
        <span class="value">{{ vector.toFixed(1) }} m/s</span>
      </div>
      <div class="telemetry-box">
        <span class="label">STATION HEALTH</span>
        <span class="value">{{ stationHealth }}%</span>
      </div>
    </div>

    <!-- Station Info -->
    <div class="station-card">
      <div class="card-header">
        <div class="icon">🔒</div>
        <h2>SECURITY & ACCESSIBILITY</h2>
      </div>
      <button class="category-btn">SECURITY & ACCESSIBILITY</button>

      <p class="description">
        Linux Foundation certified in Secure Software Development (LFD121).
        Brings accessibility and security into early–stage design—not bolted on after.
      </p>

      <div class="proficiency">
        <span>Proficiency Level</span>
        <span class="level">Advanced</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: proficiency + '%' }"></div>
      </div>

      <div class="tags">
        <span v-for="tag in tags" :key="tag" class="tag">{{ tag }}</span>
      </div>

      <div class="projects">
        <div v-for="project in projects" :key="project.name" class="project">
          <strong>{{ project.name }}</strong>
          <span>{{ project.type }}</span>
        </div>
      </div>

      <button class="dock-btn" @click="dockWithStation">
        DOCK WITH THIS STATION
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";

const vector = ref(0.2);
const stationHealth = ref(92);
const proficiency = ref(80); // percentage for progress bar

const tags = ref(["LFD121", "Secure Development", "Accessibility", "WCAG"]);

const projects = ref([
  { name: "Portfolio Quest", type: "Game" },
  { name: "E-commerce Platform", type: "Web App" },
]);

function dockWithStation() {
  alert("Docking sequence initiated!");
}
</script>

<style scoped>
.hud-container {
  display: flex;
  gap: 2rem;
  background: radial-gradient(circle at center, #0a0f1c, #000);
  padding: 2rem;
  color: #9efcff;
  font-family: 'Orbitron', sans-serif;
}

/* Radar */
.radar {
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: 50%;
  border: 1px solid rgba(0, 255, 255, 0.3);
}

.circle {
  position: absolute;
  border: 1px solid rgba(0, 255, 255, 0.2);
  border-radius: 50%;
}

.circle1 { width: 100%; height: 100%; top: 0; left: 0; }
.circle2 { width: 75%; height: 75%; top: 12.5%; left: 12.5%; }
.circle3 { width: 50%; height: 50%; top: 25%; left: 25%; }
.circle4 { width: 25%; height: 25%; top: 37.5%; left: 37.5%; }

.crosshair {
  position: absolute;
  background: rgba(0, 255, 255, 0.3);
}

.crosshair.vertical { width: 1px; height: 100%; left: 50%; top: 0; }
.crosshair.horizontal { width: 100%; height: 1px; top: 50%; left: 0; }

/* Telemetry */
.telemetry {
  position: absolute;
  top: 330px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.telemetry-box {
  border: 1px solid rgba(0, 255, 255, 0.3);
  padding: 0.5rem;
  background: rgba(0, 20, 40, 0.6);
}

.label {
  display: block;
  font-size: 0.7rem;
  opacity: 0.8;
}

.value {
  font-size: 1.2rem;
}

/* Station card */
.station-card {
  background: rgba(0, 20, 40, 0.8);
  border: 1px solid rgba(0, 255, 255, 0.3);
  padding: 1rem;
  width: 350px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.category-btn {
  background: #ffb347;
  border: none;
  color: #000;
  padding: 0.3rem 0.6rem;
  font-weight: bold;
  cursor: default;
}

.proficiency {
  display: flex;
  justify-content: space-between;
}

.progress-bar {
  background: rgba(255, 255, 255, 0.1);
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  background: linear-gradient(to right, #00d4ff, #00ff99);
  height: 100%;
}

.tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  border: 1px solid rgba(0, 255, 255, 0.3);
  padding: 0.2rem 0.4rem;
}

.projects {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.project {
  background: rgba(0, 255, 255, 0.05);
  padding: 0.3rem;
  border: 1px solid rgba(0, 255, 255, 0.2);
}

.dock-btn {
  background: linear-gradient(to right, #00d4ff, #00ff99);
  border: none;
  padding: 0.6rem;
  font-weight: bold;
  cursor: pointer;
}
</style>
