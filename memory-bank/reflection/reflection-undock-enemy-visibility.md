# Level 1 Bugfix Reflection: Undock Enemy Visibility

## Fix Summary

Players reported the post-undock opponent **disappearing** right after leaving a station. The undock path still called `EnemyAISystem.spawnSingleOppositeHorizontalSide`, but that spawner used **fixed world coordinates** at the left/right padding edges while the **far-side exit** for the unengaged fly-by was defined in **full scene width** (~1920 px). When the hero was near mid-map, the fly path could be only a few hundred pixels; the existing “exit past far padding → `removeEnemy` if never engaged” rule then fired almost immediately, so the ship **vanished on the same beat as undock**. The fix **anchors spawn X to the player** (offset from hero, clamped to playable bounds) and adds a **grace gate** before that silent boundary despawn (minimum airborne time or horizontal travel from spawn).

## What Went Well

- Root cause matched symptoms: **coordinate framing** (world edges vs. hero-local space), not a missing `stationId` or combat toggle.
- Changes stayed inside **`EnemyAISystem`** (`spawnSingleOppositeHorizontalSide`, `updateFlyby`; extended `flyby` with `startTimeMs` / `originX`), so `SkillSpaceScene` undock flow stayed unchanged.
- Existing **Jest** coverage for fly-by spawn, despawn, and engagement remained valid after tuning spawn math and despawn timing.
- **`npm run build`** (type-check + Vite) succeeded after the change.

## Challenges Encountered

- The fly-by was introduced earlier as a **cinematic** cross-screen pass; the interaction with a **finite world** (stations and players living in ~200–1800 x, not “always at edges”) was easy to miss until playtesting mid-map undocks.
- Boundary despawn needed to stay for the design (“flies away if never spotted”) while **not** popping off in the first frame after spawn when the path was accidentally short.
- Naming the bug (“disappears when I undock”) overlapped with **`despawnAll()`** on respawn/replace flows; code search confirmed the dominant issue was **fly-by exit**, not an extra undock despawn in the scene.

## Solutions Applied

1. **Player-relative horizontal spawn**: Still choose approach from the opposite side of mid-screen, but compute `x` using `player.x ± entryDistance`, clamped with a minimum gap from the hero and global `[-padding, width+padding]` limits.
2. **Grace before unengaged boundary despawn**: Track `flyby.startTimeMs` and `flyby.originX`; only **`removeEnemy`** when past the padded boundary **and** either enough time has elapsed or the sprite has moved far enough horizontally from spawn.

## Key Technical Insights

- Spawners that use **viewport width** as “the world” must align spawn and **exit predicates** with **where the player actually is** in that same coordinate system, or short paths and instant cleanup follow.
- Adding **two** release conditions (time **or** distance) avoids edge cases where one metric lies (e.g. teleport, avoidance snap) without keeping enemies stuck forever off-screen.

## Process Insights

- Cross-linking this with the earlier **enemy LOS + fly-by** archive explains *why* silent despawn exists; this task refined *when* it is allowed.
- Focused **`EnemyAISystem`** tests catch spawn direction and despawn behavior without needing a full scene harness for every tweak.

## Improvements for Next Time

- Consider a **playtest checklist** for combat: undock from **left**, **center-ish**, and **right** stations after any spawn or fly-by change.
- Optionally document **`scale.width`** semantics (fixed game size vs. camera) wherever world-edge logic lives, for future camera or world-size changes.
- Tune constants (`entryDistance` clamps, grace ms/px) after subjective play if the approach feels too close or the silent exit too slow.

## Time Estimation Accuracy

- Estimated: not formally tracked (Level 1 fix).  
- Actual: single focused implementation pass plus test/build verification.  
- Variance: N/A.
