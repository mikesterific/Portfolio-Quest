// Game and portfolio data types
export interface ProjectData {
  id: string
  title: string
  description: string
  technologies: string[]
  image?: string
  demoUrl?: string
  githubUrl?: string
  type: 'web' | 'mobile' | 'game' | 'library'
}

export interface SkillData {
  id: string
  name: string
  category: 'frontend' | 'backend' | 'mobile' | 'devops' | 'design'
  level: 1 | 2 | 3 | 4 | 5
  icon?: string
}

export interface ResumeData {
  name: string
  title: string
  email: string
  phone?: string
  website?: string
  summary: string
  experience: ExperienceItem[]
  education: EducationItem[]
  skills: SkillData[]
}

export interface ExperienceItem {
  id: string
  company: string
  position: string
  startDate: string
  endDate?: string
  description: string
  technologies: string[]
}

export interface EducationItem {
  id: string
  institution: string
  degree: string
  field: string
  startDate: string
  endDate?: string
  gpa?: string
}

// Game state and events
export interface GameState {
  currentScene: string
  playerPosition: { x: number; y: number }
  unlockedAreas: string[]
  visitedProjects: string[]
  gameSettings: GameSettings
}

export interface GameSettings {
  soundEnabled: boolean
  musicEnabled: boolean
  autoSaveEnabled: boolean
  difficultyLevel: 'easy' | 'medium' | 'hard'
}

// Communication events between Phaser and Vue
export interface GameEvents {
  // From Game to Vue
  'game:ready': void
  'game:scene-changed': { sceneName: string }
  'game:project-selected': { projectId: string }
  'game:skill-selected': { skillId: string }
  'game:resume-opened': void
  'game:contact-opened': void
  
  // From Vue to Game
  'ui:modal-opened': { type: string }
  'ui:modal-closed': void
  'ui:setting-changed': { key: string; value: any }
  'ui:resume-download': void
}

export type GameEventType = keyof GameEvents
export type GameEventData<T extends GameEventType> = GameEvents[T]