import type { GameEvents, GameEventType, GameEventData } from '@/types/game'

/**
 * Simple event system for communication between Phaser game and Vue components
 * This singleton class manages all communication between the game engine and UI
 */
class GameEventBridge {
  private static instance: GameEventBridge
  private listeners: Map<string, Function[]> = new Map()
  
  private constructor() {
    // Browser-compatible event system
  }

  public static getInstance(): GameEventBridge {
    if (!GameEventBridge.instance) {
      GameEventBridge.instance = new GameEventBridge()
    }
    return GameEventBridge.instance
  }

  /**
   * Emit a game event with type safety
   */
  public emitGameEvent<T extends GameEventType>(
    event: T,
    data: GameEventData<T>
  ): boolean {
    console.log(`[GameEventBridge] Emitting: ${event}`, data)
    const eventListeners = this.listeners.get(event) || []
    eventListeners.forEach(listener => listener(data))
    return eventListeners.length > 0
  }

  /**
   * Listen for a game event with type safety
   */
  public onGameEvent<T extends GameEventType>(
    event: T,
    listener: (data: GameEventData<T>) => void
  ): this {
    console.log(`[GameEventBridge] Listening for: ${event}`)
    if (!this.listeners.has(event)) {
      this.listeners.set(event, [])
    }
    this.listeners.get(event)!.push(listener)
    return this
  }

  /**
   * Remove event listener
   */
  public offGameEvent<T extends GameEventType>(
    event: T,
    listener: (data: GameEventData<T>) => void
  ): this {
    const eventListeners = this.listeners.get(event) || []
    const index = eventListeners.indexOf(listener)
    if (index > -1) {
      eventListeners.splice(index, 1)
    }
    return this
  }

  /**
   * Remove all listeners for an event
   */
  public removeAllGameListeners<T extends GameEventType>(event?: T): this {
    if (event) {
      this.listeners.delete(event)
    } else {
      this.listeners.clear()
    }
    return this
  }

  /**
   * Get active listener count for debugging
   */
  public getListenerCount<T extends GameEventType>(event: T): number {
    return (this.listeners.get(event) || []).length
  }
}

// Export singleton instance
export const gameEventBridge = GameEventBridge.getInstance()
export default gameEventBridge