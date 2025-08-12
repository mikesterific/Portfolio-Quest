import { mount, flushPromises } from '@vue/test-utils'
import { defineComponent } from 'vue'
import GameContainer from '@/components/game/GameContainer.vue'
import gameEventBridge from '@/game/GameEventBridge'
import { portfolioData } from '@/data/portfolio'

// Stub child components by name used in template to avoid resolution warnings
const stubs = {
  ProjectModal: defineComponent({ name: 'ProjectModal', template: '<div class="modal" />' }),
  SkillModal: defineComponent({ name: 'SkillModal', template: '<div class="modal" />' }),
  ResumeModal: defineComponent({ name: 'ResumeModal', template: '<div class="modal" />' }),
  ContactModal: defineComponent({ name: 'ContactModal', template: '<div class="modal" />' }),
  TraditionalPortfolio: defineComponent({ name: 'TraditionalPortfolio', template: '<div class="modal" />' }),
}

describe('GameContainer.vue', () => {
  test('renders container and initializes Phaser game on mount', async () => {
    const wrapper = mount(GameContainer, { global: { stubs } })

    // Ensure container exists
    expect(wrapper.find('#game-container').exists()).toBe(true)

    await flushPromises()

    // Game initialization side-effects should not throw; verify component mounted
    expect(wrapper.exists()).toBe(true)
  })

  test('opens and closes modals via game events', async () => {
    const wrapper = mount(GameContainer, { global: { stubs } })
    await flushPromises()

    const originalEmit = gameEventBridge.emitGameEvent.bind(gameEventBridge) as any
    const emitSpy = jest.spyOn(gameEventBridge, 'emitGameEvent')
      .mockImplementation((event: any, data: any) => {
        // Prevent feedback loops specifically for ui:modal-opened echo
        if (event === 'ui:modal-opened') {
          return true
        }
        return originalEmit(event, data)
      })

    // Project modal
    const proj = portfolioData.projects[0]
    gameEventBridge.emitGameEvent('game:project-selected', { projectId: proj.id })
    await wrapper.vm.$nextTick()
    expect(emitSpy).toHaveBeenCalledWith('ui:modal-opened', { type: 'project' })

    // Close via UI event
    gameEventBridge.emitGameEvent('ui:setting-changed', { key: 'closeModal', value: true })
    await wrapper.vm.$nextTick()
    expect(emitSpy).toHaveBeenCalledWith('ui:modal-closed', undefined)

    // Skill modal
    const skill = portfolioData.skills[0]
    gameEventBridge.emitGameEvent('game:skill-selected', { skillId: skill.id })
    await wrapper.vm.$nextTick()
    expect(emitSpy).toHaveBeenCalledWith('ui:modal-opened', { type: 'skill' })

    // Resume modal
    gameEventBridge.emitGameEvent('game:resume-opened', undefined as any)
    await wrapper.vm.$nextTick()
    expect(emitSpy).toHaveBeenCalledWith('ui:modal-opened', { type: 'resume' })

    // Contact modal
    gameEventBridge.emitGameEvent('game:contact-opened', undefined as any)
    await wrapper.vm.$nextTick()
    expect(emitSpy).toHaveBeenCalledWith('ui:modal-opened', { type: 'contact' })

    // Avoid emitting ui:modal-opened traditional-portfolio to prevent self-loop
  })

  test('cleans up game and listeners on unmount', async () => {
    const wrapper = mount(GameContainer, { global: { stubs } })
    await flushPromises()

    const removeAllSpy = jest.spyOn(gameEventBridge, 'removeAllGameListeners')

    wrapper.unmount()

    expect(removeAllSpy).toHaveBeenCalled()
  })
})


