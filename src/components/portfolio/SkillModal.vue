<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content skill-modal">
      <div class="modal-header">
        <h2>
          <span class="skill-icon">{{ skill?.icon }}</span>
          {{ skill?.name }}
        </h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="skill-info">
          <div class="skill-category">
            <span class="category-badge" :class="`category-${skill?.category}`">
              {{ formatCategory(skill?.category) }}
            </span>
          </div>
          
          <div class="skill-level">
            <h3>Proficiency Level</h3>
            <div class="level-indicator">
              <div class="level-bar">
                <div 
                  class="level-fill" 
                  :style="{ width: `${(skill?.level || 0) * 20}%` }"
                ></div>
              </div>
              <span class="level-text">{{ getLevelText(skill?.level) }}</span>
            </div>
          </div>
          
          <div class="skill-details">
            <h3>Technologies & Tools</h3>
            <div class="tech-grid">
              <div 
                v-for="tech in getTechnologiesForSkill(skill?.id)" 
                :key="tech"
                class="tech-item"
              >
                {{ tech }}
              </div>
            </div>
          </div>
          
          <div class="related-projects">
            <h3>Related Projects</h3>
            <div class="project-list">
              <div 
                v-for="project in getRelatedProjects(skill?.category)" 
                :key="project.id"
                class="project-card"
                @click="openProject(project.id)"
              >
                <div class="project-title">{{ project.title }}</div>
                <div class="project-type">{{ formatProjectType(project.type) }}</div>
              </div>
            </div>
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
import type { SkillData, ProjectData } from '@/types/game'
import { portfolioData } from '@/data/portfolio'
import gameEventBridge from '@/game/GameEventBridge'

interface Props {
  skill: SkillData | null
}

defineProps<Props>()
defineEmits<{
  close: []
}>()

function formatCategory(category: string | undefined): string {
  if (!category) return ''
  
  const categoryMap: Record<string, string> = {
    'frontend': 'Frontend Development',
    'backend': 'Backend Development',
    'mobile': 'Mobile Development',
    'devops': 'DevOps & Cloud',
    'design': 'UI/UX Design'
  }
  
  return categoryMap[category] || category
}

function getLevelText(level: number | undefined): string {
  if (!level) return 'Beginner'
  
  const levelMap: Record<number, string> = {
    1: 'Beginner',
    2: 'Novice', 
    3: 'Intermediate',
    4: 'Advanced',
    5: 'Expert'
  }
  
  return levelMap[level] || 'Beginner'
}

function getTechnologiesForSkill(skillId: string | undefined): string[] {
  if (!skillId) return []
  
  const techMap: Record<string, string[]> = {
    'frontend': ['Vue.js', 'React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'SCSS', 'Tailwind CSS'],
    'backend': ['Node.js', 'Express.js', 'Python', 'Django', 'FastAPI', 'PostgreSQL', 'MongoDB', 'Redis'],
    'mobile': ['React Native', 'Flutter', 'Swift', 'Kotlin', 'Expo', 'Firebase'],
    'devops': ['Docker', 'AWS', 'Azure', 'CI/CD', 'Kubernetes', 'Terraform', 'Jenkins'],
    'design': ['Figma', 'Adobe XD', 'Sketch', 'Photoshop', 'Design Systems', 'User Research']
  }
  
  return techMap[skillId] || []
}

function getRelatedProjects(category: string | undefined): ProjectData[] {
  if (!category) return []
  
  // Simple mapping - in a real app, you might have more sophisticated filtering
  const categoryProjectMap: Record<string, string[]> = {
    'frontend': ['portfolio-quest', 'data-viz', 'ecommerce-app'],
    'backend': ['ecommerce-app', 'data-viz'],
    'mobile': ['mobile-fitness'],
    'devops': ['ecommerce-app', 'data-viz'],
    'design': ['portfolio-quest', 'mobile-fitness']
  }
  
  const projectIds = categoryProjectMap[category] || []
  return portfolioData.projects.filter(p => projectIds.includes(p.id))
}

function formatProjectType(type: string): string {
  const typeMap: Record<string, string> = {
    'web': 'Web App',
    'mobile': 'Mobile App',
    'game': 'Game',
    'library': 'Library'
  }
  
  return typeMap[type] || type
}

function openProject(projectId: string): void {
  // Close this modal and open project modal
  gameEventBridge.emitGameEvent('game:project-selected', { projectId })
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
  max-width: 700px;
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
  display: flex;
  align-items: center;
  gap: 12px;
}

.skill-icon {
  font-size: 1.8rem;
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

.skill-category {
  margin-bottom: 24px;
}

.category-badge {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.category-frontend { background: #e3f2fd; color: #1976d2; }
.category-backend { background: #f3e5f5; color: #7b1fa2; }
.category-mobile { background: #fff3e0; color: #f57c00; }
.category-devops { background: #e8f5e8; color: #388e3c; }
.category-design { background: #fce4ec; color: #c2185b; }

.skill-level {
  margin-bottom: 24px;
}

.skill-level h3 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.level-indicator {
  display: flex;
  align-items: center;
  gap: 16px;
}

.level-bar {
  flex: 1;
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.level-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2ecc71);
  border-radius: 6px;
  transition: width 0.5s ease-out;
}

.level-text {
  font-weight: 600;
  color: #2c3e50;
  min-width: 80px;
}

.skill-details {
  margin-bottom: 24px;
}

.skill-details h3 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
}

.tech-item {
  background: #f8f9fa;
  color: #495057;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  border: 1px solid #e9ecef;
  text-align: center;
}

.related-projects h3 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.project-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}

.project-card {
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
}

.project-card:hover {
  background: #e9ecef;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.project-type {
  font-size: 0.85rem;
  color: #6c757d;
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
  background: #9b59b6;
  color: white;
}

.btn-primary:hover {
  background: #8e44ad;
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
  
  .tech-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .project-list {
    grid-template-columns: 1fr;
  }
}
</style>