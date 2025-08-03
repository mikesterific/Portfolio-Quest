<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content resume-modal">
      <div class="modal-header">
        <h2>📄 Professional Résumé</h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="resume-content">
          <!-- Header Section -->
          <div class="resume-header">
            <h1>{{ resume.name }}</h1>
            <h2>{{ resume.title }}</h2>
            <div class="contact-info">
              <span>📧 {{ resume.email }}</span>
              <span v-if="resume.phone">📞 {{ resume.phone }}</span>
              <span v-if="resume.website">🌐 {{ resume.website }}</span>
            </div>
          </div>
          
          <!-- Summary -->
          <div class="resume-section">
            <h3>Professional Summary</h3>
            <p>{{ resume.summary }}</p>
          </div>
          
          <!-- Experience -->
          <div class="resume-section">
            <h3>Work Experience</h3>
            <div 
              v-for="job in resume.experience" 
              :key="job.id"
              class="experience-item"
            >
              <div class="job-header">
                <h4>{{ job.position }}</h4>
                <span class="job-period">
                  {{ formatDate(job.startDate) }} - {{ job.endDate ? formatDate(job.endDate) : 'Present' }}
                </span>
              </div>
              <div class="company">{{ job.company }}</div>
              <p class="job-description">{{ job.description }}</p>
              <div class="job-technologies">
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
          
          <!-- Education -->
          <div class="resume-section">
            <h3>Education</h3>
            <div 
              v-for="edu in resume.education" 
              :key="edu.id"
              class="education-item"
            >
              <div class="edu-header">
                <h4>{{ edu.degree }} in {{ edu.field }}</h4>
                <span class="edu-period">
                  {{ formatDate(edu.startDate) }} - {{ formatDate(edu.endDate!) }}
                </span>
              </div>
              <div class="institution">{{ edu.institution }}</div>
              <div v-if="edu.gpa" class="gpa">GPA: {{ edu.gpa }}</div>
            </div>
          </div>
          
          <!-- Skills -->
          <div class="resume-section">
            <h3>Technical Skills</h3>
            <div class="skills-grid">
              <div 
                v-for="category in skillCategories" 
                :key="category.name"
                class="skill-category"
              >
                <h4>{{ category.name }}</h4>
                <div class="category-skills">
                  <span 
                    v-for="skill in category.skills" 
                    :key="skill"
                    class="skill-tag"
                  >
                    {{ skill }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="downloadResume">
          📥 Download PDF
        </button>
        <button class="btn btn-primary" @click="$emit('close')">
          Back to Game
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { portfolioData } from '@/data/portfolio'

defineEmits<{
  close: []
}>()

const resume = portfolioData.resume

const skillCategories = computed(() => {
  const categories = [
    { name: 'Frontend', skills: ['Vue.js', 'React', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3'] },
    { name: 'Backend', skills: ['Node.js', 'Express.js', 'Python', 'PostgreSQL', 'MongoDB'] },
    { name: 'Mobile', skills: ['React Native', 'Flutter', 'iOS', 'Android'] },
    { name: 'DevOps', skills: ['Docker', 'AWS', 'CI/CD', 'Kubernetes'] },
    { name: 'Tools', skills: ['Git', 'Figma', 'Jest', 'Webpack', 'Vite'] }
  ]
  return categories
})

function formatDate(dateString: string): string {
  const date = new Date(dateString + '-01') // Add day to YYYY-MM format
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' })
}

function downloadResume(): void {
  // In a real application, this would generate and download a PDF
  console.log('Downloading resume...')
  alert('Resume download feature would be implemented here!')
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
  max-width: 800px;
  width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideIn 0.3s ease-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e1e8ed;
  background: #8e44ad;
  color: white;
  border-radius: 12px 12px 0 0;
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
  padding: 24px;
}

.resume-content {
  line-height: 1.6;
}

.resume-header {
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #e1e8ed;
}

.resume-header h1 {
  margin: 0 0 8px 0;
  font-size: 2.2rem;
  color: #2c3e50;
}

.resume-header h2 {
  margin: 0 0 16px 0;
  font-size: 1.3rem;
  color: #7f8c8d;
  font-weight: normal;
}

.contact-info {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
  color: #34495e;
  font-size: 0.95rem;
}

.resume-section {
  margin-bottom: 32px;
}

.resume-section h3 {
  margin: 0 0 16px 0;
  color: #8e44ad;
  font-size: 1.3rem;
  border-bottom: 2px solid #8e44ad;
  padding-bottom: 4px;
}

.experience-item,
.education-item {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #8e44ad;
}

.job-header,
.edu-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  flex-wrap: wrap;
  gap: 8px;
}

.job-header h4,
.edu-header h4 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.job-period,
.edu-period {
  color: #7f8c8d;
  font-size: 0.9rem;
  font-weight: 500;
}

.company,
.institution {
  color: #34495e;
  font-weight: 600;
  margin-bottom: 8px;
}

.job-description {
  color: #34495e;
  margin: 8px 0 12px 0;
}

.job-technologies {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.tech-tag {
  background: #8e44ad;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
}

.gpa {
  color: #27ae60;
  font-weight: 500;
  font-size: 0.9rem;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.skill-category h4 {
  margin: 0 0 8px 0;
  color: #2c3e50;
  font-size: 1rem;
}

.category-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-tag {
  background: #ecf0f1;
  color: #2c3e50;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.85rem;
  border: 1px solid #bdc3c7;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e1e8ed;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
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
  background: #8e44ad;
  color: white;
}

.btn-primary:hover {
  background: #9b59b6;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background: #7f8c8d;
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
    width: 98%;
    height: 95vh;
    margin: 10px;
  }
  
  .contact-info {
    flex-direction: column;
    gap: 8px;
  }
  
  .job-header,
  .edu-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .skills-grid {
    grid-template-columns: 1fr;
  }
}
</style>