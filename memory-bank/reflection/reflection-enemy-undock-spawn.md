# Level 2 Enhancement Reflection: Single Enemy Undock Spawn + Scaling Speed

## Enhancement Summary

Implemented a focused Skills Space combat enhancement where docking remains calm and enemy pressure begins after undocking. The previous dock-time three-enemy wave was replaced with one enemy that spawns on the opposite horizontal side of the hero, starts very slow, and scales speed based on the count of unique explored stations.

## What Went Well

- The existing `SkillSpaceScene` state already tracked unlocked stations, which made unique-base difficulty scaling straightforward without adding new progression state.
- `EnemyAISystem.createEnemy(...)` already accepted partial config overrides, so speed, acceleration, and strafe tuning could be passed per spawn instead of changing global defaults.
- Moving the spawn trigger to `undockFromStation(...)` kept docking and modal viewing calm while preserving the existing combat toggle and despawn behavior.
- Validation stayed clean: edited files had no linter errors, and `npm run build` completed successfully.

## Challenges Encountered

- The current code still contained older spawn concepts: dock-time spawning, wave spawning, and station-manager helpers for undock-spawn tracking. The implementation needed to replace only the active behavior without broad cleanup.
- The previous undock stability fix had to remain intact, so the new spawn logic needed to run after velocity reset and shield-drop logic without changing player movement state.
- “Only 1 enemy” required enforcement in the AI layer, not only at the scene call site, because older helper methods can still spawn multiple enemies.

## Solutions Applied

- Removed the active dock-time enemy wave from `dockWithStation(...)` and added a small `spawnEnemyAfterUndock(...)` helper called at the end of `undockFromStation(...)`.
- Added `UNDOCK_ENEMY_SPEED_CONFIG` in `SkillSpaceScene.ts` to keep the tuning visible and easy to adjust.
- Added `EnemyAISystem.spawnSingleOppositeHorizontalSide(...)`, which checks combat state, despawns existing enemies, sets the max enemy cap to one, spawns from the edge opposite the player, and rotates the enemy toward the hero.
- Used unique unlocked station count for difficulty scaling so repeated visits do not inflate speed.

## Key Technical Insights

- Per-spawn AI config overrides are a good fit for encounter difficulty because they avoid mutating global enemy defaults.
- Spawn constraints belong close to the system that owns enemy agents. The scene decides when and how difficult the encounter should be; `EnemyAISystem` enforces one active enemy and the spawn geometry.
- Undock is a better encounter boundary than dock for this flow: it gives the player time to read the station modal, then resumes action when control returns.

## Process Insights

- A small plan was enough for this Level 2 change because the code already had established systems for station progression, enemy creation, and combat toggling.
- Searching for old spawn references before validation helped avoid leaving contradictory comments or active dock-spawn paths.
- Keeping the change scoped avoided turning this into a larger enemy-AI cleanup task.

## Action Items for Future Work

- Consider removing unused legacy station-manager undock-spawn tracking helpers in a dedicated cleanup task if they remain unused.
- Manual playtest should verify the first enemy feels slow enough and tune the `60 + 20/base` curve if the game feels too passive or too punishing.
- If future encounters need more variety, add named encounter presets rather than changing global `DEFAULT_ENEMY_CONFIG`.

## Time Estimation Accuracy

- Estimated time: 30-45 minutes
- Actual time: about 35 minutes
- Variance: within estimate
- Reason for variance: the existing AI and station state made the implementation direct; validation stayed clean.
