import { ref, computed, type ComputedRef } from 'vue'
import type { SkillData, ProjectData } from '@/types/game'
import { portfolioData } from '@/data/portfolio'

// Radar telemetry data interface
export interface RadarTelemetry {
  vector: number
  stationHealth: number
}

// Radar blip interface
export interface RadarBlip {
  x: number
  y: number
  key: string
}

// Category to project mapping for related projects lookup
const CATEGORY_PROJECT_MAP: Record<string, string[]> = {
  frontend: ['portfolio-quest', 'dell-xps-poc', 'dell-xps-landing', 'dell-home-poc', 'dell-home-live', 'ea-support-site'],
  testing: ['portfolio-quest'],
  architecture: ['dell-home-live', 'ea-support-site', 'portfolio-quest'],
  tooling: ['portfolio-quest'],
  ai: [],
  security: [],
  leadership: ['dell-home-live', 'ea-support-site'],
}

export function useRadarSystem() {
  // Reactive telemetry data (currently static, but could be made dynamic)
  const radarTelemetry = ref<RadarTelemetry>({
    vector: 0.2,
    stationHealth: 92,
  })

  /**
   * Get related projects for a skill category
   */
  function getSkillProjects(category?: string): ProjectData[] {
    if (!category) return []
    const projectIds = CATEGORY_PROJECT_MAP[category] || []
    return portfolioData.projects.filter((p) => projectIds.includes(p.id))
  }

  /**
   * Get technologies associated with a skill
   */
  function getSkillTechnologies(skill?: SkillData | null): string[] {
    if (!skill) return []
    const relatedProjects = getSkillProjects(skill.category)
    const technologies = relatedProjects.flatMap(p => p.technologies)
    return Array.from(new Set(technologies)).slice(0, 10) // Dedupe and limit to 10
  }

  /**
   * Generate radar blips based on skill technologies
   */
  function generateRadarBlips(skill?: SkillData | null): ComputedRef<RadarBlip[]> {
    return computed(() => {
      const technologies = getSkillTechnologies(skill)
      const maxBlips = Math.min(technologies.length, 6)
      const blips: RadarBlip[] = []
      
      if (maxBlips === 0) return blips
      
      for (let i = 0; i < maxBlips; i++) {
        const angle = (i / maxBlips) * Math.PI * 2 + 0.3 * i
        const radius = 90 + (i % 2) * 30
        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius
        blips.push({ x, y, key: technologies[i] })
      }
      
      return blips
    })
  }

  /**
   * Update telemetry data (for future dynamic updates)
   */
  function updateTelemetry(newTelemetry: Partial<RadarTelemetry>) {
    radarTelemetry.value = { ...radarTelemetry.value, ...newTelemetry }
  }

  /**
   * Reset telemetry to default values
   */
  function resetTelemetry() {
    radarTelemetry.value = {
      vector: 0.2,
      stationHealth: 92,
    }
  }

  return {
    // Reactive data
    radarTelemetry,
    
    // Functions
    getSkillProjects,
    getSkillTechnologies,
    generateRadarBlips,
    updateTelemetry,
    resetTelemetry,
  }
}
