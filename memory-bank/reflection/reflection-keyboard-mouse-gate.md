# Keyboard / Mouse Gate Reflection

## Summary
Added a top-level input capability gate so phones and touch-first tablets see an apology screen instead of entering Portfolio Quest. The implementation started with conservative pointer/hover media queries, then tightened to layered phone/tablet detection after iPhone testing showed browser/device reporting can be inconsistent.

## Implementation
- Added `src/utils/requiresKeyboardAndMouse.ts` with `appRequiresKeyboardMouse()` and `subscribeAppInputRequirement()`.
- Wrapped the app shell in `App.vue` with a full-screen blocking overlay and disabled pointer interaction behind it.
- Expanded detection to use pointer/hover media queries, `navigator.maxTouchPoints`, mobile/tablet user-agent hints, `navigator.userAgentData.mobile`, iPad desktop-mode detection, and a small touch viewport fallback.

## Testing
- `npm run build` passed after the initial implementation.
- `npm run type-check` passed after tightening detection.
- IDE diagnostics were clean for `App.vue` and `requiresKeyboardAndMouse.ts`.
- Manual iPhone network testing confirmed the dev server needed to be accessed over `http://` and exposed with `--host`.

## Additional Notes
- Device detection is inherently imperfect because browsers may present desktop-like signals on tablets or in emulation. Combining multiple signals gives better practical coverage than relying on a single media query.
- The logic intentionally keeps an escape hatch for obvious desktop/laptop touchscreens with fine pointer and hover support to avoid blocking usable hardware.
- Future testing should include physical iPhone Safari/Chrome, iPad Safari with and without desktop mode, Android Chrome, and a touchscreen laptop.
