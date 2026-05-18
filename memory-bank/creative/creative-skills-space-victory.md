# Creative Phase: Skills Space Victory Sequence

## Problem Statement
The player needs a clear, festive win moment after exploring every Skills Space base station. Existing progression already tracks unique station unlocks during docking and emits completion at that point, but the requested experience should happen after undocking from the final base station, not while the station modal/docked state is active.

## Requirements
- Trigger the win only after all base stations have been explored.
- Show the win after the player undocks from the final explored station.
- Make the moment festive and obvious, centered on the words `You Win`.
- Preserve existing station exploration, shield-drop-on-undock, and single enemy undock-spawn behavior for non-final stations.
- Avoid reintroducing undock shake or adding physics side effects.
- Keep the implementation local to Skills Space unless cross-scene UI is clearly needed.

## Current System Context
- `SkillSpaceScene` owns docking, undocking, station unlock tracking, and enemy spawning.
- `unlockedStations` and `totalStationCount` already define exploration progress.
- `game:progress-complete` is currently emitted during docking as soon as all stations are unlocked.
- `undockFromStation` is the correct timing hook because it runs after the player leaves the final base station.
- `UIManager` owns Phaser text HUD elements, while `EffectsManager` owns transient Phaser visual effects.

## Options Analysis

### Option 1: Show Victory Immediately On Final Dock
Description: Reuse the existing completion check in `dockWithStation` and show `You Win` as soon as `totalUnlocked >= totalStations`.

Pros:
- Lowest implementation complexity.
- Uses the existing completion event timing.
- Easy to test because completion already happens during docking.

Cons:
- Does not match the requested timing after undocking.
- Risks competing visually with the station modal/radar UI.
- Feels less like a return-to-space celebration.

Complexity: Low  
Implementation Time: Short

### Option 2: Arm Victory On Final Dock, Trigger On Final Undock
Description: When docking unlocks the last station, set scene-local victory state such as `victoryPendingStationId`. In `undockFromStation`, after the station shield drop and prompt cleanup, trigger a one-time victory sequence if the undocked station matches the pending final station. Victory takes precedence over normal enemy spawning.

Pros:
- Matches the exact requested timing.
- Fits current scene ownership: progression and undock flow already live in `SkillSpaceScene`.
- Avoids modal/UI competition by firing after undock.
- One-time state such as `hasShownVictory` prevents repeat wins.
- Can preserve normal enemy spawning on every non-final undock while skipping combat clutter on the winning undock.

Cons:
- Requires a small amount of additional scene state.
- Needs tests around final undock order and enemy-spawn suppression.
- Requires careful cleanup of temporary Phaser objects/tweens.

Complexity: Medium  
Implementation Time: Short to medium

### Option 3: Emit Completion Event And Let Vue/GameUIScene Render Victory
Description: Keep progression events in `SkillSpaceScene`, then have a global Vue or `GameUIScene` overlay listen for a victory event and render the final celebration.

Pros:
- Could support future cross-scene achievements.
- Vue overlay can be more accessible and easier to style with CSS.
- Keeps large UI text out of the Phaser scene if a global win system is planned.

Cons:
- Broader architecture change for a single scene-specific win condition.
- Adds event lifecycle coordination across scene and app layers.
- More places to clean up and test.
- Still needs scene logic to delay the win until undock.

Complexity: Medium to High  
Implementation Time: Medium

## Decision
Choose Option 2: arm victory on the final dock and trigger a one-time Phaser victory sequence on the final undock.

This best matches the requested interaction while staying inside the existing Skills Space scene boundary. It reuses current progression state, avoids global UI architecture churn, and gives the player a clean celebratory moment in space after leaving the last base.

## Implementation Guidelines
- Extend `SkillsSpaceState` with:
  - `victoryPendingStationId?: string`
  - `hasShownVictory?: boolean`
  - optional `victoryContainer?: Phaser.GameObjects.Container | null`
- During `dockWithStation`, after updating `unlockedStations`, set `victoryPendingStationId = stationId` when `totalUnlocked >= totalStations` and victory has not already been shown.
- Keep `game:progress-complete` emission if useful, but treat it as progress completion, not the visual win trigger.
- In `undockFromStation`, after shield/prompt cleanup:
  - If the undocked `stationId` equals `victoryPendingStationId` and `hasShownVictory` is false, call `triggerVictorySequence()` and return before `spawnEnemyAfterUndock`.
  - Otherwise preserve current enemy spawning.
- Add `triggerVictorySequence()` in `SkillSpaceScene` or delegate parts to managers:
  - Set `hasShownVictory = true`.
  - Create a fixed-camera high-depth overlay with `You Win` in Orbitron/neon styling.
  - Add short subtext such as `All stations explored`.
  - Add festive Phaser particles or repeated bursts around the viewport using existing lightweight particle APIs.
  - Use tweens for scale, glow/pulse, and fade-in; avoid any player physics changes.
- Add an `EffectsManager` helper only if the celebration particles would otherwise make the scene method noisy.
- Ensure scene cleanup destroys the victory container and any long-running timers/tweens.

## Suggested Visual Direction
- Center text: `You Win`
- Typography: Orbitron-style heading, large and bold.
- Colors: cyan primary glow with neon green success accents and small orange/gold particle bursts.
- Motion: quick scale-in, gentle pulse, short fireworks around the viewport edges.
- Tone: celebratory but still professional sci-fi.

## Verification Plan
- Unit test final docking arms victory but does not show it immediately.
- Unit test final undock triggers the victory sequence once.
- Unit test final undock does not spawn the normal enemy.
- Unit test repeat undock or re-docking does not replay victory.
- Run focused `SkillSpaceScene` tests.
- Run `ReadLints` on touched game files and `npm run build` after implementation.

## Creative Verification
- Problem clearly defined: Yes
- Multiple options considered: Yes
- Pros/cons documented: Yes
- Decision made with rationale: Yes
- Implementation plan included: Yes
- Visualization direction included: Yes
- Requirements traced: Yes

## Next Mode
Ready for IMPLEMENT mode.
