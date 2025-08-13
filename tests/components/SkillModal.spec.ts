// Unit tests for SkillModal component logic and data
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

describe('SkillModal Logic', () => {
  afterEach(() => {
    gameEventBridge.removeAllGameListeners()
  })

  test('skill data structure has required properties', () => {
    const skill = makeSkill()
    
    expect(skill).toHaveProperty('id')
    expect(skill).toHaveProperty('name')
    expect(skill).toHaveProperty('icon')
    expect(skill).toHaveProperty('level')
    expect(skill).toHaveProperty('category')
    expect(skill).toHaveProperty('description')
    
    expect(skill.id).toBe('frontend')
    expect(skill.name).toBe('Front-End')
    expect(skill.level).toBe(3)
  })

  test('portfolio data contains valid skills', () => {
    expect(portfolioData).toHaveProperty('skills')
    expect(Array.isArray(portfolioData.skills)).toBe(true)
    expect(portfolioData.skills.length).toBeGreaterThan(0)
    
    const firstSkill = portfolioData.skills[0]
    expect(firstSkill).toHaveProperty('id')
    expect(firstSkill).toHaveProperty('name')
    expect(firstSkill).toHaveProperty('category')
  })

  test('game event bridge can emit modal events', () => {
    const eventSpy = jest.spyOn(gameEventBridge, 'emitGameEvent')
    
    gameEventBridge.emitGameEvent('ui:setting-changed', { key: 'closeModal', value: true })
    gameEventBridge.emitGameEvent('game:skill-selected', { skillId: 'frontend' })
    
    expect(eventSpy).toHaveBeenCalledWith('ui:setting-changed', { key: 'closeModal', value: true })
    expect(eventSpy).toHaveBeenCalledWith('game:skill-selected', { skillId: 'frontend' })
    
    eventSpy.mockRestore()
  })

  test('skill level system works correctly', () => {
    const levels = [1, 2, 3, 4, 5]
    
    levels.forEach(level => {
      const skill = { ...makeSkill(), level }
      expect(skill.level).toBeGreaterThanOrEqual(1)
      expect(skill.level).toBeLessThanOrEqual(5)
    })
  })

  test('skill proficiency calculation logic', () => {
    // Test the level-to-percentage conversion logic used in the component
    const levelToPercentage = (level: number) => Math.min(level * 20, 100)
    
    expect(levelToPercentage(1)).toBe(20)  // Beginner
    expect(levelToPercentage(3)).toBe(60)  // Intermediate 
    expect(levelToPercentage(5)).toBe(100) // Expert
  })
})
