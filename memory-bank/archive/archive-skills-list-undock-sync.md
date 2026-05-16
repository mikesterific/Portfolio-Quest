# Task Archive: Skills list sync + undock ship stability

## Summary

Synchronized `docs/skills-list.md` mission copy into `portfolioData.skills` and `SpaceStationManager` station blurbs (including leadership emoji 🏛, AI/security wording, and Lighthouse arrow notation). Fixed post-undock ship jitter by zeroing the player Arcade body velocity at dock/undock milestones and moving clockwise rotation from **E** to **R** in `PlayerSystem` so dock/undock no longer shares a key with yaw. Updated Skills Space control hints in `UIManager`. Removed a short-lived `SkillData.companies` field and `SkillModal` Companies section after user validation—the data was incorrect.

## Date Completed

2026-05-16

## Complexity

Level 1 — Content sync + gameplay bugfix

## Key Files Modified

- `src/data/portfolio.ts` — AI technologies/highlights, security flavor text, leadership highlights; companies removed
- `src/types/game.ts` — no lasting `companies` field (removed)
- `src/components/portfolio/SkillModal.vue` — Companies block removed
- `src/game/managers/SpaceStationManager.ts` — station `description` strings aligned to portfolio; leadership emoji
- `src/game/scenes/SkillSpaceScene.ts` — velocity resets around dock tweens and `undockFromStation`
- `src/game/systems/PlayerSystem.ts` — manual rotate Q/R (R replaces E for clockwise)
- `src/game/managers/UIManager.ts` — navigation hint includes Q/R and dock wording
- `memory-bank/tasks.md`, `memory-bank/reflection/reflection-skills-list-undock-sync.md`

## Requirements Addressed

- Space base teaser copy matches portfolio mission text sourced from `docs/skills-list.md`.
- Undocking does not leave the ship visibly shaking or spinning from stale input/physics.
- No incorrect employer/companies list in the skill modal.

## Implementation Details

- **Input**: `updatePlayerVelocity` used **E** for rotate-right while `SkillSpaceScene` used **E** for dock/undock—residual key state caused rotation after undock. **R** is now clockwise yaw; hints updated.
- **Physics**: `setVelocity(0, 0)` when starting dock, after player reaches station, after dock animation completes, and on undock.
- **Content**: Portfolio and Phaser manager descriptions kept in sync; optional companies path reverted entirely.

## Testing Performed

- `ReadLints`: clean on touched files.
- `npm run build`: successful `vue-tsc` + Vite production build.

## Lessons Learned

- Avoid binding scene-specific actions (dock) and global flight controls (yaw) to the same key.
- Tweening physics bodies should end with an explicit velocity reset.
- Editorial lists in markdown need human validation before becoming typed UI.

## Related Work

- Reflection: [Skills list sync + undock stability](../reflection/reflection-skills-list-undock-sync.md)
- Prior related archive: [Skills Space Base Refresh](archive-skills-space-base-refresh.md)
- Progress tracking: [`progress.md`](../progress.md)
- Task ledger: [`tasks.md`](../tasks.md)
