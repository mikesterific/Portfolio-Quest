// Space Station Asset Configuration
// This file defines the mapping between skills and space station designs

export interface SpaceStationConfig {
  id: string
  skillId: string
  stationType: 'A' | 'B' | 'C' | 'D' | 'E'
  colorVariant: string
  sector: 'development' | 'infrastructure' | 'innovation'
  position: { x: number; y: number }
  size: { width: number; height: number }
  description: string
}

export const spaceStationConfigs: SpaceStationConfig[] = [
  // DEVELOPMENT SECTOR
  {
    id: 'frontend-station',
    skillId: 'frontend',
    stationType: 'A',
    colorVariant: 'blue',
    sector: 'development',
    position: { x: 200, y: 300 },
    size: { width: 80, height: 80 },
    description: 'Frontend Development Station'
  },
  {
    id: 'testing-station',
    skillId: 'testing',
    stationType: 'A',
    colorVariant: 'green',
    sector: 'development',
    position: { x: 200, y: 450 },
    size: { width: 80, height: 80 },
    description: 'Testing Systems Platform'
  },
  {
    id: 'architecture-station',
    skillId: 'architecture',
    stationType: 'B',
    colorVariant: 'orange',
    sector: 'development',
    position: { x: 200, y: 600 },
    size: { width: 80, height: 80 },
    description: 'Architecture Hub'
  },

  // INFRASTRUCTURE SECTOR
  {
    id: 'tooling-station',
    skillId: 'tooling',
    stationType: 'C',
    colorVariant: 'purple',
    sector: 'infrastructure',
    position: { x: 800, y: 300 },
    size: { width: 80, height: 80 },
    description: 'Tooling Platform'
  },
  {
    id: 'devops-station',
    skillId: 'devops',
    stationType: 'E',
    colorVariant: 'red',
    sector: 'infrastructure',
    position: { x: 800, y: 450 },
    size: { width: 80, height: 80 },
    description: 'DevOps Command'
  },
  {
    id: 'security-station',
    skillId: 'security',
    stationType: 'B',
    colorVariant: 'gray',
    sector: 'infrastructure',
    position: { x: 800, y: 600 },
    size: { width: 80, height: 80 },
    description: 'Security Fortress'
  },

  // INNOVATION HUB
  {
    id: 'ai-station',
    skillId: 'ai',
    stationType: 'D',
    colorVariant: 'cyan',
    sector: 'innovation',
    position: { x: 400, y: 200 },
    size: { width: 80, height: 80 },
    description: 'AI Research Station'
  },
  {
    id: 'leadership-station',
    skillId: 'leadership',
    stationType: 'C',
    colorVariant: 'gold',
    sector: 'innovation',
    position: { x: 600, y: 200 },
    size: { width: 80, height: 80 },
    description: 'Leadership Center'
  }
]

// Color palette for station variants
export const stationColorPalette = {
  blue: '#4A6FA5',     // Frontend
  green: '#5FB85F',    // Testing
  orange: '#E67E22',   // Architecture
  purple: '#9B59B6',   // Tooling
  red: '#E74C3C',      // DevOps
  gray: '#7F8C8D',     // Security
  cyan: '#1ABC9C',     // AI
  gold: '#F39C12'      // Leadership
}

// Station type descriptions for asset extraction
export const stationTypes = {
  A: 'Compact research module with communication arrays',
  B: 'Medium industrial platform with docking bays',
  C: 'Large hub station with multiple sections',
  D: 'Specialized research facility with unique architecture',
  E: 'Command station with prominent control towers'
}

export function getStationConfig(skillId: string): SpaceStationConfig | undefined {
  return spaceStationConfigs.find(config => config.skillId === skillId)
}

export function getStationsBySecor(sector: 'development' | 'infrastructure' | 'innovation'): SpaceStationConfig[] {
  return spaceStationConfigs.filter(config => config.sector === sector)
} 