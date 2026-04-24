# Development Notes

## Purpose

This document records the recurring runtime, build, and interaction problems we have already hit in this project.

Every time features are updated, we should check this file first and re-run the verification checklist at the end.

## Known Problems And Fixes

### 1. Stale Next.js dev process on old ports

- Symptom:
  - `3000` or `3003` opens, but shows old UI, 404, black screen, or unclickable content.
- Root cause:
  - Old `next dev` processes were still alive, so the browser was loading a stale bundle instead of the latest code.
- Fix:
  - Do not trust an old port by default.
  - Start a fresh dev server on a new port when behavior does not match the latest code.
  - Re-verify the real response body from the port you plan to share.
- Current good verification port during this round:
  - `http://127.0.0.1:3004/`
  - `http://10.103.110.254:3004/`

### 2. Broken `.next` build artifacts

- Symptom:
  - `Cannot find module './548.js'`
  - missing chunk files under `._next/static/...`
- Root cause:
  - corrupted or mismatched `.next` build output
- Fix:
  - remove `.next`
  - rebuild with `npm run build`
  - do not reuse an obviously broken build cache

### 3. Nested route layouts containing `<html>` and `<body>`

- Symptom:
  - page structure becomes unstable, route rendering behaves abnormally, browser UI may appear visually broken
- Root cause:
  - nested layouts under feature routes were incorrectly returning full document structure
- Fix:
  - only the root app layout may render `<html>` and `<body>`
  - nested layouts must render fragments, wrappers, or section containers only

### 4. Nested button structure

- Symptom:
  - some cards appear clickable but inner delete buttons or other controls behave incorrectly
  - browser interaction becomes unreliable
- Root cause:
  - clickable card wrapper used `<button>`, and inner delete action also used `<button>`
- Fix:
  - use a non-button wrapper such as `div` with `role="button"` and keyboard handling
  - keep real `<button>` elements only for the actual action controls inside

### 5. Encoding pollution in source and JSON

- Symptom:
  - Chinese text appears as mojibake in terminal output or during bad save cycles
- Root cause:
  - mixed encoding or wrong terminal code page during edits / inspection
- Fix:
  - save source files as UTF-8
  - avoid rewriting files through tools or terminals that may re-encode content unexpectedly
  - after text-heavy updates, verify actual browser rendering instead of trusting terminal output alone

### 6. `next start` cannot be used with `output: "export"`

- Symptom:
  - production preview fails with:
    - `"next start" does not work with "output: export" configuration`
- Root cause:
  - this project exports static output in production mode
- Fix:
  - use `npm run dev` for interactive verification
  - if previewing exported output, serve the `out` directory with a static server instead of `next start`

## Update Rules

After every feature update:

1. Read this file before starting verification.
2. Run type check.
3. Run build.
4. Verify the actual browser entry URL, not just terminal success output.
5. If an old port behaves strangely, start a fresh dev server on a new port and verify again.
6. If a new issue is found, append it to this file before closing the task.

## Verification Checklist

Use this minimum checklist after each update:

1. `npx tsc --noEmit --pretty false --incremental false`
2. `npm run build`
3. Open the real page in a fresh dev server
4. Confirm the following routes render:
   - `/`
   - `/history`
   - `/pets`
   - `/settings`
5. Confirm the main clickable areas respond:
   - homepage task cards
   - homepage plan cards
   - history task cards
   - bottom navigation
6. If the browser shows black screen or client-side exception:
   - suspect stale dev process first
   - then inspect recent layout / dialog / storage changes
