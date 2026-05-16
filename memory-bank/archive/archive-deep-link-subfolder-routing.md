# Task Archive: Subfolder Deep-Link Routing

## Summary

Fixed static hosting behavior so direct visits and refreshes on deep SPA paths under `/portfolio-quest/` resolve to the Vue app instead of the host `404`. The fix pairs Vite’s subfolder **`base`** with server-side rewrite helpers for common static stacks, plus a TypeScript alignment in the Space Museum so production builds succeed.

## Date Completed

2026-05-16

## Complexity

Level 2 — Simple enhancement / deployment fix

## Key Files Modified

- `vite.config.ts` — application `base` defaulting to `/portfolio-quest/` (`VITE_BASE_PATH` optional override).
- `public/.htaccess` — Apache fallback: rewrite non-file/non-dir requests under the subfolder to `index.html`.
- `public/_redirects` — Netlify-style / compatible static-host fallback patterns.
- `src/components/portfolio/SpaceMuseum.vue` — physics/state interface corrected for `jetpackFired`, `jumpCount` so `vue-tsc` passes.
- `memory-bank/tasks.md`, `memory-bank/progress.md`, `memory-bank/activeContext.md`
- `memory-bank/reflection/reflection-deep-link-subfolder-routing.md`

## Requirements Addressed

- Shared links and hard refreshes to `/portfolio-quest/game` and `/portfolio-quest/museum` load the SPA when deployed under `/portfolio-quest/`.
- Asset URLs emitted by Vite remain valid for subfolder mounting.
- Build and type-check remain green (`npm run build`).

## Implementation Details

- **Client-side vs server-side**: Vue Router handles in-app navigation; the server must not treat deep paths as missing static files. Rewrites funnel unknown paths under the app prefix back to **`index.html`**.
- **`base` alignment**: Ensures chunked assets and preload URLs point under `/portfolio-quest/` consistently with how the bundle is deployed.
- **Host diversity**: Dual artifacts (`.htaccess` and `_redirects`) cover Apache-style deployments and hosts that honor redirect rule files—not every environment uses both.

## Testing Performed

- Local `npm run build` — full type check plus Vite production output.
- User validation on deployed static host confirming refresh/deep-link behavior after correct server configuration and uploads (including dotfiles).

## Lessons Learned

- Confirm deployment target (Apache vs CDN vs proprietary static host) before assuming GitHub Pages or a single fallback format.
- Hidden deploy artifacts (`.htaccess`) must ship with releases or production will still `404`.
- SPA deep-link fixes and `base` correctness are orthogonal concerns; shipping one without the other leaves either broken URLs or blank loads.

## Related Work

- Reflection: [Subfolder Deep-Link Routing](../reflection/reflection-deep-link-subfolder-routing.md)
- Progress: [`progress.md`](../progress.md)
- Tasks: [`tasks.md`](../tasks.md)

## Notes for Future Deployments

- Document `VITE_BASE_PATH` explicitly if toggling root vs subfolder installs.
- When moving hosts, transcribe rewrite rules into that host’s format and record the proven pattern beside this archive.

