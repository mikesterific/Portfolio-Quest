# Skills Space Undock Combat Wave Archive

## Date
2026-05-17

## Summary
Improved Skills Space post-undock combat pacing: enemies spawn on horizontal flybys from the flank opposite the player’s lateral bias using **player-relative X** so mid-map paths are not collapsing to trivial fly-off distances; unengaged fly-by despawns near the padded screen edge wait for minimum **time or traveled X** (`startTimeMs` / `originX`). On exploration cadence—when **`unlockedStations.size`** is **even**, **≥ 2**, and **still `< totalStationCount`**—three ships spawn on the opposing flank (**one lead + two escorts**) with vertical spacing and slid stack origin near viewport clamps. **Escorts** delay engagement (`engageAfterMs` **900 ms**) so they do not all break fly-by / acquire LOS simultaneously with the **lead**.

## Implementation

### `EnemyAISystem.ts`
- `spawnOppositeSideHorizontalFlybys(config, verticalCount, padding?, jitter?)`: shared flank **X**/direction from pilot; **`maxEnemies = verticalCount`**; vertical **step ~ 10% height** bounded [72–138]; **`startY`** clamps stack into `[padding, h - padding]`; **`leadSlot = floor(centerRank)`**, escorts get **`engageAfterMs: 900`**, lead **0**.
- `spawnSingleOppositeHorizontalSide` delegates to that helper with **`verticalCount === 1`**.
- `flyby` extended with **`startTimeMs`**, **`originX`**, **`engageAfterMs`**.
- `updateFlyby`: engage only after **`airborneMs >= engageAfterMs`** and **`canSeePlayer`**; unengaged boundary despawn gated by **`FLYBY_UNENGAGED_BOUNDARY_EXIT_MIN_AIRBORNE_MS` (420)** or **`MIN_TRAVEL_PX` (170)**.

### `SkillSpaceScene.ts`
- `spawnEnemyAfterUndock`: derives **`bonusFormation`** from unlocked count parity + thresholds; **`flybyCount = 1`** or **`1 + UNDOCK_BONUS_ESCORT_COUNT (2)`**; calls **`spawnOppositeSideHorizontalFlybys(cfg, flybyCount)`**.
- Victory undock unchanged: still skips combat spawn via existing early return.

## Files Touched (Memory Bank narrative)
- `src/game/systems/EnemyAISystem.ts`
- `src/game/scenes/SkillSpaceScene.ts`
- `tests/game/systems/EnemyAISystem.spec.js` (formation + fly-by coverage)
- `tests/game/scenes/SkillSpaceScene.spec.js` (spawn API mocks + even-base wing case)
- `tests/game/systems/PlayerSystem.spec.js` — **Q/R** rotation key expectations aligned with implementation (incidental correctness)

## Testing
- `npx jest tests/game/systems/EnemyAISystem.spec.js tests/game/scenes/SkillSpaceScene.spec.js --runInBand --coverage=false` — passed during validation.
- `npm run build` (includes `vue-tsc --build`) — passed.

## Lessons Learned
- Multi-ship introductions need **staged LOS / engagement**, not spacing alone—parallel break-out reads as jitter or overload.
- **Spawn** geometry and **exit** geometry must agree on coordinate framing (viewport + pilot position)—fixed world ±padding opposite full width caused vanishing fly-bys mid-arena until spawn moved with the pilot.
- When debugging “feel” regressions after an AI spike, revert **collateral physics experiments** unless they are proven causal.

## References
- Reflection (consolidated): [Skills Space undock enemy wave UX](../reflection/reflection-skills-space-undock-wave.md)
- Appendix (geometry-only spike): [Undock enemy visibility](../reflection/reflection-undock-enemy-visibility.md)
