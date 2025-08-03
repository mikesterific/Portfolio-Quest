<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content contact-modal">
      <div class="modal-header">
        <h2>📧 Get In Touch</h2>
        <button class="close-button" @click="$emit('close')">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="contact-content">
          <div class="contact-intro">
            <p>
              I'm always interested in new opportunities, collaborations, and interesting projects. 
              Feel free to reach out if you'd like to work together or just have a chat!
            </p>
          </div>
          
          <div class="contact-methods">
            <h3>Contact Information</h3>
            <div class="contact-list">
              <div class="contact-item">
                <span class="contact-icon">📧</span>
                <div class="contact-details">
                  <strong>Email</strong>
                  <a href="mailto:your.email@example.com">your.email@example.com</a>
                </div>
              </div>
              
              <div class="contact-item">
                <span class="contact-icon">💼</span>
                <div class="contact-details">
                  <strong>LinkedIn</strong>
                  <a href="https://linkedin.com/in/yourprofile" target="_blank">linkedin.com/in/yourprofile</a>
                </div>
              </div>
              
              <div class="contact-item">
                <span class="contact-icon">🐙</span>
                <div class="contact-details">
                  <strong>GitHub</strong>
                  <a href="https://github.com/yourusername" target="_blank">github.com/yourusername</a>
                </div>
              </div>
              
              <div class="contact-item">
                <span class="contact-icon">🌐</span>
                <div class="contact-details">
                  <strong>Portfolio</strong>
                  <a href="https://yourportfolio.com" target="_blank">yourportfolio.com</a>
                </div>
              </div>
            </div>
          </div>
          
          <div class="contact-form">
            <h3>Send a Message</h3>
            <form @submit.prevent="sendMessage">
              <div class="form-group">
                <label for="name">Name</label>
                <input 
                  id="name"
                  v-model="form.name" 
                  type="text" 
                  required
                  placeholder="Your name"
                />
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input 
                  id="email"
                  v-model="form.email" 
                  type="email" 
                  required
                  placeholder="your.email@example.com"
                />
              </div>
              
              <div class="form-group">
                <label for="subject">Subject</label>
                <input 
                  id="subject"
                  v-model="form.subject" 
                  type="text" 
                  required
                  placeholder="What's this about?"
                />
              </div>
              
              <div class="form-group">
                <label for="message">Message</label>
                <textarea 
                  id="message"
                  v-model="form.message" 
                  required
                  rows="5"
                  placeholder="Tell me about your project, idea, or just say hello!"
                ></textarea>
              </div>
              
              <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
                <span v-if="isSubmitting">Sending...</span>
                <span v-else>🚀 Send Message</span>
              </button>
            </form>
          </div>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">
          Back to Game
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

defineEmits<{
  close: []
}>()

const isSubmitting = ref(false)

const form = reactive({
  name: '',
  email: '',
  subject: '',
  message: ''
})

async function sendMessage(): Promise<void> {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    // In a real application, you would send this to your backend
    console.log('Sending message:', form)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    alert('Message sent successfully! I\'ll get back to you soon.')
    
    // Reset form
    Object.assign(form, {
      name: '',
      email: '',
      subject: '',
      message: ''
    })
  } catch (error) {
    console.error('Error sending message:', error)
    alert('Sorry, there was an error sending your message. Please try emailing me directly.')
  } finally {
    isSubmitting.value = false
  }
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
  background: #e74c3c;
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

.contact-intro {
  margin-bottom: 32px;
  text-align: center;
}

.contact-intro p {
  font-size: 1.1rem;
  color: #34495e;
  line-height: 1.6;
  margin: 0;
}

.contact-methods {
  margin-bottom: 32px;
}

.contact-methods h3 {
  margin: 0 0 16px 0;
  color: #e74c3c;
  font-size: 1.3rem;
  border-bottom: 2px solid #e74c3c;
  padding-bottom: 4px;
}

.contact-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #e74c3c;
}

.contact-icon {
  font-size: 1.5rem;
  min-width: 32px;
}

.contact-details strong {
  display: block;
  color: #2c3e50;
  margin-bottom: 4px;
}

.contact-details a {
  color: #e74c3c;
  text-decoration: none;
  font-size: 0.9rem;
}

.contact-details a:hover {
  text-decoration: underline;
}

.contact-form h3 {
  margin: 0 0 16px 0;
  color: #e74c3c;
  font-size: 1.3rem;
  border-bottom: 2px solid #e74c3c;
  padding-bottom: 4px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #2c3e50;
  font-weight: 500;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e8ed;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.2s;
  font-family: inherit;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #e74c3c;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e1e8ed;
  display: flex;
  justify-content: flex-end;
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

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #e74c3c;
  color: white;
  margin-bottom: 16px;
}

.btn-primary:hover:not(:disabled) {
  background: #c0392b;
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
  
  .contact-list {
    grid-template-columns: 1fr;
  }
  
  .contact-item {
    flex-direction: column;
    text-align: center;
    gap: 8px;
  }
}
</style>