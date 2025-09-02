import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals'
import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import MuseumView from '@/views/MuseumView.vue'

// Mock the SpaceMuseum component
const MockSpaceMuseum = {
  name: 'SpaceMuseum',
  props: ['modalOpen'],
  emits: ['project-selected', 'exit-museum'],
  template: '<div class="mock-space-museum" data-testid="space-museum">Mock Space Museum</div>'
}

// Mock the ProjectModal component
const MockProjectModal = {
  name: 'ProjectModal',
  props: ['project'],
  emits: ['close'],
  template: `
    <div v-if="project" class="mock-project-modal" data-testid="project-modal">
      <div>Mock Project Modal: {{ project.title }}</div>
      <button @click="$emit('close')" data-testid="close-button">Close</button>
    </div>
  `
}

// Mock portfolio data functions
jest.mock('@/data/portfolio', () => ({
  getProjectById: jest.fn((id: string) => {
    if (id === 'test-project-1') {
      return {
        id,
        title: `Test Project ${id}`,
        description: 'Test description',
        technologies: ['Vue', 'TypeScript']
      }
    }
    return null
  })
}))

// Mock router
const mockPush = jest.fn()
jest.mock('vue-router', () => ({
  useRouter: () => ({
    push: mockPush
  })
}))

describe('MuseumView Component', () => {
  let wrapper: VueWrapper<any>

  beforeEach(() => {
    jest.clearAllMocks()
    // Mock DOM methods
    jest.spyOn(document, 'addEventListener').mockImplementation(() => {})
    jest.spyOn(document, 'removeEventListener').mockImplementation(() => {})
  })

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
    jest.clearAllMocks()
  })

  describe('Component Mounting', () => {
    it('should mount successfully', () => {
      wrapper = mount(MuseumView, {
        global: {
          components: {
            SpaceMuseum: MockSpaceMuseum,
            ProjectModal: MockProjectModal
          }
        }
      })
      expect(wrapper.exists()).toBe(true)
    })

    it('should render SpaceMuseum component', () => {
      wrapper = mount(MuseumView, {
        global: {
          components: {
            SpaceMuseum: MockSpaceMuseum,
            ProjectModal: MockProjectModal
          }
        }
      })
      expect(wrapper.find('[data-testid="space-museum"]').exists()).toBe(true)
    })

    it('should not show ProjectModal initially', () => {
      wrapper = mount(MuseumView, {
        global: {
          components: {
            SpaceMuseum: MockSpaceMuseum,
            ProjectModal: MockProjectModal
          }
        }
      })
      expect(wrapper.find('[data-testid="project-modal"]').exists()).toBe(false)
    })

    it('should initialize with correct default state', () => {
      wrapper = mount(MuseumView, {
        global: {
          components: {
            SpaceMuseum: MockSpaceMuseum,
            ProjectModal: MockProjectModal
          }
        }
      })
      const vm = wrapper.vm as any
      expect(vm.selectedProject).toBeNull()
      expect(vm.isClosing).toBe(false)
    })
  })

  describe('Project Selection', () => {
    beforeEach(() => {
      wrapper = mount(MuseumView, {
        global: {
          components: {
            SpaceMuseum: MockSpaceMuseum,
            ProjectModal: MockProjectModal
          }
        }
      })
    })

    it('should handle project-selected event', async () => {
      const spaceMuseum = wrapper.findComponent({ name: 'SpaceMuseum' })
      
      await spaceMuseum.vm.$emit('project-selected', { projectId: 'test-project-1' })
      await nextTick()
      
      const vm = wrapper.vm as any
      expect(vm.selectedProject).toBeDefined()
      expect(vm.selectedProject.id).toBe('test-project-1')
      expect(vm.selectedProject.title).toBe('Test Project test-project-1')
    })

    it('should show ProjectModal when project is selected', async () => {
      const spaceMuseum = wrapper.findComponent({ name: 'SpaceMuseum' })
      
      await spaceMuseum.vm.$emit('project-selected', { projectId: 'test-project-1' })
      await nextTick()
      
      const projectModal = wrapper.find('[data-testid="project-modal"]')
      expect(projectModal.exists()).toBe(true)
      expect(projectModal.text()).toContain('Test Project test-project-1')
    })

    it('should pass modalOpen prop to SpaceMuseum when modal is open', async () => {
      const spaceMuseum = wrapper.findComponent({ name: 'SpaceMuseum' })
      
      // Initially modal should not be open
      expect(spaceMuseum.props('modalOpen')).toBe(false)
      
      await spaceMuseum.vm.$emit('project-selected', { projectId: 'test-project-1' })
      await nextTick()
      
      // After project selection, modal should be open
      expect(spaceMuseum.props('modalOpen')).toBe(true)
    })

    it('should handle invalid project ID gracefully', async () => {
      const spaceMuseum = wrapper.findComponent({ name: 'SpaceMuseum' })
      
      await spaceMuseum.vm.$emit('project-selected', { projectId: 'invalid-id' })
      await nextTick()
      
      const vm = wrapper.vm as any
      expect(vm.selectedProject).toBeNull()
      expect(wrapper.find('[data-testid="project-modal"]').exists()).toBe(false)
    })

    it('should handle missing projectId in event', async () => {
      const spaceMuseum = wrapper.findComponent({ name: 'SpaceMuseum' })
      
      await spaceMuseum.vm.$emit('project-selected', {})
      await nextTick()
      
      const vm = wrapper.vm as any
      expect(vm.selectedProject).toBeNull()
    })

    it('should not select project when isClosing is true', async () => {
      const vm = wrapper.vm as any
      vm.isClosing = true
      
      const spaceMuseum = wrapper.findComponent({ name: 'SpaceMuseum' })
      await spaceMuseum.vm.$emit('project-selected', { projectId: 'test-project-1' })
      await nextTick()
      
      expect(vm.selectedProject).toBeNull()
    })
  })

  describe('Project Modal Closing', () => {
    beforeEach(async () => {
      wrapper = mount(MuseumView, {
        global: {
          components: {
            SpaceMuseum: MockSpaceMuseum,
            ProjectModal: MockProjectModal
          }
        }
      })
      const spaceMuseum = wrapper.findComponent({ name: 'SpaceMuseum' })
      await spaceMuseum.vm.$emit('project-selected', { projectId: 'test-project-1' })
      await nextTick()
    })

    it('should close modal when ProjectModal emits close event', async () => {
      const closeButton = wrapper.find('[data-testid="close-button"]')
      expect(closeButton.exists()).toBe(true)
      
      await closeButton.trigger('click')
      await nextTick()
      
      const vm = wrapper.vm as any
      expect(vm.selectedProject).toBeNull()
      expect(vm.isClosing).toBe(true)
    })

    it('should reset isClosing after delay', async () => {
      jest.useFakeTimers()
      
      const closeButton = wrapper.find('[data-testid="close-button"]')
      await closeButton.trigger('click')
      await nextTick()
      
      const vm = wrapper.vm as any
      expect(vm.isClosing).toBe(true)
      
      // Fast-forward time
      jest.advanceTimersByTime(300)
      await nextTick()
      
      expect(vm.isClosing).toBe(false)
      
      jest.useRealTimers()
    })

    it('should pass isClosing state to SpaceMuseum modalOpen prop', async () => {
      const closeButton = wrapper.find('[data-testid="close-button"]')
      await closeButton.trigger('click')
      await nextTick()
      
      const spaceMuseum = wrapper.findComponent({ name: 'SpaceMuseum' })
      expect(spaceMuseum.props('modalOpen')).toBe(true) // Still true because isClosing is true
    })
  })

  describe('ESC Key Handling', () => {
    beforeEach(async () => {
      wrapper = mount(MuseumView, {
        global: {
          components: {
            SpaceMuseum: MockSpaceMuseum,
            ProjectModal: MockProjectModal
          }
        }
      })
      const spaceMuseum = wrapper.findComponent({ name: 'SpaceMuseum' })
      await spaceMuseum.vm.$emit('project-selected', { projectId: 'test-project-1' })
      await nextTick()
    })

    it('should close modal on ESC key press', async () => {
      const vm = wrapper.vm as any
      expect(vm.selectedProject).toBeDefined()
      
      // Simulate ESC key press
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escEvent)
      await nextTick()
      
      expect(vm.selectedProject).toBeNull()
    })

    it('should not close modal on other key presses', async () => {
      const vm = wrapper.vm as any
      expect(vm.selectedProject).toBeDefined()
      
      // Simulate other key press
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' })
      document.dispatchEvent(enterEvent)
      await nextTick()
      
      expect(vm.selectedProject).toBeDefined() // Should still be open
    })

    it('should add and remove ESC key listener on mount/unmount', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener')
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
      
      const testWrapper = mount(MuseumView, {
        global: {
          components: {
            SpaceMuseum: MockSpaceMuseum,
            ProjectModal: MockProjectModal
          }
        }
      })
      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      
      testWrapper.unmount()
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('Museum Exit', () => {
    beforeEach(() => {
      wrapper = mount(MuseumView, {
        global: {
          components: {
            SpaceMuseum: MockSpaceMuseum,
            ProjectModal: MockProjectModal
          }
        }
      })
    })

    it('should handle exit-museum event', async () => {
      const spaceMuseum = wrapper.findComponent({ name: 'SpaceMuseum' })
      
      await spaceMuseum.vm.$emit('exit-museum')
      await nextTick()
      
      expect(mockPush).toHaveBeenCalledWith('/')
    })

    it('should navigate to home page on museum exit', async () => {
      const spaceMuseum = wrapper.findComponent({ name: 'SpaceMuseum' })
      
      await spaceMuseum.vm.$emit('exit-museum')
      
      expect(mockPush).toHaveBeenCalledWith('/')
    })
  })

  describe('Component State Management', () => {
    beforeEach(() => {
      wrapper = mount(MuseumView, {
        global: {
          components: {
            SpaceMuseum: MockSpaceMuseum,
            ProjectModal: MockProjectModal
          }
        }
      })
    })

    it('should maintain correct state transitions', async () => {
      const vm = wrapper.vm as any
      const spaceMuseum = wrapper.findComponent({ name: 'SpaceMuseum' })
      
      // Initial state
      expect(vm.selectedProject).toBeNull()
      expect(vm.isClosing).toBe(false)
      expect(spaceMuseum.props('modalOpen')).toBe(false)
      
      // Select project
      await spaceMuseum.vm.$emit('project-selected', { projectId: 'test-project-1' })
      await nextTick()
      
      expect(vm.selectedProject).toBeDefined()
      expect(vm.isClosing).toBe(false)
      expect(spaceMuseum.props('modalOpen')).toBe(true)
      
      // Close project
      const closeButton = wrapper.find('[data-testid="close-button"]')
      await closeButton.trigger('click')
      await nextTick()
      
      expect(vm.selectedProject).toBeNull()
      expect(vm.isClosing).toBe(true)
      expect(spaceMuseum.props('modalOpen')).toBe(true) // Still true due to isClosing
    })
  })

  describe('Component Lifecycle', () => {
    it('should clean up event listeners on unmount', () => {
      const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener')
      
      const testWrapper = mount(MuseumView, {
        global: {
          components: {
            SpaceMuseum: MockSpaceMuseum,
            ProjectModal: MockProjectModal
          }
        }
      })
      testWrapper.unmount()
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
    })
  })

  describe('Component Structure', () => {
    beforeEach(() => {
      wrapper = mount(MuseumView, {
        global: {
          components: {
            SpaceMuseum: MockSpaceMuseum,
            ProjectModal: MockProjectModal
          }
        }
      })
    })

    it('should have the correct CSS classes', () => {
      expect(wrapper.find('.museum-view').exists()).toBe(true)
    })

    it('should render components in correct order', () => {
      const spaceMuseum = wrapper.find('[data-testid="space-museum"]')
      expect(spaceMuseum.exists()).toBe(true)
      
      // Modal should not exist initially
      expect(wrapper.find('[data-testid="project-modal"]').exists()).toBe(false)
    })
  })
})
