<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content traditional-portfolio">
      <div class="modal-header">
        <h2>📋 Traditional Portfolio View</h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="portfolio-content">
          <nav class="portfolio-nav">
            <button 
              v-for="section in sections" 
              :key="section.id"
              :class="['nav-button', { active: activeSection === section.id }]"
              @click="activeSection = section.id"
            >
              {{ section.icon }} {{ section.name }}
            </button>
          </nav>
          
          <div class="portfolio-section">
            <!-- About Section -->
            <div v-if="activeSection === 'about'" class="section-content">
              <h3>About Me</h3>
              <div class="about-content">
                <p>{{ resume.summary }}</p>
                <div class="quick-stats">
                  <div class="stat">
                    <strong>{{ resume.experience.length }}+</strong>
                    <span>Years Experience</span>
                  </div>
                  <div class="stat">
                    <strong>{{ portfolioData.projects.length }}+</strong>
                    <span>Projects Completed</span>
                  </div>
                  <div class="stat">
                    <strong>{{ portfolioData.skills.length }}+</strong>
                    <span>Core Skills</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Skills Section -->
            <div v-if="activeSection === 'skills'" class="section-content">
              <h3>Technical Skills</h3>
              <div class="skills-categories">
                <div 
                  v-for="category in skillCategories" 
                  :key="category.name"
                  class="skill-category-card"
                >
                  <h4>{{ category.icon }} {{ category.name }}</h4>
                  <div class="skills-list">
                    <span 
                      v-for="skill in category.technologies" 
                      :key="skill"
                      class="skill-badge"
                    >
                      {{ skill }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Projects Section -->
            <div v-if="activeSection === 'projects'" class="section-content">
              <h3>Featured Projects</h3>
              <div class="projects-grid">
                <div 
                  v-for="project in portfolioData.projects" 
                  :key="project.id"
                  class="project-card"
                >
                  <div class="project-header">
                    <h4>{{ project.title }}</h4>
                    <span class="project-type">{{ formatProjectType(project.type) }}</span>
                  </div>
                  <p class="project-description">{{ project.description }}</p>
                  <div class="project-tech">
                    <span 
                      v-for="tech in project.technologies.slice(0, 3)" 
                      :key="tech"
                      class="tech-tag"
                    >
                      {{ tech }}
                    </span>
                    <span v-if="project.technologies.length > 3" class="tech-more">
                      +{{ project.technologies.length - 3 }} more
                    </span>
                  </div>
                  <div class="project-links">
                    <a 
                      v-if="project.demoUrl && project.demoUrl !== '#'" 
                      :href="project.demoUrl" 
                      target="_blank"
                      class="project-link"
                    >
                      🌐 Demo
                    </a>
                    <a 
                      v-if="project.githubUrl" 
                      :href="project.githubUrl" 
                      target="_blank"
                      class="project-link"
                    >
                      📂 Code
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Experience Section -->
            <div v-if="activeSection === 'experience'" class="section-content">
              <h3>Work Experience</h3>
              <div class="timeline">
                <div 
                  v-for="job in resume.experience" 
                  :key="job.id"
                  class="timeline-item"
                >
                  <div class="timeline-date">
                    {{ formatDate(job.startDate) }} - {{ job.endDate ? formatDate(job.endDate) : 'Present' }}
                  </div>
                  <div class="timeline-content">
                    <h4>{{ job.position }}</h4>
                    <h5>{{ job.company }}</h5>
                    <p>{{ job.description }}</p>
                    <div class="job-tech">
                      <span 
                        v-for="tech in job.technologies" 
                        :key="tech"
                        class="tech-tag"
                      >
                        {{ tech }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Contact Section -->
            <div v-if="activeSection === 'contact'" class="section-content">
              <h3>Get In Touch</h3>
              <div class="contact-grid">
                <div class="contact-info">
                  <div class="contact-item">
                    <span class="contact-icon">📧</span>
                    <div>
                      <strong>Email</strong>
                      <a :href="`mailto:${resume.email}`">{{ resume.email }}</a>
                    </div>
                  </div>
                  <div v-if="resume.phone" class="contact-item">
                    <span class="contact-icon">📞</span>
                    <div>
                      <strong>Phone</strong>
                      <span>{{ resume.phone }}</span>
                    </div>
                  </div>
                  <div v-if="resume.website" class="contact-item">
                    <span class="contact-icon">🌐</span>
                    <div>
                      <strong>Website</strong>
                      <a :href="resume.website" target="_blank">{{ resume.website }}</a>
                    </div>
                  </div>
                </div>
                
                <div class="cta-section">
                  <h4>Ready to work together?</h4>
                  <p>I'm always interested in new opportunities and exciting projects.</p>
                  <button class="btn btn-primary" @click="openContact">
                    💬 Start a Conversation
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-game" @click="$emit('close')">
          🎮 Back to Game
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { portfolioData } from '@/data/portfolio'
import gameEventBridge from '@/game/GameEventBridge'

defineEmits<{
  close: []
}>()

const activeSection = ref('about')
const resume = portfolioData.resume

const sections = [
  { id: 'about', name: 'About', icon: '👋' },
  { id: 'skills', name: 'Skills', icon: '🛠️' },
  { id: 'projects', name: 'Projects', icon: '💼' },
  { id: 'experience', name: 'Experience', icon: '🏢' },
  { id: 'contact', name: 'Contact', icon: '📧' }
]

const skillCategories = computed(() => [
  { name: 'Frontend', icon: '💻', technologies: ['Vue.js', 'React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3'] },
  { name: 'Backend', icon: '⚙️', technologies: ['Node.js', 'Express.js', 'Python', 'PostgreSQL', 'MongoDB'] },
  { name: 'Mobile', icon: '📱', technologies: ['React Native', 'Flutter', 'iOS', 'Android'] },
  { name: 'DevOps', icon: '🚀', technologies: ['Docker', 'AWS', 'CI/CD', 'Kubernetes'] }
])

function formatProjectType(type: string): string {
  const typeMap: Record<string, string> = {
    'web': 'Web App',
    'mobile': 'Mobile App',
    'game': 'Game',
    'library': 'Library'
  }
  return typeMap[type] || type
}

function formatDate(dateString: string): string {
  const date = new Date(dateString + '-01')
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

function openContact(): void {
  gameEventBridge.emitGameEvent('game:contact-opened', undefined)
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease-out;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  max-width: 1000px;
  width: 95%;
  max-height: 95vh;
  overflow: hidden;
  animation: slideIn 0.3s ease-out;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e1e8ed;
  background: #34495e;
  color: white;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: white;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.close-button:hover {
  background: rgba(255, 255, 255, 0.2);
}

.modal-body {
  flex: 1;
  overflow: hidden;
}

.portfolio-content {
  display: flex;
  height: 100%;
}

.portfolio-nav {
  width: 200px;
  background: #f8f9fa;
  border-right: 1px solid #e1e8ed;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.nav-button {
  background: none;
  border: none;
  padding: 12px 20px;
  text-align: left;
  cursor: pointer;
  color: #34495e;
  font-size: 0.95rem;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.nav-button:hover {
  background: #e9ecef;
}

.nav-button.active {
  background: #34495e;
  color: white;
  border-left-color: #3498db;
}

.portfolio-section {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.section-content h3 {
  margin: 0 0 24px 0;
  color: #2c3e50;
  font-size: 1.8rem;
  border-bottom: 3px solid #3498db;
  padding-bottom: 8px;
}

.about-content p {
  font-size: 1.1rem;
  line-height: 1.7;
  color: #34495e;
  margin-bottom: 32px;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
}

.stat {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border-top: 4px solid #3498db;
}

.stat strong {
  display: block;
  font-size: 1.8rem;
  color: #2c3e50;
  margin-bottom: 4px;
}

.stat span {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.skills-categories {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.skill-category-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border-left: 4px solid #3498db;
}

.skill-category-card h4 {
  margin: 0 0 16px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.skills-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill-badge {
  background: #3498db;
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.project-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  border-top: 4px solid #3498db;
  transition: transform 0.2s;
}

.project-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.project-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.project-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.project-type {
  background: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.project-description {
  color: #34495e;
  margin-bottom: 16px;
  line-height: 1.5;
}

.project-tech {
  margin-bottom: 16px;
}

.tech-tag {
  background: #34495e;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin-right: 6px;
  margin-bottom: 6px;
  display: inline-block;
}

.tech-more {
  color: #7f8c8d;
  font-size: 0.8rem;
}

.project-links {
  display: flex;
  gap: 10px;
}

.project-link {
  color: #3498db;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.project-link:hover {
  text-decoration: underline;
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 15px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #3498db;
}

.timeline-item {
  position: relative;
  margin-bottom: 32px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -25px;
  top: 5px;
  width: 12px;
  height: 12px;
  background: #3498db;
  border-radius: 50%;
}

.timeline-date {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin-bottom: 8px;
}

.timeline-content h4 {
  margin: 0 0 4px 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.timeline-content h5 {
  margin: 0 0 8px 0;
  color: #34495e;
  font-weight: 600;
}

.timeline-content p {
  color: #34495e;
  margin-bottom: 12px;
  line-height: 1.5;
}

.job-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.contact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.contact-icon {
  font-size: 1.5rem;
  min-width: 32px;
}

.contact-item strong {
  display: block;
  color: #2c3e50;
  margin-bottom: 4px;
}

.contact-item a {
  color: #3498db;
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
}

.cta-section {
  background: #f8f9fa;
  padding: 24px;
  border-radius: 8px;
  text-align: center;
  border-left: 4px solid #3498db;
}

.cta-section h4 {
  margin: 0 0 12px 0;
  color: #2c3e50;
}

.cta-section p {
  color: #34495e;
  margin-bottom: 20px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e1e8ed;
  display: flex;
  justify-content: center;
}

.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
  transform: translateY(-1px);
}

.btn-game {
  background: #34495e;
  color: white;
  font-size: 1.1rem;
}

.btn-game:hover {
  background: #2c3e50;
  transform: translateY(-1px);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideIn {
  from { 
    opacity: 0;
    transform: scale(0.9);
  }
  to { 
    opacity: 1;
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .portfolio-content {
    flex-direction: column;
  }
  
  .portfolio-nav {
    width: 100%;
    flex-direction: row;
    overflow-x: auto;
    padding: 10px;
  }
  
  .nav-button {
    min-width: 120px;
    text-align: center;
    border-left: none;
    border-bottom: 3px solid transparent;
  }
  
  .nav-button.active {
    border-left: none;
    border-bottom-color: #3498db;
  }
  
  .contact-grid {
    grid-template-columns: 1fr;
  }
}
</style>