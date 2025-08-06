// Space Station Sprite Map Configuration
// Defines regions within source images for each station type

export interface SpriteRegion {
  x: number
  y: number
  width: number
  height: number
  sourceImage: string
}

export interface StationSpriteConfig {
  stationType: 'A' | 'B' | 'C' | 'D' | 'E'
  baseRegion: SpriteRegion
  description: string
}

// Sprite regions from "Five Intricate Space Stations in Orbit.png" (1024x1024)
// Updated coordinates to better match typical space station arrangements
export const FIVE_STATIONS_REGIONS: StationSpriteConfig[] = [
  {
    stationType: 'A',
    baseRegion: {
      x: 50, y: 50, width: 300, height: 300,
      sourceImage: 'five-stations'
    },
    description: 'Compact Research Module'
  },
  {
    stationType: 'B', 
    baseRegion: {
      x: 500, y: 50, width: 300, height: 300,
      sourceImage: 'five-stations'
    },
    description: 'Industrial Platform'
  },
  {
    stationType: 'C',
    baseRegion: {
      x: 250, y: 250, width: 400, height: 400,
      sourceImage: 'five-stations'
    },
    description: 'Large Hub Station'
  },
  {
    stationType: 'D',
    baseRegion: {
      x: 50, y: 500, width: 300, height: 300,
      sourceImage: 'five-stations'
    },
    description: 'Specialized Research'
  },
  {
    stationType: 'E',
    baseRegion: {
      x: 500, y: 500, width: 300, height: 300,
      sourceImage: 'five-stations'
    },
    description: 'Command Station'
  }
]

// Additional regions from "More Space Stations.png" (1536x1024) - horizontal layout
export const MORE_STATIONS_REGIONS: SpriteRegion[] = [
  { x: 0, y: 200, width: 256, height: 400, sourceImage: 'more-stations' },
  { x: 256, y: 200, width: 256, height: 400, sourceImage: 'more-stations' },
  { x: 512, y: 200, width: 256, height: 400, sourceImage: 'more-stations' },
  { x: 768, y: 200, width: 256, height: 400, sourceImage: 'more-stations' },
  { x: 1024, y: 200, width: 256, height: 400, sourceImage: 'more-stations' },
  { x: 1280, y: 200, width: 256, height: 400, sourceImage: 'more-stations' }
]

// Color tinting configuration for each skill
export const STATION_COLOR_TINTS = {
  'blue': 0x4A6FA5,    // Frontend
  'green': 0x5FB85F,   // Testing
  'orange': 0xE67E22,  // Architecture
  'purple': 0x9B59B6,  // Tooling
  'red': 0xE74C3C,     // DevOps
  'gray': 0x7F8C8D,    // Security
  'cyan': 0x1ABC9C,    // AI
  'gold': 0xF39C12     // Leadership
}

// Station mapping to sprite regions and colors
export const STATION_SPRITE_MAP = [
  { id: 'station-a-blue', type: 'A', color: 'blue', skill: 'Frontend' },
  { id: 'station-a-green', type: 'A', color: 'green', skill: 'Testing' },
  { id: 'station-b-orange', type: 'B', color: 'orange', skill: 'Architecture' },
  { id: 'station-b-gray', type: 'B', color: 'gray', skill: 'Security' },
  { id: 'station-c-purple', type: 'C', color: 'purple', skill: 'Tooling' },
  { id: 'station-c-gold', type: 'C', color: 'gold', skill: 'Leadership' },
  { id: 'station-d-cyan', type: 'D', color: 'cyan', skill: 'AI' },
  { id: 'station-e-red', type: 'E', color: 'red', skill: 'DevOps' }
]

export function getStationSpriteConfig(stationType: 'A' | 'B' | 'C' | 'D' | 'E'): StationSpriteConfig | undefined {
  return FIVE_STATIONS_REGIONS.find(config => config.stationType === stationType)
}

export function getColorTint(colorName: string): number {
  return STATION_COLOR_TINTS[colorName as keyof typeof STATION_COLOR_TINTS] || 0xFFFFFF
} 