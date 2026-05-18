const Phaser = require("phaser").default;
const { SpaceStationManager } = require("@/game/managers/SpaceStationManager");

describe("SpaceStationManager", () => {
  let scene;
  let manager;

  beforeEach(() => {
    scene = new Phaser.Scene({ key: "TestScene" });
    manager = new SpaceStationManager(scene);
  });

  describe("constructor", () => {
    test("initializes without creating Phaser objects", () => {
      expect(manager).toBeTruthy();
      expect(manager.getStationsGroup()).toBeNull();
      expect(manager.getStationsData()).toHaveLength(7); // Should have 7 stations
      expect(manager.getUnlockedStations()).toEqual(new Set());
      expect(manager.getUndockSpawnedStations()).toEqual(new Set());
    });
  });

  describe("getStationsData", () => {
    test("returns correct station data structure", () => {
      const stations = manager.getStationsData();

      expect(stations).toHaveLength(7);

      // Check first station (frontend)
      const frontendStation = stations[0];
      expect(frontendStation).toEqual({
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
      });

      // Check all stations have required properties
      stations.forEach((station) => {
        expect(station).toHaveProperty("id");
        expect(station).toHaveProperty("skillId");
        expect(station).toHaveProperty("name");
        expect(station).toHaveProperty("x");
        expect(station).toHaveProperty("y");
        expect(station).toHaveProperty("stationType");
        expect(station).toHaveProperty("colorVariant");
        expect(station).toHaveProperty("sector");
      });
    });

    test("includes all expected stations by skill ID", () => {
      const stations = manager.getStationsData();
      const skillIds = stations.map((s) => s.skillId);

      expect(skillIds).toContain("frontend");
      expect(skillIds).toContain("testing");
      expect(skillIds).toContain("architecture");
      expect(skillIds).toContain("tooling");
      expect(skillIds).toContain("security");
      expect(skillIds).toContain("ai");
      expect(skillIds).toContain("leadership");
    });
  });

  describe("initialize", () => {
    test("creates stations group and station objects", () => {
      const mockCallback = jest.fn();
      const createSpy = jest.spyOn(scene.add, "group");

      manager.initialize(mockCallback);

      expect(createSpy).toHaveBeenCalled();
      expect(manager.getStationsGroup()).toBeTruthy();
      expect(manager.getTotalStationCount()).toBe(7);
    });

    test("creates station containers with correct properties", () => {
      const mockCallback = jest.fn();
      const containerSpy = jest.spyOn(scene.add, "container");

      manager.initialize(mockCallback);

      // Should create 7 station containers
      expect(containerSpy).toHaveBeenCalledTimes(7);

      // Check first station position (frontend station)
      expect(containerSpy).toHaveBeenCalledWith(1650, 250);
    });

    test("sets up interaction callbacks for stations", () => {
      const mockCallback = jest.fn();

      manager.initialize(mockCallback);

      // The callback should be set up but not called during initialization
      expect(mockCallback).not.toHaveBeenCalled();
    });

    test("creates hidden visited marker state for stations", () => {
      const mockCallback = jest.fn();

      manager.initialize(mockCallback);

      const firstStation = manager.getStationsGroup().getChildren()[0];
      const markers = firstStation.getData("visitedMarkerObjects");

      expect(firstStation.getData("isVisited")).toBe(false);
      expect(markers).toHaveLength(3);
      markers.forEach((marker) => {
        expect(marker.visible).toBe(false);
      });
    });
  });

  describe("station state management", () => {
    test("unlockStation adds to unlocked set", () => {
      expect(manager.getUnlockedStations().has("frontend-station")).toBe(false);

      manager.unlockStation("frontend-station");

      expect(manager.getUnlockedStations().has("frontend-station")).toBe(true);
    });

    test("markUndockSpawned tracks spawned stations", () => {
      expect(manager.hasUndockSpawned("frontend-station")).toBe(false);

      manager.markUndockSpawned("frontend-station");

      expect(manager.hasUndockSpawned("frontend-station")).toBe(true);
    });

    test("getTotalStationCount returns correct count", () => {
      expect(manager.getTotalStationCount()).toBe(7);
    });

    test("markStationVisited reveals marker once and reports whether state changed", () => {
      const mockCallback = jest.fn();
      const tweenSpy = jest.spyOn(scene.tweens, "add");

      manager.initialize(mockCallback);

      const firstStation = manager.getStationsGroup().getChildren()[0];
      const markers = firstStation.getData("visitedMarkerObjects");

      expect(manager.markStationVisited("frontend-station", { animate: true })).toBe(true);
      expect(firstStation.getData("isVisited")).toBe(true);
      markers.forEach((marker) => {
        expect(marker.visible).toBe(true);
      });
      expect(tweenSpy).toHaveBeenCalled();

      tweenSpy.mockClear();
      expect(manager.markStationVisited("frontend-station", { animate: true })).toBe(false);
      expect(tweenSpy).not.toHaveBeenCalled();
    });

    test("markStationVisited returns false for unknown stations", () => {
      const mockCallback = jest.fn();

      manager.initialize(mockCallback);

      expect(manager.markStationVisited("missing-station", { animate: true })).toBe(false);
    });
  });

  describe("station creation helpers", () => {
    beforeEach(() => {
      // Mock the textures.exists method
      scene.textures = {
        exists: jest.fn().mockReturnValue(true),
      };
    });

    test("uses starbase images when available", () => {
      const mockCallback = jest.fn();
      const imageSpy = jest.spyOn(scene.add, "image");

      manager.initialize(mockCallback);

      // Should create images for stations (starbase1, starbase2, etc.)
      expect(imageSpy).toHaveBeenCalled();
    });

    test("falls back to geometric shapes when textures missing", () => {
      scene.textures.exists = jest.fn().mockReturnValue(false);
      const mockCallback = jest.fn();
      const rectangleSpy = jest.spyOn(scene.add, "rectangle");
      const circleSpy = jest.spyOn(scene.add, "circle");

      manager.initialize(mockCallback);

      // Should create fallback shapes
      expect(rectangleSpy).toHaveBeenCalled();
    });
  });

  describe("integration", () => {
    test("getStationsGroup returns null before initialization", () => {
      expect(manager.getStationsGroup()).toBeNull();
    });

    test("getStationsGroup returns group after initialization", () => {
      const mockCallback = jest.fn();

      manager.initialize(mockCallback);

      expect(manager.getStationsGroup()).toBeTruthy();
      expect(manager.getStationsGroup().add).toBeDefined();
    });
  });
});
