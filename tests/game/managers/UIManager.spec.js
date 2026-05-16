const Phaser = require("phaser").default;
const { UIManager } = require("@/game/managers/UIManager");

describe("UIManager", () => {
  let scene;
  let manager;

  beforeEach(() => {
    scene = new Phaser.Scene({ key: "TestScene" });
    // Mock scene.scale for screen dimensions
    scene.scale = { width: 800, height: 600 };
    manager = new UIManager(scene);
  });

  describe("constructor", () => {
    test("initializes with scene reference and default values", () => {
      expect(manager).toBeTruthy();
      expect(manager.getXpTotal()).toBe(0);
      expect(manager.getInteractionPrompt()).toBeNull();
      expect(manager.getXpText()).toBeNull();
    });
  });

  describe("initialize", () => {
    test("creates all UI elements", () => {
      const textSpy = jest.spyOn(scene.add, "text");

      manager.initialize(3, 3);

      // Should create 3 text elements: interaction prompt, navigation hints, health display, XP display
      expect(textSpy).toHaveBeenCalledTimes(4);
    });

    test("creates interaction prompt with correct properties", () => {
      const textSpy = jest.spyOn(scene.add, "text");
      const mockPrompt = {
        setOrigin: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
        setDepth: jest.fn().mockReturnThis(),
        setText: jest.fn().mockReturnThis(),
      };
      textSpy.mockReturnValue(mockPrompt);

      manager.initialize(3, 3);

      // First call should be the interaction prompt
      expect(textSpy).toHaveBeenNthCalledWith(
        1,
        400,
        520,
        "", // x: width/2, y: height-80
        expect.objectContaining({
          fontSize: "18px",
          fontFamily: expect.stringContaining("Inter"),
          fontStyle: "bold",
          color: "#FFFFFF",
        }),
      );
      expect(mockPrompt.setOrigin).toHaveBeenCalledWith(0.5);
      expect(mockPrompt.setVisible).toHaveBeenCalledWith(false);
    });

    test("creates navigation hints", () => {
      const textSpy = jest.spyOn(scene.add, "text");

      manager.initialize(3, 3);

      expect(textSpy).toHaveBeenCalledWith(
        20,
        540, // y: height-60
        "WASD/Arrows: Navigate | SPACE: Fire lasers | D: Dock/Undock | H: Home",
        expect.objectContaining({
          fontSize: "16px",
          color: "#95A5A6",
        }),
      );
    });

    test("creates health display with initial values", () => {
      const textSpy = jest.spyOn(scene.add, "text");

      // Create a more complete mock that returns itself for method chaining
      const mockText = {
        setDepth: jest.fn().mockReturnThis(),
        setText: jest.fn().mockReturnThis(),
        setOrigin: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
      };
      textSpy.mockReturnValue(mockText);

      manager.initialize(2, 3);

      expect(textSpy).toHaveBeenCalledWith(
        24,
        60,
        "",
        expect.objectContaining({
          fontSize: "22px",
          color: "#FF6B6B",
        }),
      );
      expect(mockText.setDepth).toHaveBeenCalledWith(100);
    });

    test("creates XP display", () => {
      const textSpy = jest.spyOn(scene.add, "text");

      manager.initialize(3, 3);

      expect(textSpy).toHaveBeenCalledWith(
        24,
        94,
        "XP: 0",
        expect.objectContaining({
          fontSize: "20px",
          color: "#F1C40F",
        }),
      );
    });
  });

  describe("XP management", () => {
    beforeEach(() => {
      manager.initialize(3, 3);
    });

    test("updateXp sets total and updates display", () => {
      const mockXpText = { setText: jest.fn() };
      manager.xpText = mockXpText;

      manager.updateXp(150);

      expect(manager.getXpTotal()).toBe(150);
      expect(mockXpText.setText).toHaveBeenCalledWith("XP: 150");
    });

    test("addXp increments total and updates display", () => {
      const mockXpText = { setText: jest.fn() };
      manager.xpText = mockXpText;

      manager.addXp(25);
      expect(manager.getXpTotal()).toBe(25);

      manager.addXp(15);
      expect(manager.getXpTotal()).toBe(40);

      expect(mockXpText.setText).toHaveBeenLastCalledWith("XP: 40");
    });

    test("getXpTotal returns current total", () => {
      expect(manager.getXpTotal()).toBe(0);

      manager.addXp(100);
      expect(manager.getXpTotal()).toBe(100);
    });
  });

  describe("health management", () => {
    beforeEach(() => {
      manager.initialize(3, 3);
    });

    test("updateHealth updates display text", () => {
      const mockHealthText = { setText: jest.fn() };
      manager.healthText = mockHealthText;

      manager.updateHealth(2, 3);

      expect(mockHealthText.setText).toHaveBeenCalledWith("Health: 2/3");
    });

    test("updateHealth handles zero health", () => {
      const mockHealthText = { setText: jest.fn() };
      manager.healthText = mockHealthText;

      manager.updateHealth(0, 3);

      expect(mockHealthText.setText).toHaveBeenCalledWith("Health: 0/3");
    });
  });

  describe("interaction prompts", () => {
    let mockPrompt;

    beforeEach(() => {
      mockPrompt = {
        setText: jest.fn().mockReturnThis(),
        setVisible: jest.fn().mockReturnThis(),
      };
      manager.initialize(3, 3);
      manager.interactionPrompt = mockPrompt;
    });

    test("showPortalPrompt displays portal message", () => {
      manager.showPortalPrompt("Project Forest");

      expect(mockPrompt.setText).toHaveBeenCalledWith("Press D to travel to Project Forest");
      expect(mockPrompt.setVisible).toHaveBeenCalledWith(true);
    });

    test("showStationPrompt displays station message", () => {
      manager.showStationPrompt("Frontend Development\nStation");

      expect(mockPrompt.setText).toHaveBeenCalledWith(
        "Press D to dock with Frontend Development Station",
      );
      expect(mockPrompt.setVisible).toHaveBeenCalledWith(true);
    });

    test("showDockingPrompt displays docking message", () => {
      manager.showDockingPrompt();

      expect(mockPrompt.setText).toHaveBeenCalledWith("Docking...");
      expect(mockPrompt.setVisible).toHaveBeenCalledWith(true);
    });

    test("showDockedPrompt displays docked message", () => {
      manager.showDockedPrompt();

      expect(mockPrompt.setText).toHaveBeenCalledWith("Docked! Press D to undock");
      expect(mockPrompt.setVisible).toHaveBeenCalledWith(true);
    });

    test("showShieldsUpPrompt displays shields message", () => {
      manager.showShieldsUpPrompt();

      expect(mockPrompt.setText).toHaveBeenCalledWith("Shields up — docking disabled");
      expect(mockPrompt.setVisible).toHaveBeenCalledWith(true);
    });

    test("hidePrompt hides the prompt", () => {
      manager.hidePrompt();

      expect(mockPrompt.setVisible).toHaveBeenCalledWith(false);
    });
  });

  describe("getters", () => {
    beforeEach(() => {
      manager.initialize(3, 3);
    });

    test("getInteractionPrompt returns prompt reference", () => {
      const prompt = manager.getInteractionPrompt();
      expect(prompt).toBeTruthy();
    });

    test("getXpText returns XP text reference", () => {
      const xpText = manager.getXpText();
      expect(xpText).toBeTruthy();
    });

    test("getHealthText returns health text reference", () => {
      const healthText = manager.getHealthText();
      expect(healthText).toBeTruthy();
    });
  });

  describe("edge cases", () => {
    test("handles null text elements gracefully", () => {
      // Don't initialize, so text elements remain null
      expect(() => {
        manager.updateHealth(2, 3);
        manager.updateXp(50);
        manager.showPortalPrompt("Test Portal");
        manager.hidePrompt();
      }).not.toThrow();
    });

    test("handles negative XP values", () => {
      manager.initialize(3, 3);
      const mockXpText = { setText: jest.fn() };
      manager.xpText = mockXpText;

      manager.updateXp(-10);

      expect(manager.getXpTotal()).toBe(-10);
      expect(mockXpText.setText).toHaveBeenCalledWith("XP: -10");
    });
  });

  describe("initialization state", () => {
    test("elements are null before initialization", () => {
      expect(manager.getInteractionPrompt()).toBeNull();
      expect(manager.getXpText()).toBeNull();
      expect(manager.getHealthText()).toBeNull();
    });

    test("elements are set after initialization", () => {
      manager.initialize(3, 3);

      expect(manager.getInteractionPrompt()).not.toBeNull();
      expect(manager.getXpText()).not.toBeNull();
      expect(manager.getHealthText()).not.toBeNull();
    });
  });
});
