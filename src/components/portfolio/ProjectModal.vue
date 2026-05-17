<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content project-modal" role="dialog" aria-modal="true">
      <button class="close-button" aria-label="Close project details" @click="$emit('close')">
        &times;
      </button>

      <div class="project-artwork">
        <img
          v-if="project?.image && !imageFailed"
          :src="project.image"
          :alt="project?.title ? `${project.title} artwork` : 'Project artwork'"
          @error="imageFailed = true"
        />
        <div v-else class="project-artwork-fallback">
          <span>{{ project?.title }}</span>
        </div>
      </div>

      <article class="project-details">
        <header class="project-header">
          <p class="eyebrow">Museum Exhibit</p>
          <div class="title-row">
            <h2>{{ project?.title }}</h2>
            <span class="type-badge" :class="`type-${project?.type}`">
              {{ formatProjectType(project?.type) }}
            </span>
          </div>
          <p class="project-description">{{ project?.description }}</p>
        </header>

        <section v-if="project?.roles?.length" class="detail-section">
          <h3>Role</h3>
          <div class="tag-list">
            <span v-for="role in project.roles" :key="role" class="role-tag">{{ role }}</span>
          </div>
        </section>

        <section class="detail-section">
          <h3>Tools &amp; Stack</h3>
          <div class="tag-list">
            <span v-for="tech in project?.technologies" :key="tech" class="tech-tag">
              {{ tech }}
            </span>
          </div>
        </section>

        <footer class="project-actions">
          <button class="btn btn-secondary" @click="$emit('close')">Back to Museum</button>
          <a
            v-if="project?.demoUrl && project.demoUrl !== '#'"
            :href="project.demoUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary"
          >
            View Demo
          </a>
          <a
            v-if="project?.githubUrl"
            :href="project.githubUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-primary btn-muted"
          >
            View Code
          </a>
        </footer>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { ProjectData } from "@/types/game";

interface Props {
  project: ProjectData | null;
}

const props = defineProps<Props>();
defineEmits<{
  close: [];
}>();

const imageFailed = ref(false);

watch(
  () => props.project?.image,
  () => {
    imageFailed.value = false;
  },
);

function formatProjectType(type: string | undefined): string {
  if (!type) return "";

  const typeMap: Record<string, string> = {
    web: "Web Application",
    mobile: "Mobile App",
    game: "Game",
    library: "Library/Framework",
  };

  return typeMap[type] || type;
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background:
    radial-gradient(circle at 50% 0%, rgba(96, 165, 250, 0.18), transparent 36rem),
    rgba(3, 7, 18, 0.82);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 32px;
  animation: fadeIn 0.22s ease-out;
  backdrop-filter: blur(16px);
}

.modal-content {
  --surface: rgba(15, 23, 42, 0.94);
  --surface-elevated: rgba(30, 41, 59, 0.84);
  --border: rgba(148, 163, 184, 0.2);
  --text: #f8fafc;
  --text-muted: #cbd5e1;
  --text-soft: #94a3b8;
  --accent: #38bdf8;
  --accent-strong: #0ea5e9;
  --accent-warm: #f59e0b;

  position: relative;
  display: grid;
  grid-template-columns: minmax(280px, 0.95fr) minmax(360px, 1.05fr);
  max-width: min(1040px, 94vw);
  width: 100%;
  max-height: min(760px, 88vh);
  overflow: hidden;
  background:
    linear-gradient(135deg, rgba(56, 189, 248, 0.14), transparent 34%),
    linear-gradient(180deg, var(--surface), rgba(2, 6, 23, 0.96));
  border: 1px solid var(--border);
  border-radius: 28px;
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.48),
    inset 0 1px 0 rgba(255, 255, 255, 0.08);
  animation: slideIn 0.24s ease-out;
}

.close-button {
  position: absolute;
  top: 18px;
  right: 18px;
  z-index: 2;
  background: rgba(15, 23, 42, 0.72);
  border: 1px solid rgba(226, 232, 240, 0.18);
  color: var(--text-muted);
  font-size: 1.35rem;
  cursor: pointer;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition:
    background 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
  backdrop-filter: blur(12px);
}

.close-button:hover {
  background: rgba(30, 41, 59, 0.92);
  color: var(--text);
  transform: scale(1.04);
}

.project-artwork {
  position: relative;
  min-height: 540px;
  overflow: hidden;
  background: linear-gradient(145deg, rgba(14, 165, 233, 0.16), rgba(15, 23, 42, 0.88)), #020617;
}

.project-artwork::after {
  position: absolute;
  inset: auto 0 0;
  height: 42%;
  content: "";
  background: linear-gradient(180deg, transparent, rgba(2, 6, 23, 0.88));
  pointer-events: none;
}

.project-artwork img {
  width: 100%;
  height: 100%;
  min-height: 540px;
  object-fit: cover;
  display: block;
  filter: saturate(0.96) contrast(1.04);
}

.project-artwork-fallback {
  display: grid;
  min-height: 540px;
  place-items: center;
  padding: 32px;
  color: var(--text);
  font-size: clamp(2rem, 5vw, 4rem);
  font-weight: 800;
  line-height: 1;
  text-align: center;
  letter-spacing: -0.06em;
}

.project-details {
  display: flex;
  flex-direction: column;
  gap: 28px;
  min-height: 0;
  overflow-y: auto;
  padding: clamp(28px, 4vw, 56px);
  color: var(--text);
}

.project-header {
  display: grid;
  gap: 18px;
}

.eyebrow {
  margin: 0;
  color: var(--accent);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.title-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.title-row h2 {
  margin: 0;
  color: var(--text);
  font-size: clamp(2rem, 5vw, 4.1rem);
  font-weight: 850;
  line-height: 0.95;
  letter-spacing: -0.065em;
}

.type-badge {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  padding: 7px 11px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.type-web {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.32);
  color: #7dd3fc;
}
.type-mobile {
  background: rgba(216, 180, 254, 0.12);
  border-color: rgba(216, 180, 254, 0.32);
  color: #d8b4fe;
}
.type-game {
  background: rgba(251, 191, 36, 0.14);
  border-color: rgba(251, 191, 36, 0.34);
  color: #fcd34d;
}
.type-library {
  background: rgba(52, 211, 153, 0.12);
  border-color: rgba(52, 211, 153, 0.32);
  color: #6ee7b7;
}

.project-description {
  margin: 0;
  max-width: 62ch;
  color: var(--text-muted);
  font-size: clamp(1rem, 1.6vw, 1.15rem);
  line-height: 1.75;
}

.detail-section {
  display: grid;
  gap: 12px;
}

.detail-section h3 {
  margin: 0;
  color: var(--text-soft);
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.role-tag,
.tech-tag {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  padding: 7px 12px;
  border-radius: 999px;
  font-size: 0.86rem;
  font-weight: 700;
}

.role-tag {
  background: rgba(14, 165, 233, 0.12);
  border: 1px solid rgba(56, 189, 248, 0.22);
  color: #bae6fd;
}

.tech-tag {
  background: var(--surface-elevated);
  border: 1px solid rgba(148, 163, 184, 0.18);
  color: var(--text-muted);
}

.project-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: auto;
  padding-top: 8px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 12px 18px;
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1;
  cursor: pointer;
  text-decoration: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

.btn-primary {
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  color: #03131f;
  box-shadow: 0 12px 28px rgba(14, 165, 233, 0.24);
}

.btn-primary:hover {
  box-shadow: 0 16px 34px rgba(14, 165, 233, 0.3);
}

.btn-secondary {
  background: rgba(15, 23, 42, 0.56);
  border-color: rgba(226, 232, 240, 0.16);
  color: var(--text-muted);
}

.btn-secondary:hover {
  background: rgba(30, 41, 59, 0.84);
  color: var(--text);
}

.btn-muted {
  background: rgba(148, 163, 184, 0.16);
  color: var(--text);
  box-shadow: none;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.985);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 860px) {
  .modal-overlay {
    align-items: flex-end;
    padding: 18px;
  }

  .modal-content {
    grid-template-columns: 1fr;
    max-height: 92vh;
    border-radius: 24px;
    overflow-y: auto;
  }

  .project-artwork,
  .project-artwork img,
  .project-artwork-fallback {
    min-height: 240px;
  }

  .project-details {
    overflow: visible;
    padding: 28px;
  }

  .title-row {
    flex-direction: column;
    align-items: flex-start;
  }

  .project-actions {
    flex-direction: column-reverse;
  }

  .btn {
    width: 100%;
  }
}

@media (prefers-reduced-motion: reduce) {
  .modal-overlay,
  .modal-content {
    animation: none;
  }

  .btn,
  .close-button {
    transition: none;
  }
}
</style>
