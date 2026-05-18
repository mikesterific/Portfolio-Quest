import Phaser from "phaser";
import { getColorTint } from "@/assets/images/space-stations/sprite-map-config";
import { stationColorPalette } from "@/assets/images/space-stations/station-data";

export interface SpaceStationData {
  id: string;
  skillId: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  category: string;
  description?: string;
  stationType: "A" | "B" | "C" | "D" | "E";
  colorVariant: string;
  sector: "development" | "infrastructure" | "innovation";
}

interface MarkStationVisitedOptions {
  animate?: boolean;
}

type VisitedMarkerObject = Phaser.GameObjects.GameObject & {
  setVisible(visible?: boolean): VisitedMarkerObject;
  setAlpha(alpha?: number): VisitedMarkerObject;
  setScale(x?: number, y?: number): VisitedMarkerObject;
};

const VISITED_MARKER_CONFIG = {
  haloRadius: 72,
  haloColor: 0x00ff88,
  haloAlpha: 0.72,
  haloLineWidth: 2,
  chipY: -82,
  chipWidth: 76,
  chipHeight: 18,
  chipBackground: 0x07151d,
  chipBackgroundAlpha: 0.86,
  chipTextColor: "#9CFFCB",
};

export class SpaceStationManager {
  private scene: Phaser.Scene;
  private stations: Phaser.GameObjects.Group | null = null;
  private stationsData: SpaceStationData[];
  private unlockedStations: Set<string>;
  private undockSpawnedForStation: Set<string>;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.stationsData = this.createSpaceStationsData();
    this.unlockedStations = new Set<string>();
    this.undockSpawnedForStation = new Set<string>();
  }

  /**
   * Initialize all space stations in the scene
   */
  initialize(onInteract: (skillId: string, stationData: SpaceStationData) => void): void {
    // Create the stations group now that scene is initialized
    this.stations = this.scene.add.group();

    this.stationsData.forEach((station) => {
      const stationObject = this.createSpaceStation(station, onInteract);
      stationObject.setDepth(1);
      this.stations!.add(stationObject);
    });
  }

  /**
   * Get the stations group for physics interactions
   */
  getStationsGroup(): Phaser.GameObjects.Group | null {
    return this.stations;
  }

  /**
   * Get all station data
   */
  getStationsData(): SpaceStationData[] {
    return this.stationsData;
  }

  /**
   * Get unlocked stations set
   */
  getUnlockedStations(): Set<string> {
    return this.unlockedStations;
  }

  /**
   * Get undock spawned stations set
   */
  getUndockSpawnedStations(): Set<string> {
    return this.undockSpawnedForStation;
  }

  /**
   * Get total station count
   */
  getTotalStationCount(): number {
    return this.stationsData.length;
  }

  /**
   * Mark a station as unlocked
   */
  unlockStation(stationId: string): void {
    this.unlockedStations.add(stationId);
  }

  /**
   * Mark that enemies have been spawned for this station's undock
   */
  markUndockSpawned(stationId: string): void {
    this.undockSpawnedForStation.add(stationId);
  }

  /**
   * Check if enemies have been spawned for this station's undock
   */
  hasUndockSpawned(stationId: string): boolean {
    return this.undockSpawnedForStation.has(stationId);
  }

  markStationVisited(stationId: string, options: MarkStationVisitedOptions = {}): boolean {
    const station = this.findStationContainerById(stationId);
    if (!station || station.getData("isVisited")) {
      return false;
    }

    const visitedMarkerObjects = station.getData("visitedMarkerObjects") as
      | VisitedMarkerObject[]
      | undefined;
    visitedMarkerObjects?.forEach((marker) => marker.setVisible(true));
    station.setData("isVisited", true);

    if (options.animate) {
      this.playVisitedMarkerPulse(station);
    }

    return true;
  }

  private findStationContainerById(stationId: string): Phaser.GameObjects.Container | null {
    const stationObjects = this.stations?.getChildren() ?? [];
    for (const stationObject of stationObjects) {
      const station = stationObject as Phaser.GameObjects.Container;
      const stationData = station.getData("stationData") as SpaceStationData | undefined;
      if (stationData?.id === stationId) {
        return station;
      }
    }
    return null;
  }

  private playVisitedMarkerPulse(station: Phaser.GameObjects.Container): void {
    const halo = station.getData("visitedHalo") as VisitedMarkerObject | undefined;
    if (!halo) return;

    halo.setAlpha(0).setScale(0.75);
    this.scene.tweens.add({
      targets: halo,
      alpha: VISITED_MARKER_CONFIG.haloAlpha,
      scale: 1.12,
      duration: 260,
      ease: "Cubic.Out",
      onComplete: () => {
        this.scene.tweens.add({
          targets: halo,
          scale: 1,
          duration: 180,
          ease: "Sine.Out",
        });
      },
    });
  }

  private createSpaceStationsData(): SpaceStationData[] {
    return [
      // DEVELOPMENT SECTOR (Western Quadrant)
      {
        id: "frontend-station",
        skillId: "frontend",
        name: "Frontend Development\nStation",
        emoji: "💻",
        x: 1650,
        y: 250,
        category: "frontend",
        stationType: "A",
        colorVariant: "blue",
        sector: "development",
        description:
          "Building high-performance modern user interfaces focused on responsiveness, usability, scalability, and exceptional user experience.",
      },
      {
        id: "testing-station",
        skillId: "testing",
        name: "Testing Systems\nPlatform",
        emoji: "🧪",
        x: 320,
        y: 780,
        category: "testing",
        stationType: "A",
        colorVariant: "green",
        sector: "development",
        description:
          "Built scalable testing strategies and automated validation systems for enterprise applications and real-time architectures.",
      },
      {
        id: "architecture-station",
        skillId: "architecture",
        name: "Architecture\nHub",
        emoji: "🏗",
        x: 1420,
        y: 880,
        category: "architecture",
        stationType: "B",
        colorVariant: "orange",
        sector: "development",
        description:
          "Designed high-performance scalable systems spanning front-end architecture, real-time infrastructure, performance engineering, and enterprise platform modernization.",
      },

      // INFRASTRUCTURE SECTOR (Eastern Quadrant)
      {
        id: "tooling-station",
        skillId: "tooling",
        name: "Tooling\nPlatform",
        emoji: "🛠",
        x: 220,
        y: 380,
        category: "tooling",
        stationType: "C",
        colorVariant: "purple",
        sector: "infrastructure",
        description:
          "Built internal tooling, developer workflows, and engineering systems focused on productivity, automation, testing, and scalable development operations.",
      },
      {
        id: "security-station",
        skillId: "security",
        name: "Security\nFortress",
        emoji: "🛡",
        x: 850,
        y: 520,
        category: "security",
        stationType: "B",
        colorVariant: "gray",
        sector: "infrastructure",
        description:
          "Designed and maintained secure enterprise-grade web architectures with continuous focus on application security, safe data handling, and hardened front-end/backend systems.",
      },

      // INNOVATION HUB (Northern Command Center)
      {
        id: "ai-station",
        skillId: "ai",
        name: "AI Research\nStation",
        emoji: "🤖",
        x: 580,
        y: 320,
        category: "ai",
        stationType: "D",
        colorVariant: "cyan",
        sector: "innovation",
        description:
          "Exploring practical applications of Large Language Models, agentic workflows, memory systems, and AI-enhanced development.",
      },
      {
        id: "leadership-station",
        skillId: "leadership",
        name: "Leadership\nCenter",
        emoji: "🏛",
        x: 1120,
        y: 300,
        category: "leadership",
        stationType: "C",
        colorVariant: "gold",
        sector: "innovation",
        description:
          "Led architecture initiatives, mentored engineering teams, and drove technical strategy across enterprise-scale organizations.",
      },
    ];
  }

  private getStarbaseImage(skillId: string): string {
    const starbaseMapping: Record<string, string> = {
      frontend: "starbase1",
      testing: "starbase2",
      architecture: "starbase3",
      tooling: "starbase4",
      security: "starbase6",
      ai: "starbase7",
      leadership: "starbase8",
    };

    return starbaseMapping[skillId] || "starbase1"; // Default fallback
  }

  private createSpaceStation(
    station: SpaceStationData,
    onInteract: (skillId: string, stationData: SpaceStationData) => void,
  ): Phaser.GameObjects.Container {
    const stationContainer = this.scene.add.container(station.x, station.y);

    let stationBody: Phaser.GameObjects.Image | Phaser.GameObjects.Shape;

    // Get the appropriate starbase image for this station
    const starbaseKey = this.getStarbaseImage(station.skillId);

    // Use individual starbase images
    if (this.scene.textures.exists(starbaseKey)) {
      // Create sprite from individual starbase image
      stationBody = this.scene.add.image(0, 0, starbaseKey);
      stationBody.setDisplaySize(120, 120); // Scale to a good visible size

      // Apply color tint for category identification
      const colorTint = getColorTint(station.colorVariant);
      stationBody.setTint(colorTint);
    } else {
      // Fallback to geometric shape
      console.warn(
        `Starbase image ${starbaseKey} not found for station ${station.skillId}, using fallback`,
      );

      const stationColor =
        stationColorPalette[station.colorVariant as keyof typeof stationColorPalette];

      switch (station.stationType) {
        case "A": // Compact research module
          stationBody = this.scene.add.rectangle(
            0,
            0,
            70,
            50,
            Phaser.Display.Color.HexStringToColor(stationColor).color,
            0.9,
          );
          break;
        case "B": // Industrial platform
          stationBody = this.scene.add.rectangle(
            0,
            0,
            80,
            40,
            Phaser.Display.Color.HexStringToColor(stationColor).color,
            0.9,
          );
          break;
        case "C": // Large hub station
          stationBody = this.scene.add.circle(
            0,
            0,
            35,
            Phaser.Display.Color.HexStringToColor(stationColor).color,
            0.9,
          );
          break;
        case "D": // Specialized research (hexagonal)
          stationBody = this.scene.add.polygon(
            0,
            0,
            [
              [-25, 0],
              [-12, -22],
              [12, -22],
              [25, 0],
              [12, 22],
              [-12, 22],
            ],
            Phaser.Display.Color.HexStringToColor(stationColor).color,
            0.9,
          );
          break;
        case "E": // Command station
          stationBody = this.scene.add.rectangle(
            0,
            0,
            75,
            45,
            Phaser.Display.Color.HexStringToColor(stationColor).color,
            0.9,
          );
          break;
        default:
          stationBody = this.scene.add.rectangle(
            0,
            0,
            60,
            50,
            Phaser.Display.Color.HexStringToColor(stationColor).color,
            0.9,
          );
      }

      if ("setStrokeStyle" in stationBody) {
        stationBody.setStrokeStyle(3, 0x34495e);
      }
    }

    const visitedHalo = this.scene.add
      .circle(0, 0, VISITED_MARKER_CONFIG.haloRadius)
      .setStrokeStyle(
        VISITED_MARKER_CONFIG.haloLineWidth,
        VISITED_MARKER_CONFIG.haloColor,
        VISITED_MARKER_CONFIG.haloAlpha,
      )
      .setAlpha(VISITED_MARKER_CONFIG.haloAlpha)
      .setVisible(false);
    visitedHalo.setBlendMode(Phaser.BlendModes.ADD);

    const visitedChipBackground = this.scene.add
      .rectangle(
        0,
        VISITED_MARKER_CONFIG.chipY,
        VISITED_MARKER_CONFIG.chipWidth,
        VISITED_MARKER_CONFIG.chipHeight,
        VISITED_MARKER_CONFIG.chipBackground,
        VISITED_MARKER_CONFIG.chipBackgroundAlpha,
      )
      .setStrokeStyle(1, VISITED_MARKER_CONFIG.haloColor, 0.72)
      .setVisible(false);

    const visitedChipText = this.scene.add
      .text(0, VISITED_MARKER_CONFIG.chipY, "VISITED", {
        fontSize: "10px",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        fontStyle: "bold",
        color: VISITED_MARKER_CONFIG.chipTextColor,
        align: "center",
        stroke: "#001812",
        strokeThickness: 2,
      })
      .setOrigin(0.5)
      .setVisible(false);

    // Station label positioned below starbase - clean, no background
    const stationLabel = this.scene.add
      .text(0, 95, station.name, {
        fontSize: "18px",
        fontFamily:
          'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif',
        fontStyle: "bold",
        color: "#FFFFFF",
        align: "center",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5);

    // Status indicator - gentle pulsing effect
    const statusIndicator = this.scene.add.circle(25, -25, 4, 0x00ff88, 0.8);
    this.scene.tweens.add({
      targets: statusIndicator,
      alpha: { from: 0.4, to: 1 },
      scale: { from: 0.8, to: 1.2 },
      duration: 2000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Docking indicators (subtle industrial details)
    const dockingPort1 = this.scene.add.rectangle(-30, 0, 6, 3, 0x95a5a6);
    const dockingPort2 = this.scene.add.rectangle(30, 0, 6, 3, 0x95a5a6);

    stationContainer.add([
      visitedHalo,
      stationBody,
      stationLabel,
      statusIndicator,
      dockingPort1,
      dockingPort2,
      visitedChipBackground,
      visitedChipText,
    ]);

    stationContainer.setData("stationData", station);
    stationContainer.setData("isStation", true);
    stationContainer.setData("isVisited", false);
    stationContainer.setData("visitedHalo", visitedHalo);
    stationContainer.setData("visitedMarkerObjects", [
      visitedHalo,
      visitedChipBackground,
      visitedChipText,
    ]);
    stationContainer.setSize(80, 80);
    stationContainer.setInteractive();
    stationContainer.on("pointerdown", () => onInteract(station.skillId, station));

    return stationContainer;
  }
}
