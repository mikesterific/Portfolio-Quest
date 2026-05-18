# Reflection: Skills Space Undock Enemy Wave UX

## Summary

Skills Space combat after docking/undocking was tightened in multiple passes: fixing the lone undock foe that disappeared too quickly, adding a vertically spaced wing on alternating exploration beats, responding to perceived hero vibration tied to combat density, and staging escort engagement so fly-by presentation stays coherent. Primary code lives in `EnemyAISystem` (spawn geometry, flyby timing, staged acquire) and `SkillSpaceScene` (undock spawn policy; optional victory path already suppresses combat). Supporting test updates landed in `EnemyAISystem.spec.js` and `SkillSpaceScene.spec.js`.

## Implementation Review vs Intent

| Intent | Implementation |
|--------|----------------|
| Undock foe no longer pops off immediately mid-arena | Player-relative flank X vs fixed world edges + grace before silent boundary despawn |
| Extra presence on rhythm (every second unique base unlocked) | `unlockedStations.size` even, ≥ threshold, `< totalStationCount`; `spawnOppositeSideHorizontalFlybys` with configurable count |
| Escorts visibly separated on opposite horizontal flank | Shared spawn X with vertical stacking; bounded start Y so clamps do not flatten the triangle |
| Smoother feel when multiple foes appear | Escorts gated by `engageAfterMs` (~900 ms); lead engages immediately |

## Successes

- **Single choke point**: Spawning behavior stayed in `EnemyAISystem`; scene only selects count and timing after undock.
- **Composable API**: `spawnOppositeSideHorizontalFlybys` preserves `spawnSingleOppositeHorizontalSide` as a wrapper for one-at-a-time callers.
- **Regression safety**: Formation and wing-count expectations covered by Jests; builds stayed green (`npm run build`).
- **Narrow reversal when mis-scoped**: Exploratory player/shield “anti-jitter” changes were withdrawn when symptom traced to formation density/LOS break-out rather than hull physics alone.

## Challenges

- **Symptom misattribution**: “Hero shaking” sounded like Arcade body/sync or shield slam; narrowing to formation + simultaneous engagement required repro reasoning and pruning unrelated edits.
- **Flyby × perception**: Vertical stack near hero Y lets multiple agents satisfy `canSeePlayer` unless acquisition is phased or vertically biased away from hero lane center.
- **Bounds**: Centering wing on hero Y pushes outer slots into clamps; stacking from a slid `startY` keeps gaps meaningful at screen edges.
- **`tasks.md` fragmentation**: Older “vanish only” checklist vs newer formation passes—consolidated in this reflection for one narrative arc.

## Lessons Learned

- Multi-agent fly-ins need **staging** as much as position math: parallelism (three ships reacting at once) changes feel more than incremental speed tweaks.
- **Spawn and exit predicates** must share the same coordinate frame as the pilot (viewport/world/player-relative); mismatches create pathological short paths or instant despawn.
- When regressions follow a feature spike, revert **non-essential collateral** edits first to restore a trustworthy baseline before more combat tuning.

## Improvements for Next Steps

- Expose **`engageAfterMs`** / **`UNDOCK_BONUS_ESCORT_COUNT`** as config or tweak after playtests.
- Consider **explicit roles** (leader vs spectator escort behavior) rather than timers only.
- Short **instrumentation toggle** (debug outline for flyby/active) helps validate acquisition edge cases quickly.
- If desired, resurrect a **minimal** shield velocity fix with its own QA pass—not mixed with formation work.

## Related Artifacts

- Earlier focused note on vanish-only geometry: [Undock enemy visibility](reflection/reflection-undock-enemy-visibility.md).

## Verification

- Jest (focused suites): `EnemyAISystem.spec.js`, `SkillSpaceScene.spec.js` (with mocks updated for plural spawn API).
- `npm run build` / `vue-tsc`: passed during iteration.

## Time / Scope

Informal burst across VAN/analysis, formation feature, vibration follow-up; not single-ticket tracked.
