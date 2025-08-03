<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content project-modal">
      <div class="modal-header">
        <h2>{{ project?.title }}</h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="project-info">
          <div class="project-type">
            <span class="type-badge" :class="`type-${project?.type}`">
              {{ formatProjectType(project?.type) }}
            </span>
          </div>
          
          <p class="project-description">{{ project?.description }}</p>
          
          <div class="technologies">
            <h3>Technologies Used</h3>
            <div class="tech-list">
              <span 
                v-for="tech in project?.technologies" 
                :key="tech"
                class="tech-tag"
              >
                {{ tech }}
              </span>
            </div>
          </div>
          
          <div class="project-links">
            <a 
              v-if="project?.demoUrl && project.demoUrl !== '#'" 
              :href="project.demoUrl" 
              target="_blank"
              class="project-link demo-link"
            >
              🌐 View Demo
            </a>
            <a 
              v-if="project?.githubUrl" 
              :href="project.githubUrl" 
              target="_blank"
              class="project-link github-link"
            >
              📂 View Code
            </a>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-primary" @click="$emit('close')">
          Back to Game
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ProjectData } from '@/types/game'

interface Props {
  project: ProjectData | null
}

defineProps<Props>()
defineEmits<{
  close: []
}>()

function formatProjectType(type: string | undefined): string {
  if (!type) return ''
  
  const typeMap: Record<string, string> = {
    'web': 'Web Application',
    'mobile': 'Mobile App', 
    'game': 'Game',
    'library': 'Library/Framework'
  }
  
  return typeMap[type] || type
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e1e8ed;
}

.modal-header h2 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #95a5a6;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-button:hover {
  background: #f8f9fa;
  color: #e74c3c;
}

.modal-body {
  padding: 24px;
}

.project-type {
  margin-bottom: 16px;
}

.type-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.type-web { background: #e3f2fd; color: #1976d2; }
.type-mobile { background: #f3e5f5; color: #7b1fa2; }
.type-game { background: #fff3e0; color: #f57c00; }
.type-library { background: #e8f5e8; color: #388e3c; }

.project-description {
  font-size: 1rem;
  line-height: 1.6;
  color: #34495e;
  margin-bottom: 24px;
}

.technologies h3 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 24px;
}

.tech-tag {
  background: #f8f9fa;
  color: #495057;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  border: 1px solid #e9ecef;
}

.project-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.project-link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s;
}

.demo-link {
  background: #3498db;
  color: white;
}

.demo-link:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.github-link {
  background: #34495e;
  color: white;
}

.github-link:hover {
  background: #2c3e50;
  transform: translateY(-1px);
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e1e8ed;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #e74c3c;
  color: white;
}

.btn-primary:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: translateY(-20px);
  }
  to { 
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }
  
  .project-links {
    flex-direction: column;
  }
  
  .project-link {
    justify-content: center;
  }
}
</style>