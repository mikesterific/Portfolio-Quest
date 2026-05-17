<script setup lang="ts">
const experiences = [
  {
    title: "Space Adventure Game",
    description:
      "Pilot through an interactive Phaser portfolio built around missions, discoveries, and project lore.",
    to: "/game",
    cta: "Launch Game",
    eyebrow: "Interactive",
    accent: "cyan",
    icon: "rocket",
  },
  {
    title: "3D Space Museum",
    description:
      "Explore a first-person gallery where featured work is staged as exhibits across a quiet orbital museum.",
    to: "/museum",
    cta: "Enter Museum",
    eyebrow: "Immersive",
    accent: "violet",
    icon: "museum",
  },
];

const highlights = ["Vue 3", "Three.js", "Phaser.js"];
</script>

<template>
  <div class="home-container">
    <div class="ambient ambient-one" aria-hidden="true"></div>
    <div class="ambient ambient-two" aria-hidden="true"></div>

    <main class="home-shell">
      <section class="hero-section" aria-labelledby="home-title">
        <p class="hero-kicker">Portfolio Quest</p>
        <h1 id="home-title" class="hero-title">Explore my work in motion.</h1>
        <p class="hero-subtitle">
          Choose a playable quest, wander a 3D gallery, or jump straight into a polished portfolio
          of projects, skills, and career highlights.
        </p>

        <div class="hero-actions" aria-label="Primary navigation">
          <router-link to="/game" class="primary-action">Start Quest</router-link>
        </div>
      </section>

      <section class="experience-options" aria-label="Choose an experience">
        <article
          v-for="experience in experiences"
          :key="experience.to"
          class="experience-card"
          :class="`accent-${experience.accent}`"
        >
          <div class="card-header">
            <span class="card-orb" aria-hidden="true"></span>
            <span class="card-eyebrow">{{ experience.eyebrow }}</span>
          </div>
          <div class="card-icon" aria-hidden="true">
            <svg
              v-if="experience.icon === 'rocket'"
              viewBox="0 0 96 96"
              role="img"
              focusable="false"
            >
              <circle class="icon-target" cx="70" cy="28" r="11" />
              <path class="icon-line" d="M70 12v8m0 16v8M54 28h8m16 0h8" />
              <path class="icon-orbit" d="M12 68c18 10 43 8 70-8" />
              <path class="icon-orbit icon-orbit-secondary" d="M17 79c17 5 38 1 58-12" />
              <path class="icon-fill" d="M49 20 78 76 49 61 20 76l29-56Z" />
              <path class="icon-panel" d="M49 34 63 66 49 58 35 66l14-32Z" />
              <path class="icon-line" d="M49 20v38" />
              <path class="icon-flame" d="M38 73 49 88l11-15" />
            </svg>

            <svg v-else viewBox="0 0 96 96" role="img" focusable="false">
              <path class="icon-orbit" d="M14 60c15 16 51 19 68-2" />
              <path class="icon-orbit icon-orbit-secondary" d="M20 76c18 9 47 4 61-15" />
              <path class="icon-fill" d="M48 15 76 31v36H20V31l28-16Z" />
              <path class="icon-panel" d="M28 67V38h40v29" />
              <path class="icon-line" d="M36 67V45m12 22V45m12 22V45" />
              <path class="icon-line" d="M24 31h48M18 75h60" />
              <circle class="icon-window" cx="48" cy="29" r="5" />
            </svg>
          </div>
          <h2>{{ experience.title }}</h2>
          <p>{{ experience.description }}</p>
          <router-link :to="experience.to" class="experience-button">
            {{ experience.cta }}
            <span aria-hidden="true">→</span>
          </router-link>
        </article>
      </section>

      <footer class="home-footer">
        <span>Built with</span>
        <ul aria-label="Core technologies">
          <li v-for="highlight in highlights" :key="highlight">{{ highlight }}</li>
        </ul>
      </footer>
    </main>
  </div>
</template>

<style scoped>
.home-container {
  --color-space-950: oklch(14% 0.04 270);
  --color-space-900: oklch(18% 0.05 270);
  --color-space-800: oklch(24% 0.06 268);
  --color-surface: oklch(22% 0.045 270 / 0.72);
  --color-surface-strong: oklch(28% 0.055 270 / 0.88);
  --color-border: oklch(68% 0.07 245 / 0.2);
  --color-text: oklch(94% 0.02 255);
  --color-muted: oklch(76% 0.035 255);
  --color-cyan: oklch(84% 0.15 205);
  --color-violet: oklch(76% 0.13 300);
  --color-warm: oklch(82% 0.12 75);

  min-height: 100vh;
  color: var(--color-text);
  background:
    radial-gradient(circle at top left, oklch(56% 0.14 205 / 0.22), transparent 34rem),
    radial-gradient(circle at 80% 18%, oklch(62% 0.12 300 / 0.18), transparent 30rem),
    linear-gradient(
      145deg,
      var(--color-space-950) 0%,
      var(--color-space-900) 52%,
      var(--color-space-800) 100%
    );
  position: relative;
  overflow: hidden;
  isolation: isolate;
}

.home-container::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(oklch(100% 0 0 / 0.035) 1px, transparent 1px),
    linear-gradient(90deg, oklch(100% 0 0 / 0.035) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, black, transparent 75%);
  pointer-events: none;
  z-index: -2;
}

.ambient {
  position: absolute;
  border-radius: 999px;
  filter: blur(10px);
  opacity: 0.62;
  z-index: -1;
}

.ambient-one {
  width: 18rem;
  height: 18rem;
  left: max(-8rem, -12vw);
  top: 18%;
  background: radial-gradient(circle, oklch(74% 0.15 205 / 0.18), transparent 68%);
}

.ambient-two {
  width: 22rem;
  height: 22rem;
  right: max(-10rem, -14vw);
  bottom: 8%;
  background: radial-gradient(circle, oklch(76% 0.13 300 / 0.18), transparent 70%);
}

.home-shell {
  width: min(1120px, calc(100% - 2rem));
  min-height: 100vh;
  margin: 0 auto;
  padding: clamp(3rem, 8vw, 6rem) 0 2rem;
  display: grid;
  align-content: center;
  gap: clamp(2rem, 5vw, 4rem);
}

.hero-section {
  max-width: 780px;
}

.hero-kicker {
  width: fit-content;
  margin-bottom: 1rem;
  padding: 0.45rem 0.75rem;
  border: 1px solid oklch(84% 0.15 205 / 0.28);
  border-radius: 999px;
  background: oklch(84% 0.15 205 / 0.1);
  color: var(--color-cyan);
  font-family: "Orbitron", sans-serif;
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.hero-title {
  max-width: 15ch;
  margin-bottom: 0;
  color: var(--color-text);
  font-family: "Orbitron", sans-serif;
  font-size: clamp(2.75rem, 6.5vw, 5.75rem);
  font-weight: 700;
  font-kerning: normal;
  font-feature-settings: "kern" 1;
  letter-spacing: -0.028em;
  line-height: 0.96;
}

.hero-subtitle {
  max-width: 42rem;
  margin-top: 1.5rem;
  color: var(--color-muted);
  font-size: clamp(1.05rem, 2vw, 1.35rem);
  line-height: 1.7;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.875rem;
  margin-top: 2rem;
}

.primary-action,
.experience-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 3rem;
  border-radius: 999px;
  font-weight: 700;
  text-decoration: none;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease,
    background-color 0.2s ease,
    box-shadow 0.2s ease;
}

.primary-action {
  padding: 0.85rem 1.25rem;
  color: var(--color-space-950);
  background: linear-gradient(135deg, var(--color-cyan), var(--color-warm));
  box-shadow: 0 18px 45px oklch(84% 0.15 205 / 0.22);
}

.primary-action:hover,
.experience-button:hover {
  transform: translateY(-2px);
}

.primary-action:focus-visible,
.experience-button:focus-visible {
  outline: 3px solid oklch(84% 0.15 205 / 0.55);
  outline-offset: 4px;
}

.experience-options {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
}

.experience-card {
  position: relative;
  overflow: hidden;
  min-height: 21rem;
  padding: clamp(1.25rem, 3vw, 2rem);
  border: 1px solid var(--color-border);
  border-radius: 28px;
  background:
    linear-gradient(145deg, oklch(100% 0 0 / 0.095), transparent 48%), var(--color-surface);
  box-shadow: 0 24px 70px oklch(0% 0 0 / 0.22);
  backdrop-filter: blur(18px);
  display: flex;
  flex-direction: column;
  transition:
    transform 0.25s ease,
    border-color 0.25s ease,
    background-color 0.25s ease,
    box-shadow 0.25s ease;
}

.experience-card::before {
  content: "";
  position: absolute;
  inset: auto -20% -42% auto;
  width: 16rem;
  height: 16rem;
  border-radius: 50%;
  background: radial-gradient(circle, var(--card-accent), transparent 68%);
  opacity: 0.2;
  pointer-events: none;
  transition: opacity 0.25s ease;
}

.experience-card:hover {
  transform: translateY(-6px);
  border-color: oklch(88% 0.08 245 / 0.38);
  background-color: var(--color-surface-strong);
  box-shadow: 0 30px 80px oklch(0% 0 0 / 0.3);
}

.experience-card:hover::before {
  opacity: 0.34;
}

.accent-cyan {
  --card-accent: oklch(84% 0.15 205 / 0.8);
}

.accent-violet {
  --card-accent: oklch(76% 0.13 300 / 0.8);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2.5rem;
}

.card-orb {
  width: 0.85rem;
  height: 0.85rem;
  border-radius: 50%;
  background: var(--card-accent);
  box-shadow: 0 0 28px var(--card-accent);
}

.card-eyebrow {
  color: var(--color-muted);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.card-icon {
  width: 7rem;
  height: 7rem;
  margin: -0.5rem 0 1.5rem;
  padding: 1rem;
  border: 1px solid oklch(100% 0 0 / 0.12);
  border-radius: 26px;
  background:
    radial-gradient(circle at 32% 24%, oklch(100% 0 0 / 0.16), transparent 38%),
    linear-gradient(145deg, var(--card-accent), oklch(100% 0 0 / 0.035) 52%);
  box-shadow:
    inset 0 1px 0 oklch(100% 0 0 / 0.16),
    0 18px 44px oklch(0% 0 0 / 0.18),
    0 0 42px var(--card-accent);
}

.card-icon svg {
  width: 100%;
  height: 100%;
  display: block;
  overflow: visible;
}

.icon-orbit,
.icon-line {
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.icon-orbit {
  color: var(--card-accent);
  stroke-width: 3;
  opacity: 0.95;
}

.icon-orbit-secondary {
  opacity: 0.42;
  stroke-width: 2;
}

.icon-line {
  color: var(--color-text);
  stroke-width: 4;
  opacity: 0.72;
}

.icon-fill {
  fill: var(--card-accent);
  stroke: oklch(100% 0 0 / 0.58);
  stroke-linejoin: round;
  stroke-width: 3;
}

.icon-panel {
  fill: oklch(100% 0 0 / 0.12);
  stroke: oklch(100% 0 0 / 0.54);
  stroke-linejoin: round;
  stroke-width: 3;
}

.icon-window {
  fill: var(--color-space-950);
  stroke: oklch(100% 0 0 / 0.7);
  stroke-width: 3;
}

.icon-target {
  fill: oklch(100% 0 0 / 0.06);
  stroke: var(--color-warm);
  stroke-width: 3;
}

.icon-flame {
  fill: var(--color-warm);
  stroke: oklch(100% 0 0 / 0.55);
  stroke-linejoin: round;
  stroke-width: 3;
}

.experience-card h2 {
  max-width: 11ch;
  margin-bottom: 1rem;
  color: var(--color-text);
  font-size: clamp(1.75rem, 4vw, 2.75rem);
  font-weight: 700;
  letter-spacing: -0.04em;
  line-height: 1;
}

.experience-card p {
  max-width: 31rem;
  margin-bottom: 2rem;
  color: var(--color-muted);
  font-size: 1rem;
  line-height: 1.7;
}

.experience-button {
  width: fit-content;
  gap: 0.45rem;
  margin-top: auto;
  padding: 0.75rem 1rem;
  border: 1px solid oklch(100% 0 0 / 0.16);
  color: var(--color-text);
  background: oklch(100% 0 0 / 0.06);
}

.home-footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem 1rem;
  color: oklch(68% 0.03 255);
  font-size: 0.92rem;
}

.home-footer ul {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0;
  list-style: none;
}

.home-footer li {
  padding: 0.35rem 0.65rem;
  border: 1px solid oklch(100% 0 0 / 0.12);
  border-radius: 999px;
  background: oklch(100% 0 0 / 0.045);
  color: var(--color-muted);
}

@media (max-width: 768px) {
  .hero-title {
    letter-spacing: -0.022em;
  }

  .experience-options {
    grid-template-columns: 1fr;
  }

  .experience-card {
    min-height: 18rem;
  }
}

@media (max-width: 520px) {
  .home-shell {
    width: min(100% - 1rem, 1120px);
    padding-top: 2rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .primary-action {
    width: 100%;
  }

  .experience-card {
    border-radius: 22px;
  }
}
</style>
