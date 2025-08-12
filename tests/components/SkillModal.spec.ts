import { mount } from '@vue/test-utils'
import SkillModal from '@/components/portfolio/SkillModal.vue'
import gameEventBridge from '@/game/GameEventBridge'
import { portfolioData } from '@/data/portfolio'

const makeSkill = () => ({
  id: 'frontend',
  name: 'Front-End',
  icon: '🎯',
  level: 3,
  category: 'frontend',
  description: 'Building UI with modern frameworks',
})

describe('SkillModal.vue', () => {
  test('renders telemetry, header, category, description and proficiency', () => {
    const wrapper = mount(SkillModal, { props: { skill: makeSkill() } })

    // Telemetry values
    const telemetry = wrapper.find('.telemetry')
    expect(telemetry.text()).toContain('0.2 m/s')
    expect(telemetry.text()).toContain('92%')

    // Header icon and name
    expect(wrapper.find('.card-header .icon').text()).toBe('🎯')
    expect(wrapper.find('.card-header h2').text()).toBe('Front-End')

    // Category formatted
    expect(wrapper.find('.category-btn').text()).toBe('Front-End Development')

    // Description
    expect(wrapper.find('.description').text()).toContain('Building UI with modern frameworks')

    // Proficiency text and progress width
    expect(wrapper.find('.proficiency .level').text()).toBe('Intermediate')
    const pf = wrapper.find('.progress-fill')
    expect((pf.element as HTMLElement).getAttribute('style') || '').toContain('width: 60%')
  })

  test('radar blips render up to 6 for rich skill', () => {
    const wrapper = mount(SkillModal, { props: { skill: makeSkill() } })
    const blips = wrapper.findAll('.radar .blip')
    expect(blips.length).toBe(6)
  })

  test('tags and related projects render and clicking a project emits bridge event', async () => {
    const wrapper = mount(SkillModal, { props: { skill: makeSkill() } })

    // Tags
    const tags = wrapper.findAll('.tags .tag')
    expect(tags.length).toBeGreaterThan(0)

    // Projects
    const projects = wrapper.findAll('.projects .project')
    expect(projects.length).toBeGreaterThan(0)

    const emitSpy = jest.spyOn(gameEventBridge, 'emitGameEvent')

    await projects[0].trigger('click')

    // Expect game:project-selected emitted with a valid projectId
    expect(emitSpy).toHaveBeenCalled()
    const call = emitSpy.mock.calls.find(c => c[0] === 'game:project-selected')
    expect(call).toBeTruthy()
    const payload = call ? (call[1] as any) : { projectId: '' }
    const ids = new Set(portfolioData.projects.map(p => p.id))
    expect(ids.has(payload.projectId)).toBe(true)
  })

  test('close interactions: overlay self-click, X button, and BACK TO GAME button', async () => {
    const wrapper = mount(SkillModal, { props: { skill: makeSkill() } })

    const overlay = wrapper.find('.modal-overlay')
    await overlay.trigger('click') // click.self should emit
    expect(wrapper.emitted('close')?.length || 0).toBe(1)

    await wrapper.find('.close-button').trigger('click')
    expect(wrapper.emitted('close')?.length || 0).toBe(2)

    await wrapper.find('.dock-btn').trigger('click')
    expect(wrapper.emitted('close')?.length || 0).toBe(3)
  })

  test('defensive rendering when skill is null', () => {
    const wrapper = mount(SkillModal, { props: { skill: null } })
    expect(wrapper.find('.category-btn').exists()).toBe(false)
    expect(wrapper.find('.description').exists()).toBe(false)
    expect(wrapper.findAll('.tags .tag').length).toBe(0)
    expect(wrapper.findAll('.projects .project').length).toBe(0)
  })
})
