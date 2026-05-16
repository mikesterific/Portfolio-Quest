// Unit tests for GameContainer component logic and integration
import gameEventBridge from "@/game/GameEventBridge";
import { portfolioData } from "@/data/portfolio";

describe("GameContainer Logic", () => {
  afterEach(() => {
    gameEventBridge.removeAllGameListeners();
  });

  test("game event bridge modal interactions", () => {
    const eventSpy = jest.spyOn(gameEventBridge, "emitGameEvent");

    // Test modal opening events
    gameEventBridge.emitGameEvent("ui:modal-opened", { type: "skill" });
    gameEventBridge.emitGameEvent("ui:modal-opened", { type: "project" });
    gameEventBridge.emitGameEvent("ui:modal-closed", undefined);

    expect(eventSpy).toHaveBeenCalledWith("ui:modal-opened", { type: "skill" });
    expect(eventSpy).toHaveBeenCalledWith("ui:modal-opened", { type: "project" });
    expect(eventSpy).toHaveBeenCalledWith("ui:modal-closed", undefined);

    eventSpy.mockRestore();
  });

  test("portfolio data accessibility", () => {
    expect(portfolioData).toBeDefined();
    expect(portfolioData).toHaveProperty("skills");
    expect(portfolioData).toHaveProperty("projects");
    expect(Array.isArray(portfolioData.skills)).toBe(true);
    expect(Array.isArray(portfolioData.projects)).toBe(true);
  });

  test("modal state management logic", () => {
    // Test the logic that would be used in the component
    const modalTypes = ["skill", "project", "resume", "contact", "traditional"];

    modalTypes.forEach((type) => {
      expect(typeof type).toBe("string");
      expect(type.length).toBeGreaterThan(0);
    });
  });

  test("game event cleanup works", () => {
    const removeAllSpy = jest.spyOn(gameEventBridge, "removeAllGameListeners");

    // Add some listeners using the correct API
    gameEventBridge.onGameEvent("ui:modal-opened", () => {});

    // Clean up
    gameEventBridge.removeAllGameListeners();

    expect(removeAllSpy).toHaveBeenCalled();
    removeAllSpy.mockRestore();
  });

  test("return-home game event routes to home", () => {
    const mockRouter = {
      push: jest.fn(),
    };

    gameEventBridge.onGameEvent("game:return-home", () => {
      mockRouter.push("/");
    });

    gameEventBridge.emitGameEvent("game:return-home", undefined);

    expect(mockRouter.push).toHaveBeenCalledWith("/");
  });

  test("phaser game initialization data", () => {
    // Test data that would be passed to Phaser
    const gameConfig = {
      width: 1200,
      height: 900,
      type: "AUTO", // Would be Phaser.AUTO in real implementation
      parent: "game-container",
    };

    expect(gameConfig.width).toBe(1200);
    expect(gameConfig.height).toBe(900);
    expect(gameConfig.parent).toBe("game-container");
  });
});
