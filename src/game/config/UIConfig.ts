/**
 * UI Configuration
 * Controls radar, proximity detection, UI positioning, and display settings
 */

export interface UIConfigInterface {
  radar: {
    /** Radar display radius in UI (pixels) */
    radius: number;
    /** Game world radius that maps to radar display (pixels) */
    gameWorldRadius: number;
  };
  proximity: {
    /** Distance at which station interaction prompts appear (pixels) */
    stationDetectionDistance: number;
    /** Distance at which portal interaction prompts appear (pixels) */
    portalDetectionDistance: number;
  };
  positioning: {
    /** Health display position */
    healthDisplay: { x: number; y: number };
    /** Shield display position */
    shieldDisplay: { x: number; y: number };
    /** XP display position */
    xpDisplay: { x: number; y: number };
    /** Interaction prompt offset from bottom of screen */
    interactionPrompt: { yOffset: number };
    /** Navigation hints position offset from bottom */
    navigationHints: { yOffset: number };
  };
  fonts: {
    /** Primary font family for UI text */
    primary: string;
    /** Health text size */
    healthSize: string;
    /** Shield text size */
    shieldSize: string;
    /** XP text size */
    xpSize: string;
    /** Interaction prompt size */
    promptSize: string;
    /** Navigation hints size */
    hintsSize: string;
  };
  colors: {
    /** Health text color */
    health: string;
    /** Shield text color */
    shields: string;
    /** XP text color */
    xp: string;
    /** Interaction prompt color */
    prompt: string;
    /** Navigation hints color */
    hints: string;
  };
}

export const UI_CONFIG: UIConfigInterface = {
  radar: {
    radius: 130,
    gameWorldRadius: 450,
  },
  proximity: {
    stationDetectionDistance: 80,
    portalDetectionDistance: 100,
  },
  positioning: {
    healthDisplay: { x: 24, y: 60 },
    shieldDisplay: { x: 24, y: 94 },
    xpDisplay: { x: 24, y: 128 },
    interactionPrompt: { yOffset: 80 },
    navigationHints: { yOffset: 60 },
  },
  fonts: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
    healthSize: "22px",
    shieldSize: "20px",
    xpSize: "20px",
    promptSize: "18px",
    hintsSize: "16px",
  },
  colors: {
    health: "#FF6B6B",
    shields: "#00AAFF",
    xp: "#F1C40F",
    prompt: "#FFFFFF",
    hints: "#95A5A6",
  },
};
