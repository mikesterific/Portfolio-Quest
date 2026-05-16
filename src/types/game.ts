// Game and portfolio data types
export interface ProjectData {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  image?: string;
  demoUrl?: string;
  githubUrl?: string;
  type: "web" | "mobile" | "game" | "library";
}

export interface SkillData {
  id: string;
  name: string;
  category: "frontend" | "testing" | "architecture" | "tooling" | "ai" | "security" | "leadership";
  level: 1 | 2 | 3 | 4 | 5;
  icon?: string;
  description?: string;
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone?: string;
  website?: string;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillData[];
}

export interface ExperienceItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies: string[];
}

export interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  gpa?: string;
}

// Radar system types
export interface RadarBlip {
  x: number; // Radar coordinate (-130 to +130)
  y: number; // Radar coordinate (-130 to +130)
  key: string; // Unique identifier
}

export interface EnemyRadarData {
  enemies: Array<{
    id: string; // Unique enemy identifier
    x: number; // Radar coordinate (-130 to +130)
    y: number; // Radar coordinate (-130 to +130)
    type?: "enemy-ship"; // Optional enemy type for future styling
  }>;
  playerPosition: {
    // Radar center position (station when docked, player when flying)
    x: number;
    y: number;
  };
  timestamp: number; // For debugging and latency tracking
}

// Game state and events
export interface GameState {
  currentScene: string;
  playerPosition: { x: number; y: number };
  unlockedAreas: string[];
  visitedProjects: string[];
  gameSettings: GameSettings;
}

export interface GameSettings {
  soundEnabled: boolean;
  musicEnabled: boolean;
  autoSaveEnabled: boolean;
  difficultyLevel: "easy" | "medium" | "hard";
}

// Communication events between Phaser and Vue
export interface GameEvents {
  // From Game to Vue
  "game:ready": void;
  "game:scene-changed": { sceneName: string };
  "game:scene-starting": { sceneName: string };
  "game:project-selected": { projectId: string };
  "game:skill-selected": {
    skillId: string;
    stationData: { id: string; x: number; y: number; name: string };
  };
  "game:resume-opened": void;
  "game:contact-opened": void;
  "game:xp-changed": { amount: number; total: number };
  "game:station-unlocked": {
    stationId: string;
    skillId?: string;
    totalUnlocked: number;
    totalStations: number;
  };
  "game:progress-complete": { totalStations: number };
  "game:enemy-positions-updated": EnemyRadarData;
  "game:return-home": void;

  // From Vue to Game
  "ui:modal-opened": { type: string };
  "ui:modal-closed": void;
  "ui:setting-changed": { key: string; value: any };
  "ui:resume-download": void;
}

export type GameEventType = keyof GameEvents;
export type GameEventData<T extends GameEventType> = GameEvents[T];
