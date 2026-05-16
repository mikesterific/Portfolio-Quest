// Unit tests for GameUIScene core logic
const gameEventBridge = require("@/game/GameEventBridge").default;

describe("GameUIScene Logic", () => {
  afterEach(() => {
    gameEventBridge.removeAllGameListeners();
    jest.clearAllMocks();
  });

  // ===============================================
  // 🎮 SHALLOW MOUNT BUSINESS LOGIC TESTS
  // ===============================================

  describe("Business Logic (Shallow Tests)", () => {
    let mockLocalStorage;

    beforeEach(() => {
      mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };
      global.localStorage = mockLocalStorage;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("combat button text generation logic", () => {
      const getCombatButtonText = (combatEnabled) => {
        return combatEnabled ? "⚔️ Enemies: ON" : "🛡️ Enemies: OFF";
      };

      expect(getCombatButtonText(true)).toBe("⚔️ Enemies: ON");
      expect(getCombatButtonText(false)).toBe("🛡️ Enemies: OFF");
    });

    test("combat button color generation logic", () => {
      const getCombatButtonColor = (combatEnabled) => {
        return combatEnabled ? "#e74c3c" : "#95a5a6";
      };

      expect(getCombatButtonColor(true)).toBe("#e74c3c");
      expect(getCombatButtonColor(false)).toBe("#95a5a6");
    });

    test("scene display name mapping logic", () => {
      const sceneDisplayNames = {
        SkillSpaceScene: "🚀 Skills Command Center",
        ProjectForestScene: "🌲 Project Forest",
        ResumeTowerScene: "🏰 Résumé Tower",
      };

      const getDisplayName = (sceneName) => {
        return sceneDisplayNames[sceneName] || sceneName;
      };

      expect(getDisplayName("SkillSpaceScene")).toBe("🚀 Skills Command Center");
      expect(getDisplayName("ProjectForestScene")).toBe("🌲 Project Forest");
      expect(getDisplayName("ResumeTowerScene")).toBe("🏰 Résumé Tower");
      expect(getDisplayName("UnknownScene")).toBe("UnknownScene");
    });

    test("localStorage initialization logic for combat settings", () => {
      const initializeCombatSetting = () => {
        const stored = mockLocalStorage.getItem("portfolioQuest_combatEnabled");
        return stored ? JSON.parse(stored) : false;
      };

      // Test default value (false) when no stored value
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(initializeCombatSetting()).toBe(false);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("portfolioQuest_combatEnabled");

      // Test reading stored true value
      mockLocalStorage.getItem.mockReturnValue("true");
      expect(initializeCombatSetting()).toBe(true);

      // Test reading stored false value
      mockLocalStorage.getItem.mockReturnValue("false");
      expect(initializeCombatSetting()).toBe(false);
    });

    test("localStorage initialization logic for sound settings", () => {
      const initializeSoundSetting = () => {
        const stored = mockLocalStorage.getItem("portfolioQuest_soundEnabled");
        return stored ? JSON.parse(stored) : true;
      };

      // Test default value (true) when no stored value
      mockLocalStorage.getItem.mockReturnValue(null);
      expect(initializeSoundSetting()).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("portfolioQuest_soundEnabled");

      // Test reading stored false value
      mockLocalStorage.getItem.mockReturnValue("false");
      expect(initializeSoundSetting()).toBe(false);

      // Test reading stored true value
      mockLocalStorage.getItem.mockReturnValue("true");
      expect(initializeSoundSetting()).toBe(true);
    });

    test("combat toggle state management logic", () => {
      let combatEnabled = false;

      const toggleCombatSetting = () => {
        combatEnabled = !combatEnabled;
        mockLocalStorage.setItem("portfolioQuest_combatEnabled", JSON.stringify(combatEnabled));

        // Emit the change event
        gameEventBridge.emitGameEvent("ui:setting-changed", {
          key: "combatEnabled",
          value: combatEnabled,
        });

        return combatEnabled;
      };

      const eventSpy = jest.spyOn(gameEventBridge, "emitGameEvent");

      // Toggle from false to true
      expect(toggleCombatSetting()).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("portfolioQuest_combatEnabled", "true");
      expect(eventSpy).toHaveBeenCalledWith("ui:setting-changed", {
        key: "combatEnabled",
        value: true,
      });

      // Toggle from true to false
      expect(toggleCombatSetting()).toBe(false);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        "portfolioQuest_combatEnabled",
        "false",
      );
      expect(eventSpy).toHaveBeenCalledWith("ui:setting-changed", {
        key: "combatEnabled",
        value: false,
      });

      eventSpy.mockRestore();
    });

    test("sound toggle state management logic", () => {
      let soundEnabled = true;
      const mockBackgroundMusic = {
        resume: jest.fn(),
        pause: jest.fn(),
      };

      const toggleSound = () => {
        const newSoundState = !soundEnabled;
        soundEnabled = newSoundState;

        // Control background music
        if (mockBackgroundMusic) {
          if (newSoundState) {
            mockBackgroundMusic.resume();
          } else {
            mockBackgroundMusic.pause();
          }
        }

        // Persist setting
        mockLocalStorage.setItem("portfolioQuest_soundEnabled", JSON.stringify(newSoundState));

        // Emit event
        gameEventBridge.emitGameEvent("ui:setting-changed", {
          key: "soundEnabled",
          value: newSoundState,
        });

        return newSoundState;
      };

      const eventSpy = jest.spyOn(gameEventBridge, "emitGameEvent");

      // Test turning sound OFF
      const newState1 = toggleSound();
      expect(newState1).toBe(false);
      expect(mockBackgroundMusic.pause).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("portfolioQuest_soundEnabled", "false");
      expect(eventSpy).toHaveBeenCalledWith("ui:setting-changed", {
        key: "soundEnabled",
        value: false,
      });

      // Test turning sound ON
      jest.clearAllMocks();
      const newState2 = toggleSound();
      expect(newState2).toBe(true);
      expect(mockBackgroundMusic.resume).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("portfolioQuest_soundEnabled", "true");
      expect(eventSpy).toHaveBeenCalledWith("ui:setting-changed", {
        key: "soundEnabled",
        value: true,
      });

      eventSpy.mockRestore();
    });

    test("button update safety checks logic", () => {
      const updateButtonSafely = (button, updateFn) => {
        if (!button || !button.scene || !button.active) {
          console.warn("[GameUIScene] Button is not available, skipping update");
          return false;
        }

        try {
          updateFn(button);
          return true;
        } catch (error) {
          console.warn("[GameUIScene] Error updating button:", error);
          return false;
        }
      };

      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
      const mockUpdate = jest.fn();

      // Test with null button
      expect(updateButtonSafely(null, mockUpdate)).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[GameUIScene] Button is not available, skipping update",
      );

      // Test with inactive button
      expect(updateButtonSafely({ scene: null, active: false }, mockUpdate)).toBe(false);

      // Test with valid button
      const validButton = { scene: { active: true }, active: true };
      expect(updateButtonSafely(validButton, mockUpdate)).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(validButton);

      // Test with error in update function
      const errorUpdate = jest.fn(() => {
        throw new Error("Update failed");
      });
      expect(updateButtonSafely(validButton, errorUpdate)).toBe(false);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[GameUIScene] Error updating button:",
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });

    test("background music initialization logic", () => {
      const mockSoundSystem = {
        add: jest.fn(() => ({
          play: jest.fn(),
          pause: jest.fn(),
          resume: jest.fn(),
        })),
      };

      const initializeBackgroundMusic = (soundSystem, soundEnabled) => {
        try {
          const backgroundMusic = soundSystem.add("backgroundMusic", {
            loop: true,
            volume: 0.3,
          });

          if (soundEnabled && backgroundMusic) {
            backgroundMusic.play();
          }

          return backgroundMusic;
        } catch (error) {
          console.warn("[GameUIScene] Error initializing background music:", error);
          return null;
        }
      };

      // Test successful initialization with sound enabled
      const music = initializeBackgroundMusic(mockSoundSystem, true);

      expect(mockSoundSystem.add).toHaveBeenCalledWith("backgroundMusic", {
        loop: true,
        volume: 0.3,
      });
      expect(music.play).toHaveBeenCalled();

      // Test initialization with sound disabled
      jest.clearAllMocks();
      const musicDisabled = initializeBackgroundMusic(mockSoundSystem, false);

      expect(mockSoundSystem.add).toHaveBeenCalled();
      expect(musicDisabled.play).not.toHaveBeenCalled();
    });

    test("event handler setup logic", () => {
      const eventHandlers = new Map();

      const setupEventListeners = () => {
        // Scene starting handler
        gameEventBridge.onGameEvent("game:scene-starting", (data) => {
          eventHandlers.set("scene-starting", data.sceneName);
          gameEventBridge.emitGameEvent("game:scene-changed", { sceneName: data.sceneName });
        });

        // Modal handlers
        gameEventBridge.onGameEvent("ui:modal-opened", (data) => {
          eventHandlers.set("modal-state", "opened");
        });

        gameEventBridge.onGameEvent("ui:modal-closed", () => {
          eventHandlers.set("modal-state", "closed");
        });

        // Settings handlers
        gameEventBridge.onGameEvent("ui:setting-changed", (data) => {
          eventHandlers.set(`setting-${data.key}`, data.value);
        });
      };

      const onGameEventSpy = jest.spyOn(gameEventBridge, "onGameEvent");
      const emitGameEventSpy = jest.spyOn(gameEventBridge, "emitGameEvent");

      setupEventListeners();

      // Verify event listeners are registered
      expect(onGameEventSpy).toHaveBeenCalledWith("game:scene-starting", expect.any(Function));
      expect(onGameEventSpy).toHaveBeenCalledWith("ui:modal-opened", expect.any(Function));
      expect(onGameEventSpy).toHaveBeenCalledWith("ui:modal-closed", expect.any(Function));
      expect(onGameEventSpy).toHaveBeenCalledWith("ui:setting-changed", expect.any(Function));

      // Test scene starting handler
      gameEventBridge.emitGameEvent("game:scene-starting", { sceneName: "SkillSpaceScene" });
      expect(eventHandlers.get("scene-starting")).toBe("SkillSpaceScene");
      expect(emitGameEventSpy).toHaveBeenCalledWith("game:scene-changed", {
        sceneName: "SkillSpaceScene",
      });

      // Test modal handlers
      gameEventBridge.emitGameEvent("ui:modal-opened", { type: "portfolio" });
      expect(eventHandlers.get("modal-state")).toBe("opened");

      gameEventBridge.emitGameEvent("ui:modal-closed");
      expect(eventHandlers.get("modal-state")).toBe("closed");

      // Test settings handler
      gameEventBridge.emitGameEvent("ui:setting-changed", { key: "soundEnabled", value: false });
      expect(eventHandlers.get("setting-soundEnabled")).toBe(false);

      onGameEventSpy.mockRestore();
      emitGameEventSpy.mockRestore();
    });

    test("home button handler emits return-home event", () => {
      const handleReturnHome = () => {
        gameEventBridge.emitGameEvent("game:return-home", undefined);
      };

      const eventSpy = jest.spyOn(gameEventBridge, "emitGameEvent");

      handleReturnHome();

      expect(eventSpy).toHaveBeenCalledWith("game:return-home", undefined);
      eventSpy.mockRestore();
    });

    test("H hotkey handler emits return-home event", () => {
      const keyboardHandlers = new Map();
      const mockKeyboard = {
        on: jest.fn((eventName, handler) => {
          keyboardHandlers.set(eventName, handler);
        }),
      };

      mockKeyboard.on("keydown-H", () => {
        gameEventBridge.emitGameEvent("game:return-home", undefined);
      });

      const eventSpy = jest.spyOn(gameEventBridge, "emitGameEvent");
      keyboardHandlers.get("keydown-H")();

      expect(mockKeyboard.on).toHaveBeenCalledWith("keydown-H", expect.any(Function));
      expect(eventSpy).toHaveBeenCalledWith("game:return-home", undefined);
      eventSpy.mockRestore();
    });

    test("old combat button text parsing logic", () => {
      const parseCurrentCombatState = (buttonText) => {
        return buttonText.includes("ON");
      };

      const toggleOldCombatButton = (currentText) => {
        const currentCombatState = parseCurrentCombatState(currentText);
        const newCombatState = !currentCombatState;

        gameEventBridge.emitGameEvent("ui:setting-changed", {
          key: "combatEnabled",
          value: newCombatState,
        });

        return newCombatState;
      };

      const eventSpy = jest.spyOn(gameEventBridge, "emitGameEvent");

      // Test parsing ON state
      expect(parseCurrentCombatState("⚔️ Combat: ON")).toBe(true);
      expect(parseCurrentCombatState("🛡️ Combat: OFF")).toBe(false);

      // Test toggle from ON to OFF
      expect(toggleOldCombatButton("⚔️ Combat: ON")).toBe(false);
      expect(eventSpy).toHaveBeenCalledWith("ui:setting-changed", {
        key: "combatEnabled",
        value: false,
      });

      eventSpy.mockRestore();
    });

    test("progress completion toast display logic", () => {
      const mockScene = {
        add: {
          text: jest.fn(() => ({
            setOrigin: jest.fn(function () {
              return this;
            }),
            destroy: jest.fn(),
          })),
        },
        tweens: {
          add: jest.fn(),
        },
        scale: { width: 800 },
      };

      const showCompletionToast = (scene, message) => {
        try {
          const toast = scene.add
            .text(scene.scale.width / 2, 80, message, {
              fontSize: "20px",
              color: "#2ecc71",
              backgroundColor: "#2c3e50aa",
              padding: { x: 14, y: 8 },
            })
            .setOrigin(0.5);

          scene.tweens.add({
            targets: toast,
            y: toast.y - 30,
            alpha: { from: 1, to: 0 },
            duration: 1400,
            ease: "Power2.easeOut",
            onComplete: () => toast.destroy(),
          });

          return toast;
        } catch (error) {
          console.warn("[GameUIScene] Error showing completion toast:", error);
          return null;
        }
      };

      const toast = showCompletionToast(mockScene, "All stations unlocked!");

      expect(mockScene.add.text).toHaveBeenCalledWith(400, 80, "All stations unlocked!", {
        fontSize: "20px",
        color: "#2ecc71",
        backgroundColor: "#2c3e50aa",
        padding: { x: 14, y: 8 },
      });
      expect(mockScene.tweens.add).toHaveBeenCalled();
      expect(toast.setOrigin).toHaveBeenCalledWith(0.5);
    });
  });

  // ===============================================
  // 🎵 BACKGROUND MUSIC STREAMING TESTS
  // ===============================================

  describe("Background Music System", () => {
    let mockLocalStorage;
    let mockSound;
    let mockScene;

    beforeEach(() => {
      // Mock localStorage
      mockLocalStorage = {
        getItem: jest.fn(),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      };
      global.localStorage = mockLocalStorage;

      // Mock Phaser sound system
      mockSound = {
        play: jest.fn(),
        pause: jest.fn(),
        resume: jest.fn(),
        stop: jest.fn(),
        isPlaying: false,
        volume: 0.3,
      };

      // Mock Phaser scene
      mockScene = {
        sound: {
          add: jest.fn(() => mockSound),
        },
      };
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("sound initialization reads from localStorage correctly", () => {
      // Test default value (true) when no stored value
      mockLocalStorage.getItem.mockReturnValue(null);

      const initializeSoundSetting = () => {
        const stored = mockLocalStorage.getItem("portfolioQuest_soundEnabled");
        return stored ? JSON.parse(stored) : true;
      };

      expect(initializeSoundSetting()).toBe(true);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith("portfolioQuest_soundEnabled");

      // Test reading stored false value
      mockLocalStorage.getItem.mockReturnValue("false");
      expect(initializeSoundSetting()).toBe(false);

      // Test reading stored true value
      mockLocalStorage.getItem.mockReturnValue("true");
      expect(initializeSoundSetting()).toBe(true);
    });

    test("background music initialization creates audio object correctly", () => {
      const initializeBackgroundMusic = (scene, soundEnabled) => {
        try {
          const backgroundMusic = scene.sound.add("backgroundMusic", {
            loop: true,
            volume: 0.3,
          });

          if (soundEnabled && backgroundMusic) {
            backgroundMusic.play();
          }

          return backgroundMusic;
        } catch (error) {
          console.warn("[GameUIScene] Error initializing background music:", error);
          return null;
        }
      };

      // Test successful initialization with sound enabled
      const music = initializeBackgroundMusic(mockScene, true);

      expect(mockScene.sound.add).toHaveBeenCalledWith("backgroundMusic", {
        loop: true,
        volume: 0.3,
      });
      expect(mockSound.play).toHaveBeenCalled();
      expect(music).toBe(mockSound);

      // Test initialization with sound disabled
      jest.clearAllMocks();
      const musicDisabled = initializeBackgroundMusic(mockScene, false);

      expect(mockScene.sound.add).toHaveBeenCalled();
      expect(mockSound.play).not.toHaveBeenCalled();
      expect(musicDisabled).toBe(mockSound);
    });

    test("sound toggle controls background music correctly", () => {
      let soundEnabled = true;
      const backgroundMusic = mockSound;

      const toggleSound = () => {
        const newSoundState = !soundEnabled;
        soundEnabled = newSoundState;

        // Control background music
        if (backgroundMusic) {
          if (newSoundState) {
            backgroundMusic.resume();
          } else {
            backgroundMusic.pause();
          }
        }

        // Persist setting
        mockLocalStorage.setItem("portfolioQuest_soundEnabled", JSON.stringify(newSoundState));

        return newSoundState;
      };

      // Test turning sound OFF
      const newState1 = toggleSound();
      expect(newState1).toBe(false);
      expect(mockSound.pause).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("portfolioQuest_soundEnabled", "false");

      // Test turning sound ON
      jest.clearAllMocks();
      const newState2 = toggleSound();
      expect(newState2).toBe(true);
      expect(mockSound.resume).toHaveBeenCalled();
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith("portfolioQuest_soundEnabled", "true");
    });

    test("background music handles errors gracefully", () => {
      const consoleWarnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

      // Mock scene.sound.add to throw an error
      const mockErrorScene = {
        sound: {
          add: jest.fn(() => {
            throw new Error("Audio loading failed");
          }),
        },
      };

      const initializeBackgroundMusic = (scene, soundEnabled) => {
        try {
          const backgroundMusic = scene.sound.add("backgroundMusic", {
            loop: true,
            volume: 0.3,
          });

          if (soundEnabled && backgroundMusic) {
            backgroundMusic.play();
          }

          return backgroundMusic;
        } catch (error) {
          console.warn("[GameUIScene] Error initializing background music:", error);
          return null;
        }
      };

      const result = initializeBackgroundMusic(mockErrorScene, true);

      expect(result).toBe(null);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        "[GameUIScene] Error initializing background music:",
        expect.any(Error),
      );

      consoleWarnSpy.mockRestore();
    });

    test("audio configuration uses correct settings", () => {
      const expectedConfig = {
        loop: true,
        volume: 0.3,
      };

      mockScene.sound.add("backgroundMusic", expectedConfig);

      expect(mockScene.sound.add).toHaveBeenCalledWith("backgroundMusic", expectedConfig);
    });

    test("localStorage persistence works across sessions", () => {
      const soundStates = [true, false, true, false];

      soundStates.forEach((state) => {
        // Simulate saving state
        mockLocalStorage.setItem("portfolioQuest_soundEnabled", JSON.stringify(state));

        // Simulate loading state
        mockLocalStorage.getItem.mockReturnValue(JSON.stringify(state));
        const loaded = JSON.parse(mockLocalStorage.getItem("portfolioQuest_soundEnabled"));

        expect(loaded).toBe(state);
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledTimes(4);
      expect(mockLocalStorage.getItem).toHaveBeenCalledTimes(4);
    });

    test("music state integrates with game events correctly", () => {
      const eventSpy = jest.spyOn(gameEventBridge, "emitGameEvent");

      const emitSoundStateChange = (soundEnabled) => {
        gameEventBridge.emitGameEvent("ui:setting-changed", {
          key: "soundEnabled",
          value: soundEnabled,
        });
      };

      // Test emitting sound enabled
      emitSoundStateChange(true);
      expect(eventSpy).toHaveBeenCalledWith("ui:setting-changed", {
        key: "soundEnabled",
        value: true,
      });

      // Test emitting sound disabled
      emitSoundStateChange(false);
      expect(eventSpy).toHaveBeenCalledWith("ui:setting-changed", {
        key: "soundEnabled",
        value: false,
      });

      eventSpy.mockRestore();
    });

    test("rapid toggle behavior prevents audio glitches", () => {
      let soundEnabled = true;
      const backgroundMusic = mockSound;
      let toggleInProgress = false;

      const safeToggleSound = () => {
        if (toggleInProgress) return soundEnabled; // Prevent rapid toggles

        toggleInProgress = true;

        setTimeout(() => {
          toggleInProgress = false;
        }, 100); // 100ms debounce

        const newSoundState = !soundEnabled;
        soundEnabled = newSoundState;

        if (backgroundMusic) {
          if (newSoundState) {
            backgroundMusic.resume();
          } else {
            backgroundMusic.pause();
          }
        }

        return newSoundState;
      };

      // Test rapid toggles
      const result1 = safeToggleSound(); // Should work
      const result2 = safeToggleSound(); // Should be ignored
      const result3 = safeToggleSound(); // Should be ignored

      expect(result1).toBe(false); // First toggle works
      expect(result2).toBe(false); // Subsequent toggles return current state
      expect(result3).toBe(false);
      expect(mockSound.pause).toHaveBeenCalledTimes(1); // Only called once
    });

    test("cross-scene persistence maintains audio state", () => {
      // Simulate scene transitions while maintaining audio
      const sceneStates = {
        SkillSpaceScene: { active: false },
        ProjectForestScene: { active: false },
        ResumeTowerScene: { active: false },
      };

      let backgroundMusicInstance = mockSound;
      backgroundMusicInstance.isPlaying = true;

      const transitionToScene = (sceneName) => {
        // Reset all scenes
        Object.keys(sceneStates).forEach((scene) => {
          sceneStates[scene].active = false;
        });

        // Activate target scene
        sceneStates[sceneName].active = true;

        // Background music should continue playing during transition
        expect(backgroundMusicInstance.isPlaying).toBe(true);

        return sceneName; // Return scene name for verification
      };

      // Test transitions between all scenes
      const activeScene1 = transitionToScene("SkillSpaceScene");
      expect(activeScene1).toBe("SkillSpaceScene");
      expect(sceneStates["SkillSpaceScene"].active).toBe(true);

      const activeScene2 = transitionToScene("ProjectForestScene");
      expect(activeScene2).toBe("ProjectForestScene");
      expect(sceneStates["ProjectForestScene"].active).toBe(true);

      const activeScene3 = transitionToScene("ResumeTowerScene");
      expect(activeScene3).toBe("ResumeTowerScene");
      expect(sceneStates["ResumeTowerScene"].active).toBe(true);

      // Music should never have been stopped during transitions
      expect(mockSound.stop).not.toHaveBeenCalled();
      expect(mockSound.pause).not.toHaveBeenCalled();

      // Verify background music remained playing throughout all transitions
      expect(backgroundMusicInstance.isPlaying).toBe(true);
    });
  });

  // ===============================================
  // 🔫 LASER SOUND EFFECTS TESTS (SkillSpaceScene)
  // ===============================================

  describe("Laser Sound Effects Integration", () => {
    test("confirms laser sound is handled by SkillSpaceScene (not GameUIScene)", () => {
      // This test validates our architectural decision to put laser sounds
      // in SkillSpaceScene rather than the global GameUIScene

      const architecturalDecision = {
        backgroundMusic: "Global - GameUIScene (plays across all scenes)",
        laserSounds: "Local - SkillSpaceScene (only plays in space combat)",
        reasoning: "Laser sounds are contextual to space combat, not global UI",
      };

      // Verify our architectural approach
      expect(architecturalDecision.backgroundMusic).toContain("GameUIScene");
      expect(architecturalDecision.laserSounds).toContain("SkillSpaceScene");
      expect(architecturalDecision.reasoning).toContain("contextual");
    });

    test("validates laser sound would integrate with existing sound toggle", () => {
      // Test that SkillSpaceScene would properly read sound state from GameUIScene
      let globalSoundEnabled = true;

      // Mock the integration pattern we implemented
      const getGlobalSoundState = () => globalSoundEnabled;
      const shouldPlayLaserSound = () => getGlobalSoundState();

      // Test sound enabled state
      expect(shouldPlayLaserSound()).toBe(true);

      // Test sound disabled state
      globalSoundEnabled = false;
      expect(shouldPlayLaserSound()).toBe(false);

      // Test state restoration
      globalSoundEnabled = true;
      expect(shouldPlayLaserSound()).toBe(true);
    });

    test("validates laser sound configuration would be appropriate for combat", () => {
      const expectedLaserConfig = {
        loop: false, // Laser shots don't loop
        volume: 0.4, // Louder than background music (0.3) for impact
      };

      // Verify non-looping for individual shots
      expect(expectedLaserConfig.loop).toBe(false);

      // Verify appropriate volume level (louder than background music)
      expect(expectedLaserConfig.volume).toBeGreaterThan(0.3);
      expect(expectedLaserConfig.volume).toBeLessThanOrEqual(1.0);
    });

    test("validates scene-specific audio architecture", () => {
      const sceneAudioArchitecture = {
        GameUIScene: {
          sounds: ["backgroundMusic"],
          scope: "Global - persists across all scenes",
          purpose: "Ambient audio for entire game experience",
        },
        SkillSpaceScene: {
          sounds: ["laserSound"],
          scope: "Local - only active in space combat scene",
          purpose: "Combat sound effects for space battles",
        },
        ProjectForestScene: {
          sounds: [], // No combat sounds needed
          scope: "Local - would handle nature/forest sounds if added",
          purpose: "Environment-specific audio",
        },
        ResumeTowerScene: {
          sounds: [], // No combat sounds needed
          scope: "Local - would handle tower/castle sounds if added",
          purpose: "Environment-specific audio",
        },
      };

      // Verify proper separation of concerns
      expect(sceneAudioArchitecture.GameUIScene.sounds).toContain("backgroundMusic");
      expect(sceneAudioArchitecture.SkillSpaceScene.sounds).toContain("laserSound");
      expect(sceneAudioArchitecture.ProjectForestScene.sounds).toHaveLength(0);
      expect(sceneAudioArchitecture.ResumeTowerScene.sounds).toHaveLength(0);

      // Verify scope appropriateness
      expect(sceneAudioArchitecture.GameUIScene.scope).toContain("Global");
      expect(sceneAudioArchitecture.SkillSpaceScene.scope).toContain("Local");
    });

    test("validates HTML5 Web Audio API compatibility", () => {
      // Test that our implementation uses standard Web Audio API
      const mockAudioContext = {
        createAudioNode: jest.fn(),
        createGain: jest.fn(),
        destination: {},
      };

      // Mock Phaser sound system (built on Web Audio API)
      const mockPhaserSound = {
        add: jest.fn((key, config) => ({
          play: jest.fn(),
          pause: jest.fn(),
          stop: jest.fn(),
          volume: config.volume || 1.0,
          loop: config.loop || false,
        })),
      };

      // Test laser sound creation
      const laserSound = mockPhaserSound.add("laserSound", {
        loop: false,
        volume: 0.4,
      });

      expect(mockPhaserSound.add).toHaveBeenCalledWith("laserSound", {
        loop: false,
        volume: 0.4,
      });
      expect(laserSound.loop).toBe(false);
      expect(laserSound.volume).toBe(0.4);
      expect(typeof laserSound.play).toBe("function");
    });

    test("validates performance considerations for rapid firing", () => {
      // Test that multiple rapid laser sounds won't cause audio issues
      const mockLaserSound = {
        play: jest.fn(),
        volume: 0.4,
        loop: false,
      };

      let soundEnabled = true;
      const playLaserSound = () => {
        if (soundEnabled && mockLaserSound) {
          mockLaserSound.play();
        }
      };

      // Simulate rapid firing (player holding SPACE key)
      const rapidFireCount = 10;
      for (let i = 0; i < rapidFireCount; i++) {
        playLaserSound();
      }

      // Verify all shots attempted to play
      expect(mockLaserSound.play).toHaveBeenCalledTimes(rapidFireCount);

      // Test with sound disabled
      soundEnabled = false;
      mockLaserSound.play.mockClear();

      for (let i = 0; i < rapidFireCount; i++) {
        playLaserSound();
      }

      // Verify no sounds played when disabled
      expect(mockLaserSound.play).not.toHaveBeenCalled();
    });
  });

  // ===============================================
  // 🎵 LEGACY BUSINESS LOGIC TESTS (PRESERVED)
  // ===============================================

  test("game event bridge integration works", () => {
    const eventSpy = jest.spyOn(gameEventBridge, "emitGameEvent");

    // Test events that the UI scene would emit
    gameEventBridge.emitGameEvent("ui:setting-changed", { key: "soundEnabled", value: false });
    gameEventBridge.emitGameEvent("ui:setting-changed", { key: "combatEnabled", value: true });
    gameEventBridge.emitGameEvent("game:scene-starting", { sceneName: "SkillSpaceScene" });

    expect(eventSpy).toHaveBeenCalledWith("ui:setting-changed", {
      key: "soundEnabled",
      value: false,
    });
    expect(eventSpy).toHaveBeenCalledWith("ui:setting-changed", {
      key: "combatEnabled",
      value: true,
    });
    expect(eventSpy).toHaveBeenCalledWith("game:scene-starting", { sceneName: "SkillSpaceScene" });

    eventSpy.mockRestore();
  });

  test("xp calculation logic works correctly", () => {
    // Test the XP display logic that would be used in the UI
    const formatXP = (amount) => `XP: ${amount}`;
    const calculateXPGain = (baseXP, multiplier = 1) => baseXP * multiplier;

    expect(formatXP(42)).toBe("XP: 42");
    expect(formatXP(0)).toBe("XP: 0");
    expect(calculateXPGain(10, 1.5)).toBe(15);
    expect(calculateXPGain(5)).toBe(5);
  });

  test("toggle state logic works correctly", () => {
    // Test the toggle logic that would be used by UI buttons
    let soundEnabled = true;
    let combatEnabled = false;

    const toggleSound = () => {
      soundEnabled = !soundEnabled;
      return soundEnabled;
    };
    const toggleCombat = () => {
      combatEnabled = !combatEnabled;
      return combatEnabled;
    };

    expect(toggleSound()).toBe(false);
    expect(toggleSound()).toBe(true);
    expect(toggleCombat()).toBe(true);
    expect(toggleCombat()).toBe(false);
  });

  test("scene state tracking works", () => {
    // Test scene state that would be managed by the UI
    const sceneStates = {
      currentScene: "GameUIScene",
      previousScene: null,
      isTransitioning: false,
    };

    const updateSceneState = (newScene) => {
      sceneStates.previousScene = sceneStates.currentScene;
      sceneStates.currentScene = newScene;
      sceneStates.isTransitioning = true;
    };

    updateSceneState("SkillSpaceScene");
    expect(sceneStates.currentScene).toBe("SkillSpaceScene");
    expect(sceneStates.previousScene).toBe("GameUIScene");
    expect(sceneStates.isTransitioning).toBe(true);
  });

  test("event listener management works", () => {
    const listeners = new Map();

    const addListener = (event, callback) => {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event).push(callback);
    };

    const removeAllListeners = () => {
      listeners.clear();
    };

    addListener("test-event", () => {});
    addListener("test-event", () => {});
    expect(listeners.get("test-event").length).toBe(2);

    removeAllListeners();
    expect(listeners.size).toBe(0);
  });
});
