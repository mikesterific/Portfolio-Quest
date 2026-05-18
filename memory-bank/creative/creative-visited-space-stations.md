# 🎨🎨🎨 ENTERING CREATIVE PHASE: VISITED SPACE STATION STATE

**Date**: 2026-05-18  
**Component**: Skills Space station visual state  
**Type**: UI/UX + Gameplay Feedback Design  
**Complexity**: Level 2 (Simple Gameplay Enhancement)

## Component Description

Skills Space already tracks explored stations through `unlockedStations` when docking completes. The player can see progress in HUD events and the final victory flow, but individual stations in the world do not currently show a persistent "visited" state after exploration.

The enhancement should make explored stations visually recognizable in the space scene without hiding the station art, interfering with shields, or competing with docking prompts.

## Requirements & Constraints

### Functional Requirements
- Show a persistent visual state once a station has been visited.
- Trigger the state when docking completes and the station is added to `unlockedStations`.
- Preserve the current station sprites, labels, docking flow, shield behavior, and victory trigger.
- Keep the state visible after undocking and while moving around the map.
- Avoid rewarding duplicate docks as if they were new exploration.

### Design Constraints
- The visited state must be obvious at gameplay scale.
- The indicator should not look like damage, enemy targeting, or an active shield.
- Existing station color identity should remain readable.
- The solution should be lightweight enough for all stations with no measurable FPS cost.
- The design should stay professional and presentation-friendly.

### Technical Constraints
- `SkillSpaceScene` currently owns the authoritative `unlockedStations` set.
- `SpaceStationManager` creates each station as a Phaser container and can store child references through `setData`.
- Station shields render separately at higher depth than station containers, so the visited mark should not depend on shield visibility.
- Existing tests focus on `SkillSpaceScene`; implementation should expose a simple manager method that can be asserted or spied in scene tests.

## Options Considered

### Option 1: Dim Visited Stations

Apply lower alpha or desaturation to the station body after docking.

**Pros:**
- Very simple to implement.
- No new graphics or layout work.
- Immediately communicates "already used" in many UI contexts.

**Cons:**
- Makes explored content look disabled or less important.
- Can reduce visual appeal of the map as the player progresses.
- Risks confusing "visited" with shield damage or inactive station state.
- Does not feel celebratory.

### Option 2: Add A Small Check Badge

Add a small checkmark badge near the station label or upper corner after visit.

**Pros:**
- Clear conventional meaning.
- Easy to test and localize to station containers.
- Does not modify station art.

**Cons:**
- A plain checkmark can feel too web-app-like for the sci-fi scene.
- Small badges may be hard to notice during movement.
- Could overlap labels or docking indicators at some zoom/camera positions.

### Option 3: Add A Persistent "Visited" Halo Ring

Add a thin neon success ring around the station container, plus a small `VISITED` or check-style status chip near the label. The ring is hidden initially, then fades/pulses on first visit and remains at a calmer alpha afterward.

**Pros:**
- Strong in-world visual read without diminishing station art.
- Fits existing sci-fi shield/radar language while staying distinct from shield bubbles.
- Works at distance because the ring surrounds the whole station.
- Can be implemented with procedural Phaser shapes inside the existing container.
- Supports a satisfying first-visit animation and a quieter persistent state.

**Cons:**
- Slightly more code than alpha changes or a single badge.
- Needs careful color/depth tuning so it does not look like an active shield.
- Requires storing child references on station containers or adding a manager method.

### Option 4: Replace Station Label With Completed Copy

Append `VISITED`, `COMPLETE`, or a checkmark directly to the station label text after docking.

**Pros:**
- Simple and accessible through text.
- No extra graphics needed.
- Easy to test through label text.

**Cons:**
- Labels are already multi-line and could become crowded.
- Text changes are less visible than a world-space graphic while flying.
- It changes station naming rather than adding status.

## Recommended Approach

Choose Option 3: a persistent visited halo ring with a small status chip.

This gives the clearest in-world feedback while respecting the existing station art and shield system. The ring handles long-range readability, while the chip gives unambiguous completion meaning when the player is nearby. A short first-visit pulse makes the moment feel rewarding, then settles into a quieter permanent state.

## Implementation Guidelines

- Extend `SpaceStationManager.createSpaceStation` to create hidden visited UI children:
  - `visitedHalo`: a thin cyan/green ring around the station at roughly 72px radius.
  - `visitedChip`: small dark translucent rounded rectangle or compact text near the label, using `VISITED` or `✓ VISITED` only if current font support is reliable.
- Store the children on the station container using `setData`, for example:
  - `stationContainer.setData("visitedHalo", visitedHalo)`
  - `stationContainer.setData("visitedChip", visitedChip)`
  - `stationContainer.setData("isVisited", false)`
- Add a public manager method:
  - `markStationVisited(stationId: string, options?: { animate?: boolean }): boolean`
  - It should find the station container, no-op if already visited, reveal the halo/chip, and optionally play the first-visit tween.
- Call `stationManager.markStationVisited(stationId, { animate: true })` in `SkillSpaceScene.dockWithStation` only when the station was newly added to `unlockedStations`.
- Preserve existing `game:station-unlocked` totals by checking whether the station was already present before adding:
  - `const wasAlreadyUnlocked = this.state.unlockedStations?.has(stationId) ?? false`
  - Only animate and emit unlock if `!wasAlreadyUnlocked`.
- Keep the halo visually distinct from shields:
  - Smaller radius than station force shields.
  - Thin stroke only, no filled bubble.
  - Green/cyan success palette instead of shield damage colors.
  - Container-local depth below shield visuals.
- On first visit, run a short pulse:
  - Alpha from 0 to 1, scale from 0.75 to 1.12, then settle at alpha `0.72` and scale `1`.
  - Avoid infinite tweens for every visited station unless performance remains clearly unaffected.
- Avoid changing physics bodies, shield registration, station positions, or docking input handling.

## Visual Direction

- Halo: thin neon green/cyan circular outline, light additive glow feel.
- Chip: compact `VISITED` callout below or above the station label, dark navy backing, green text.
- First-visit motion: one quick pulse from the station center, like a station system coming online.
- Persistent state: calm, readable, not blinking aggressively.

## Verification Plan

- Unit test that first docking marks the matching station visited.
- Unit test that repeat docking does not replay the first-visit animation or double-count unlock events.
- Unit test that final-station victory behavior still arms and triggers normally.
- Run focused `SkillSpaceScene` and `SpaceStationManager` coverage if manager tests exist; otherwise cover through scene tests/mocks.
- Run `ReadLints` on touched files and focused Jest before build.

## Creative Verification

- Problem clearly defined: Yes
- Requirements and constraints listed: Yes
- Multiple options considered: Yes
- Pros/cons documented: Yes
- Recommendation selected and justified: Yes
- Implementation guidelines included: Yes
- Verification plan included: Yes

🎨🎨🎨 EXITING CREATIVE PHASE

## Next Mode

Ready for IMPLEMENT mode.
