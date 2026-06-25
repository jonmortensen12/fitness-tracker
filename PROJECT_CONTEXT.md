# Fitness Tracker PWA - Project Context

## What This Is

A Progressive Web App (PWA) that tracks running, weight, and strength training progress. Built with plain HTML/CSS/JavaScript (no frameworks), hosted for free on GitHub Pages, and syncs data to a shared Google Sheet so multiple users can see each other's progress.

**PWA = Progressive Web App** — a website that installs to your phone's home screen and behaves like a native app (works offline, full screen, own icon in app switcher).

## Architecture

```
Phone (Safari/Chrome) 
  → GitHub Pages (free hosting, auto-deploys on git push)
    → Static files: index.html, app.js, styles.css, google-sheets.js
      → Google Sheets API (shared data storage)
      → localStorage (offline/local data)
```

## Key URLs and IDs

- **Live app**: https://jonmortensen12.github.io/fitness-tracker/
- **GitHub repo**: https://github.com/jonmortensen12/fitness-tracker
- **GitHub username**: jonmortensen12
- **Google Cloud Client ID**: 684988331804-lj0n1cdvf2nns154vfrv4oacies9q4sg.apps.googleusercontent.com
- **Google Spreadsheet ID**: 1pbxXdSpjyVr61wGO9972nA0goBPFLoK-Q4XfTrNG-to
- **Google Sheet**: Has 3 tabs — Runs, Weight, Strength (with header rows)

## Local Project Path

```
c:\Users\jdmort\Documents\Local Active Projects\Git Projects\Fitness Tracker\
```

## File Structure

| File | Purpose |
|------|---------|
| index.html | Main app UI with all views (dashboard, runs, weight, strength) |
| app.js | Navigation, form handling, rendering history, localStorage |
| google-sheets.js | Google OAuth sign-in, read/write to Google Sheets API |
| styles.css | All styling, mobile-first design |
| service-worker.js | Caching for offline use, network-first strategy |
| manifest.json | PWA config (app name, icons, start URL, display mode) |
| icons/ | App icons (currently placeholders) |

## How Updates Work

1. Make code changes locally
2. `git add -A` then `git commit -m "description"`
3. `git push` (from Git Bash)
4. Wait ~1-2 minutes for GitHub Pages CDN to propagate
5. App updates automatically on next open (network-first service worker)

## Important Technical Notes

### Git on this machine
- Git must be called with full path: `& "C:\Program Files\Git\bin\git.exe"`
- Or use Git Bash (recommended for push since it handles auth)
- Credentials stored via Windows Credential Manager (won't ask for token again)
- Personal access token (classic) with `repo` scope, no expiration

### Kiro file path bug
- Must use lowercase `c:\` not `C:\` when Kiro accesses files

### Service Worker / Caching
- Uses network-first strategy (always tries to fetch fresh, falls back to cache for offline)
- Bump `CACHE_NAME` version string with every deploy (e.g., 'fitness-tracker-v7')
- iOS can be stubborn — if updates don't appear, delete from home screen, clear Safari website data for github.io, re-add

### PWA on iPhone
- MUST add to home screen from Safari (not Chrome — iOS doesn't support PWAs from Chrome)
- Each browser has separate localStorage (data logged in Chrome won't appear in Safari)
- Always use the home screen icon for consistent data

### Google Sheets Integration
- OAuth consent screen is in "Testing" mode — only whitelisted test users can sign in
- Add new users in Google Cloud Console → Google Auth Platform → Audience → Test users
- To open to everyone: publish the app (move from Testing to Production)
- Data sync is pull-based — tap Refresh or switch to Dashboard tab to pull latest from sheet
- Entries push to sheet immediately on form submit (when signed in)
- Offline entries only save to localStorage (not synced until signed in)

## Current App Version: v7 (red header is a test — change back to blue when ready)

## Known Issues / TODO
- Header is red (test color) — revert to `var(--primary)` / blue
- App icons are placeholders — need real 192x192 and 512x512 PNG icons
- No chart/graph visualizations yet
- No competition/leaderboard features yet
- No half marathon training plan logic yet
- Could add Google Sheets auto-refresh on a timer instead of manual

## Future Feature Ideas
- Progress charts and trend lines
- Half marathon training plan with weekly mileage targets
- Family competition / leaderboard view
- Weekly summary notifications
- Goal setting and progress rings on dashboard
- Export data as CSV
