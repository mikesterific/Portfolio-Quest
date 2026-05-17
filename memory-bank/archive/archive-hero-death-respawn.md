# Task Archive: Hero hull death + respawn blink

## Summary

Skills Space combat now distinguishes non-lethal hull hits (small explosion + brief invulnerability) from a destroyed ship: when health reaches zero after shields are depleted, a larger `spawnHeroDeathExplosionAt` plays, the hero hides and its physics body disables briefly, then after a short delay the ship resets to the default spawn (`getPlayerSpawnX`, vertical center), restores full health and shields, reapplies shield visuals/UI, and performs three visibility flashes before gameplay resumes. `isPlayerRespawning` gates movement, player lasers, and enemy-laser overlap handling until the blink completes.

## Date Completed

2026-05-16

## Complexity

Level 2 — Simple gameplay enhancement

## Key Files Modified

- `src/game/scenes/SkillSpaceScene.ts` — `damagePlayer` lethal path, `beginPlayerDeathRespawn`, `applyPlayerRespawnAtSpawn`, `runPlayerRespawnBlink`, `playerInvulnerabilityTimer` / `clearPlayerInvulnerabilityTimer`, `isPlayerRespawning`, spawn helper, movement/fire/overlap guards
- `src/game/managers/EffectsManager.ts` — `spawnHeroDeathExplosionAt`
- `tests/game/scenes/SkillSpaceScene.spec.js` — hull hits with `playerShields = 0`, lethal respawn test, undock spawn spy, `delayedCall` return shape, `spawnSingleOppositeHorizontalSide` on mock AI
- `tests/__mocks__/phaser.ts` — `GameObject.setPosition`, `Group.getChildren`, `delayedCall` returns `{ remove }`
- `jest.config.cjs` — `SkillSpaceScene.ts` branch coverage threshold 79 (aligned to measured branches)
- `memory-bank/tasks.md`, `memory-bank/reflection/reflection-hero-death-respawn.md`, `memory-bank/archive/archive-hero-death-respawn.md`

## Requirements Addressed

- Hero “blows up” with a stronger effect when a lethal hull hit occurs (shields already down, health depleted).
- Game resets player combat state: position, health, shields, engine-off texture/orientation.
- User sees three blink-on pulses at the respawn position before full control returns.

## Implementation Details

- **Lethal path**: `damagePlayer` → health ≤ 0 → `beginPlayerDeathRespawn` (skip normal chip explosion and invuln timer).
- **Safety**: `body.enable = false` while hidden; overlap handler returns early when `isPlayerRespawning`.
- **Blink**: chained `time.delayedCall` toggling `setVisible` three times on, with gaps off, ending visible.

## Testing Performed

- `SkillSpaceScene.spec.js`: all tests passing in focused run with coverage (project script).
- Reflection session: Phaser mock fixes validated undock `findShieldContainerForStation` iteration.

**Recommendation:** Run `npm test` and `npm run build` after pulls touching scene/tests.

## Lessons Learned

- Disable physics while the sprite is hidden post-death to avoid queued overlaps.
- Laser specs must set shield charge to zero when asserting hull damage (`damagePlayerShields` absorbs first).
- Jest Phaser mocks should mirror APIs used by production (`setPosition`, `getChildren`, timer `remove`).

## Future Considerations

- Optional one-shot hull after shields break; UI/camera “DESTROYED” beat; raise branch coverage toward 80% with targeted mocks.

## References

- Reflection: [Hero hull death + respawn blink](../reflection/reflection-hero-death-respawn.md)
- Related: [Hero shields](../reflection/reflection-hero-shields.md) (shield layer before hull)
- Progress: [`progress.md`](../progress.md)
- Task ledger: [`tasks.md`](../tasks.md)
