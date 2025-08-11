const gameEventBridge = require('@/game/GameEventBridge').default

describe('GameEventBridge', () => {
  beforeEach(() => {
    // Clear all listeners between tests
    gameEventBridge.removeAllGameListeners()
  })

  test('emitGameEvent returns false when no listeners', () => {
    const result = gameEventBridge.emitGameEvent('game:ready', undefined)
    expect(result).toBe(false)
  })

  test('onGameEvent registers listener, supports chaining, and emit returns true', () => {
    const handler = jest.fn()
    const ret = gameEventBridge.onGameEvent('game:scene-changed', handler)
    expect(ret).toBe(gameEventBridge)

    const result = gameEventBridge.emitGameEvent('game:scene-changed', { sceneName: 'SkillSpaceScene' })
    expect(result).toBe(true)
    expect(handler).toHaveBeenCalledWith({ sceneName: 'SkillSpaceScene' })

    expect(gameEventBridge.getListenerCount('game:scene-changed')).toBe(1)
  })

  test('offGameEvent removes specific listener and leaves others', () => {
    const h1 = jest.fn()
    const h2 = jest.fn()
    gameEventBridge.onGameEvent('game:skill-selected', h1)
    gameEventBridge.onGameEvent('game:skill-selected', h2)

    // Remove first handler only
    gameEventBridge.offGameEvent('game:skill-selected', h1)
    expect(gameEventBridge.getListenerCount('game:skill-selected')).toBe(1)

    gameEventBridge.emitGameEvent('game:skill-selected', { skillId: 'testing' })
    expect(h1).not.toHaveBeenCalled()
    expect(h2).toHaveBeenCalledWith({ skillId: 'testing' })
  })

  test('offGameEvent on unknown listener is a no-op', () => {
    const h1 = jest.fn()
    const h2 = jest.fn()
    gameEventBridge.onGameEvent('game:xp-changed', h1)
    // Attempt to remove a different, unregistered function
    gameEventBridge.offGameEvent('game:xp-changed', h2)

    expect(gameEventBridge.getListenerCount('game:xp-changed')).toBe(1)
  })

  test('removeAllGameListeners(event) removes only that event listeners', () => {
    const a = jest.fn()
    const b = jest.fn()
    gameEventBridge.onGameEvent('game:ready', a)
    gameEventBridge.onGameEvent('game:skill-selected', b)

    gameEventBridge.removeAllGameListeners('game:ready')
    expect(gameEventBridge.getListenerCount('game:ready')).toBe(0)
    expect(gameEventBridge.getListenerCount('game:skill-selected')).toBe(1)
  })

  test('removeAllGameListeners() without args clears all listeners', () => {
    const h = jest.fn()
    gameEventBridge.onGameEvent('game:ready', h)
    gameEventBridge.onGameEvent('game:scene-changed', h)

    gameEventBridge.removeAllGameListeners()
    expect(gameEventBridge.getListenerCount('game:ready')).toBe(0)
    expect(gameEventBridge.getListenerCount('game:scene-changed')).toBe(0)
  })

  test('getListenerCount returns 0 for events without listeners', () => {
    expect(gameEventBridge.getListenerCount('ui:modal-opened')).toBe(0)
  })
})
