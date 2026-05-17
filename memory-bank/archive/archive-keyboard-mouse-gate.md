# Keyboard / Mouse Gate Archive

## Date
2026-05-17

## Summary
Added a top-level app gate for unsupported touch-first devices. Phones and touch-first tablets now receive a full-screen apology explaining that Portfolio Quest requires a keyboard and mouse/trackpad, while desktop and laptop users continue into the normal app.

## Implementation
- Created `src/utils/requiresKeyboardAndMouse.ts` to centralize device/input detection.
- Added layered detection using pointer/hover media queries, `navigator.maxTouchPoints`, mobile/tablet user-agent hints, `navigator.userAgentData.mobile`, iPad desktop-mode detection, and a small touch viewport fallback.
- Added a desktop touchscreen escape hatch when a fine pointer and hover-capable environment is present.
- Updated `App.vue` to render a full-screen themed blocking overlay and disable pointer interaction behind it.

## Files Changed
- `src/utils/requiresKeyboardAndMouse.ts`
- `src/App.vue`
- `memory-bank/tasks.md`
- `memory-bank/progress.md`
- `memory-bank/activeContext.md`
- `memory-bank/reflection/reflection-keyboard-mouse-gate.md`

## Testing
- `npm run build` passed after initial implementation.
- `npm run type-check` passed after stricter detection changes.
- `ReadLints` reported no diagnostics for touched app files.
- Manual iPhone dev-server testing identified that network access requires Vite `--host` and explicit `http://`.

## Lessons Learned
- Single-signal device detection is not reliable across mobile browsers, iPad desktop mode, or emulator setups.
- Dev-server access failures can be protocol or bind-address issues rather than app defects.
- The app shell is the right level for broad compatibility gates because it covers every route without changing game systems.

## References
- Reflection: [Keyboard / mouse gate](../reflection/reflection-keyboard-mouse-gate.md)
