/**
 * Tests for GameUIScene using Jest.
 * We mock Phaser to run scene logic headlessly.
 */

// Mock Phaser before importing the scene
jest.mock('phaser', () => {
  class MockText {
    constructor(x, y, text, style) {
      this.x = x; this.y = y; this.text = text; this.style = style || {};
      this.active = true; this.scene = {}; this.scaleX = 1; this.scaleY = 1;
    }
    setOrigin() { return this }
    setInteractive() { return this }
    on() { return this }
    setScale(v) { this.scaleX = this.scaleY = v; return this }
    setScrollFactor() { return this }
    setText(t) { this.text = t; return this }
    setStyle(s) { Object.assign(this.style, s); return this }
    destroy() { /* noop */ }
  }
  class MockSceneBase { constructor(config) { this.sys = { settings: config } } }
  return { __esModule: true, default: { Scene: MockSceneBase, GameObjects: { Text: MockText } } }
})

const { GameUIScene } = require('@/game/scenes/GameUIScene')
const gameEventBridge = require('@/game/GameEventBridge').default

describe('GameUIScene', () => {
  let scene

  beforeEach(() => {
    // Instantiate the scene and patch in minimal properties from mock
    scene = new GameUIScene()
    // Attach minimal runtime props to use mock systems
    scene.scale = { width: 800, height: 600 }
    const texts = []
    scene.add = {
      text: jest.fn((x, y, t, s) => {
        const obj = { x, y, text: t, style: s || {}, active: true, scene: {},
          setOrigin: jest.fn().mockReturnThis(),
          setInteractive: jest.fn().mockReturnThis(),
          on: jest.fn().mockReturnThis(),
          setScale: jest.fn().mockReturnThis(),
          setScrollFactor: jest.fn().mockReturnThis(),
          setText: jest.fn(function (val) { this.text = val; return this }),
          setStyle: jest.fn(function (val) { this.style = { ...this.style, ...val }; return this }),
          destroy: jest.fn(),
        }
        texts.push(obj)
        return obj
      })
    }
    scene.tweens = { add: jest.fn((cfg) => { if (cfg && cfg.onComplete) cfg.onComplete(); return {} }) }
    scene.scene = { start: jest.fn() }
  })

  afterEach(() => {
    gameEventBridge.removeAllGameListeners()
  })

  test('create initializes UI and starts SkillSpaceScene', () => {
    const emitSpy = jest.spyOn(gameEventBridge, 'emitGameEvent')
    scene.create()

    // Starts scene and updates display
    expect(scene.scene.start).toHaveBeenCalledWith('SkillSpaceScene')
    expect(emitSpy).toHaveBeenCalledWith('game:scene-changed', { sceneName: 'SkillSpaceScene' })
  })

  test('toggleSound flips label and emits setting change', () => {
    const emitSpy = jest.spyOn(gameEventBridge, 'emitGameEvent')
    scene.create()

    // Initial state includes ON
    expect(scene['soundButton'].text).toContain('ON')

    scene['toggleSound']()
    expect(scene['soundButton'].setText).toHaveBeenCalledWith('🔇 Sound: OFF')
    expect(emitSpy).toHaveBeenCalledWith('ui:setting-changed', { key: 'soundEnabled', value: false })

    scene['toggleSound']()
    expect(scene['soundButton'].setText).toHaveBeenCalledWith('🔊 Sound: ON')
    expect(emitSpy).toHaveBeenCalledWith('ui:setting-changed', { key: 'soundEnabled', value: true })
  })

  test('toggleCombat flips label/style and emits setting change', () => {
    const emitSpy = jest.spyOn(gameEventBridge, 'emitGameEvent')
    scene.create()

    // Initial state includes ON
    expect(scene['combatButton'].text).toContain('ON')

    scene['toggleCombat']()
    expect(scene['combatButton'].setText).toHaveBeenCalledWith('🛡️ Combat: OFF')
    expect(scene['combatButton'].setStyle).toHaveBeenCalled()
    expect(emitSpy).toHaveBeenCalledWith('ui:setting-changed', { key: 'combatEnabled', value: false })

    scene['toggleCombat']()
    expect(scene['combatButton'].setText).toHaveBeenCalledWith('⚔️ Combat: ON')
    expect(emitSpy).toHaveBeenCalledWith('ui:setting-changed', { key: 'combatEnabled', value: true })
  })

  test('scene-starting event updates current scene display', () => {
    scene.create()
    const setTextSpy = jest.spyOn(scene['currentSceneText'], 'setText')
    gameEventBridge.emitGameEvent('game:scene-starting', { sceneName: 'ProjectForestScene' })
    expect(setTextSpy).toHaveBeenCalledWith('🌲 Project Forest')
  })

  test('XP change updates display and triggers animation for positive amount', () => {
    scene.create()
    const setTextSpy = jest.spyOn(scene['xpText'], 'setText')
    const tweenSpy = jest.spyOn(scene.tweens, 'add')

    gameEventBridge.emitGameEvent('game:xp-changed', { amount: 10, total: 25 })

    expect(setTextSpy).toHaveBeenCalledWith('⭐ XP: 25')
    // Two tweens: scale on xpText and fade on floating text
    expect(tweenSpy).toHaveBeenCalled()
  })

  test('update methods guard when elements missing', () => {
    scene.create()
    // Simulate element becoming inactive
    scene['soundButton'].active = false
    scene['combatButton'].active = false
    scene['xpText'].active = false
    scene['currentSceneText'].active = false

    expect(() => scene['toggleSound']()).not.toThrow()
    expect(() => scene['toggleCombat']()).not.toThrow()
    expect(() => scene['updateCurrentSceneDisplay']('SkillSpaceScene')).not.toThrow()
    expect(() => scene['updateXpDisplay']()).not.toThrow()
  })

  test('hover and click handlers execute for all buttons', () => {
    const emitSpy = jest.spyOn(gameEventBridge, 'emitGameEvent')
    scene.create()

    // Helper to invoke handler by event name
    const callHandler = (target, eventName) => {
      const call = target.on.mock.calls.find(args => args[0] === eventName)
      expect(call).toBeTruthy()
      const handler = call[1]
      handler()
    }

    // Skip button hover and click
    callHandler(scene['skipButton'], 'pointerover')
    expect(scene['skipButton'].setScale).toHaveBeenCalledWith(1.1)
    callHandler(scene['skipButton'], 'pointerout')
    expect(scene['skipButton'].setScale).toHaveBeenCalledWith(1)
    callHandler(scene['skipButton'], 'pointerdown')
    expect(emitSpy).toHaveBeenCalledWith('ui:modal-opened', { type: 'traditional-portfolio' })

    // Sound button hover
    callHandler(scene['soundButton'], 'pointerover')
    expect(scene['soundButton'].setScale).toHaveBeenCalledWith(1.1)
    callHandler(scene['soundButton'], 'pointerout')
    expect(scene['soundButton'].setScale).toHaveBeenCalledWith(1)

    // Combat button hover
    callHandler(scene['combatButton'], 'pointerover')
    expect(scene['combatButton'].setScale).toHaveBeenCalledWith(1.1)
    callHandler(scene['combatButton'], 'pointerout')
    expect(scene['combatButton'].setScale).toHaveBeenCalledWith(1)
  })

  test('ui:setting-changed updates sound and combat buttons', () => {
    scene.create()
    const soundSpy = jest.spyOn(scene, 'updateSoundButton')
    const combatSpy = jest.spyOn(scene, 'updateCombatButton')

    gameEventBridge.emitGameEvent('ui:setting-changed', { key: 'soundEnabled', value: false })
    expect(soundSpy).toHaveBeenCalledWith(false)

    gameEventBridge.emitGameEvent('ui:setting-changed', { key: 'combatEnabled', value: true })
    expect(combatSpy).toHaveBeenCalledWith(true)
  })

  test('XP change with non-positive amount does not animate', () => {
    scene.create()
    const tweenSpy = jest.spyOn(scene.tweens, 'add')
    gameEventBridge.emitGameEvent('game:xp-changed', { amount: 0, total: 10 })
    // One call may still occur for floating text elsewhere; ensure no new call for animation
    expect(tweenSpy).not.toHaveBeenCalled()
  })
})

