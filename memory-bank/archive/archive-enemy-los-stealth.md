# Task Archive: Enemy LOS stealth + horizontal flyby

## Summary

Skills Space’s single undock enemy now earns “awareness” only when the hero is in sensor range, inside the enemy’s forward FOV, and has clear line of sight. Shield barrier sampling and registered station hull occluders both block sight; blind pursuit and firing were removed. After losing sight, the enemy briefly investigates `lastSeenAt`, then patrols again. The encounter begins as an unengaged horizontal flyby; if the hero is never spotted before the ship leaves the far screen edge, the enemy despawns. Undock spawn geometry, single-active-enemy semantics, and speed scaling from explored bases are unchanged at the scene level.

## Date Completed

2026-05-16

## Complexity

Level 2 — Simple gameplay enhancement

## Key Files Modified

- `src/game/systems/EnemyAISystem.ts` — `canSeePlayer`, investigation gating, station occluders in LOS sampling, `flyby` agent state, `spawnSingleOppositeHorizontalSide` flyby setup, offscreen despawn when unengaged
- `tests/game/systems/EnemyAISystem.spec.js` — stealth, investigation, flyby, and engagement transition coverage
- `memory-bank/tasks.md`, `memory-bank/reflection/reflection-enemy-los-stealth.md`, `memory-bank/archive/archive-enemy-los-stealth.md`

## Requirements Addressed

- Enemy does not behave as if it knows the player’s position until LOS (with stations as blockers) and FOV allow it.
- Player can use station cover for stealthy routing.
- Post-refinement: initial horizontal pass across the screen; no engagement → enemy gone after exiting the far side.

## Implementation Details

- **Awareness**: Single predicate combining `inRange`, `inFOV`, and `hasLOS`; movement (SEEK/STRAFE/EVADE) and firing both respect it; `lastSeenAt` updates only when aware.
- **LOS**: `isLineBlockedByShieldsWithSamples` calls `ShieldMapManager.isLineBlockedByStationsWithSamples` before barrier zone sampling so hulls block vision even where laser rules differ.
- **Investigation**: `investigationMemoryMs` window; SEEK targets last known position when LOS lost but memory active.
- **Flyby**: `EnemyAgent.flyby` with horizontal desired velocity until `canSeePlayer` (hand off to normal AI) or past exit padding (remove agent if never engaged).

## Testing Performed

- `ReadLints`: clean on touched files.
- `npx jest --runInBand --runTestsByPath tests/game/systems/EnemyAISystem.spec.js --coverage=false`: all tests passed.
- `npm run build`: successful type-check and Vite production build.

**Note:** `npm test` with default coverage on a single path may exit nonzero if global coverage expectations reference files not exercised by that run; use `--coverage=false` for focused runs or the full suite.

## Lessons Learned

- Define awareness once for navigation and weapons; LOS-only firing plus blind SEEK produced omniscient pursuit.
- Vision occlusion may require hull proxies in addition to shield collision matrices tuned for projectiles.
- Phaser/Jest scenes need explicit coordinates when tests depend on FOV or screen edges.

## Related Work

- Reflection: [Enemy LOS Stealth + Flyby](../reflection/reflection-enemy-los-stealth.md)
- Prior related behavior: single undock spawn + scaling speed (see [reflection-enemy-undock-spawn.md](../reflection/reflection-enemy-undock-spawn.md))
- Progress tracking: [`progress.md`](../progress.md)
- Task ledger: [`tasks.md`](../tasks.md)
