# Race Ready - Project Context

## What This Is

A PWA (Progressive Web App) that serves as a personal half marathon training companion. Built with plain HTML/CSS/JavaScript, hosted free on GitHub Pages, syncs data to Google Sheets. Dark-themed, mobile-first design.

**PWA = Progressive Web App** — a website that installs to your phone's home screen and behaves like a native app (works offline, full screen, own icon).

## Key URLs and IDs

- **Live app**: https://jonmortensen12.github.io/fitness-tracker/
- **GitHub repo**: https://github.com/jonmortensen12/fitness-tracker
- **GitHub username**: jonmortensen12
- **Google Cloud Client ID**: 684988331804-lj0n1cdvf2nns154vfrv4oacies9q4sg.apps.googleusercontent.com
- **Google Spreadsheet ID**: 1pbxXdSpjyVr61wGO9972nA0goBPFLoK-Q4XfTrNG-to
- **Google Sheet tabs**: Runs, Weight, Strength, Nutrition, Completions
- **Google Cloud Console**: App is in "Testing" mode — must add users to test user list for them to sign in

## Local Project Path

```
c:\Users\jdmort\Documents\Local Active Projects\Git Projects\Fitness Tracker\
```

Note: Kiro must use lowercase `c:\` due to a known bug.

## Other PWA Projects in This Workspace

- **Piano Practice Timer**: `c:\Users\jdmort\Documents\Local Active Projects\Git Projects\Piano Practice\`
  - GitHub: https://github.com/jonmortensen12/piano-practice
  - Live: https://jonmortensen12.github.io/piano-practice/

## File Structure

| File | Purpose |
|------|---------|
| index.html | Main app UI - 5 views (Today, Week, Log, Progress, Workout Walker) |
| app.js | Navigation, form handling, stats, streak calculation, day editor with overrides, initialization |
| training-plan.js | 21-week training plan logic, IT band/neck protocols, superset-structured strength workouts, calorie formula |
| google-sheets.js | Google OAuth with token persistence, read/write to Sheets API, offline queue, missing entry detection |
| progress.js | Race readiness calculation, weight chart (canvas) with trendlines and race-day projections, scorecard, milestones |
| workout-walker.js | Step-through exercise interface with superset support, rest timers, form cues, YouTube video links, preview mode |
| styles.css | Dark theme, mobile-first responsive design |
| service-worker.js | Network-first caching for offline support |
| manifest.json | PWA config (name, icons, start URL) |

## App Features

- **Today tab**: Daily workout plan, race countdown, race readiness bar, streak/miles/weight quick stats
- **Week tab**: Mon-Sun view, tap any day to change workout or add custom notes, preview workouts from day editor
- **Log tab**: Run logger (distance, duration, incline, live pace/calorie calc), weight logger, nutrition rating (1-10) with date picker for backdating
- **Progress tab**: Race readiness breakdown, weight chart with projections, weekly scorecard with auto-grade, milestones, plan overview (expandable sections), workout preview buttons
- **Workout Walker**: Step-through guided exercises with superset flow, rest timers, form cues, "Watch demo" YouTube links, preview mode (doesn't mark complete)
- **Day Editor**: Tap a day in Week view to change its workout, add custom notes/intensity, preview that day's workout, or reset to default plan
- **Completion tracking**: Mark done / undo mark done, syncs to Google Sheets

## Technical Notes

- **Timezone bug fix**: All date strings must use `'T12:00:00'` suffix when creating Date objects to avoid UTC midnight rolling back a day in US timezones. Also use local date formatting (not `toISOString()`) when constructing dates from arithmetic.
- **Auth persistence**: Token stored in localStorage for 1 hour. On load, if token is valid it restores immediately. If expired, silently requests new token. User stays "signed in" visually even when token is refreshing. Shows "Reconnect" button only if silent refresh fails.
- **Offline queue**: Entries logged before sign-in are stored in `unsynced_*` localStorage keys and flushed on auth. Also detects entries in main storage that never made it to the sheet (by comparing timestamps) and pushes them.
- **Service worker**: Network-first strategy — always tries fresh content, falls back to cache for offline. Skips googleapis.com and accounts.google.com requests.
- **Supersets**: Workout data uses `isSuperset: true` with nested `exercises` array. The walker flattens these into A→B→rest→repeat sequences. Part A shows a yellow hint for what's next.
- **Preview mode**: `startWorkoutWalker(exercises, warmup, true)` — third arg `true` prevents marking complete on finish.
- **Week overrides**: Stored in localStorage under `week_overrides` key. Overrides take precedence over generated plan for both Week view and Today view.
- **Git**: Must use `& "C:\Program Files\Git\bin\git.exe"` in Kiro terminal, or use Git Bash for push. In Git Bash, cd to: `cd "/c/Users/jdmort/Documents/Local Active Projects/Git Projects/Fitness Tracker"`

---

# Training Plan

## Athlete Profile

- **Name**: Jon Mortensen
- **Height**: 6'2.5"
- **Starting Weight**: 225-228 lbs (June 2026)
- **Goal Weight**: Under 200 lbs (190 ideal)
- **Race**: Gilbert Days Half Marathon, November 21, 2026 (Saturday)
- **Race Goal**: Run the whole thing at 10:00/mile pace (finish ~2:11)
- **Running background**: 1000+ miles in 2025, consistently 4-5 days/week on flat treadmill, up to 5 miles in under 40 min
- **Plan start date**: June 30, 2026 (Monday of Week 1)

## Current Limitations

- **IT Band**: Lateral knee pain on outside of knee, ~1 mile into outdoor/flat runs. Worse downhill. Zero pain at 8% treadmill incline. Cross-leg toe touch stretch provides relief. Likely weak hip abductors.
- **Current fitness**: 5K in ~40 min at 8% incline (5.5 mph first mile, slowing to 5 mph with some 3.5 mph walking). Keeping incline at 8% throughout.
- **Strength**: Cannot do 10 full push-ups. Cannot do 1 unassisted pull-up. Incline push-ups on stairs preferred over knee push-ups.
- **Neck pain**: Left side, restricts head rotation. Posture-related (desk work).
- **Weight**: Trending up due to reduced running volume. Nighttime snacking (popcorn, ice cream, nachos) is the biggest calorie excess.

## Schedule Constraints

- **Mornings before 6 AM**: Primary workout time
- **Wednesday evenings (summer)**: Ultimate frisbee — guaranteed through July 29 (week 5), possibly through August 12 (week 7) if playoffs
- **Saturdays**: Most likely to be missed due to family activities — structured as optional
- **Weekends**: Family walks/hikes Saturday and Sunday
- **Sunday**: Rest day (no workouts beyond walking)

## Plan Phases

### Phase 1: Weeks 1-6 (June 30 - Aug 8) — Rehab
- Fix IT band via hip/glute strengthening
- Maintain cardio on inclined treadmill
- Start losing weight
- Test flat running at weeks 4-5

### Phase 2: Weeks 7-14 (Aug 11 - Oct 17) — Build
- Transition to flat/outdoor running
- Increase distance progressively
- Long runs build from 5.75 to 11 miles
- Wednesday becomes tempo run day once frisbee ends (Week 8+)
- Continue weight loss

### Phase 3: Weeks 15-20 (Oct 20 - Nov 14) — Race Prep
- Peak mileage (long runs: 10, 11, 12, 13, 10, 8)
- Practice race pace (10:00/mile)
- Taper in final 2 weeks

### Week 21 (Nov 17-21) — Race Week
- Short easy shakeout runs Mon/Wed
- Rest Thu/Fri
- RACE DAY Saturday Nov 21

## Weekly Schedule (Summer — Weeks 1-7, through frisbee)

| Day | Activity |
|-----|----------|
| Monday | **Long run** (key run of the week) + IT band/neck |
| Tuesday | Upper body strength (supersets) + IT band/neck |
| Wednesday | Ultimate frisbee (evening) |
| Thursday | Lower body strength (supersets) + IT band/neck |
| Friday | Moderate run + IT band/neck |
| Saturday | Recovery run + mini upper body (OK to skip) |
| Sunday | Rest / family walk |

## Weekly Schedule (Fall — Week 8+, after frisbee)

| Day | Activity |
|-----|----------|
| Monday | **Long run** (key run) + IT band/neck |
| Tuesday | Upper body strength (supersets) + IT band/neck |
| Wednesday | **Tempo run** + IT band/neck |
| Thursday | Lower body strength (supersets) + IT band/neck |
| Friday | Easy run + IT band/neck |
| Saturday | Recovery run + mini upper body (OK to skip) |
| Sunday | Rest / family walk |

## IT Band Protocol (Daily, all training days, 5-10 min)

1. Foam roll TFL/outer thigh — 60 sec each side (NOT directly on IT band at knee)
2. Cross-leg toe touch stretch — 30 sec each side, 2x
3. Pigeon stretch (or figure-4) — 30 sec each side
4. Clamshells — 15 reps x 2 sets each side (band above knees if easy)
5. Single-leg glute bridges — 10 reps each side x 2 sets
6. Side-lying leg raises — 15 reps x 2 sets each side (straight leg, slightly behind)

## Neck Protocol (Daily, all training days, 2 min)

1. Chin tucks — 10 reps x 5 sec hold
2. Levator scapulae stretch — 30 sec each side, 2x
3. Neck rotations with overpressure — 5 each direction, hold 5 sec

## Strength: Upper Body — Supersets (Tuesday + mini on Saturday)

**Superset A** (3 rounds):
- Incline push-ups (stairs) — max reps
- Dumbbell rows — 10 each arm (25-30 lbs). Do all reps one side then switch.
- Rest 45 sec after both

**Superset B** (3 rounds):
- Overhead press — 10 reps (20-25 lbs)
- Band pull-aparts — 15 reps
- Rest 30 sec after both

**Superset C** (3 rounds):
- Dead hang — 15-30 sec
- Plank — 30-45 sec
- Rest 30 sec after both

**Solo:**
- Negative pull-ups — 3 x 3-5 (lower over 5 sec, full 60 sec rest)

**Saturday mini session**: 2 sets push-ups, 2 sets dead hangs, 2 sets band pull-aparts

## Strength: Lower Body — Supersets (Thursday)

**Superset A** (3 rounds):
- Goblet squats — 12 reps (30 lb dumbbell)
- Dead bugs — 10 each side
- Rest 30 sec after both

**Superset B** (3 rounds):
- Romanian deadlifts — 10 reps (both dumbbells, 25-30 lbs)
- Calf raises — 15 reps (edge of stair)
- Rest 30 sec after both

**Superset C** (3 rounds):
- Walking lunges — 10 each leg (20 steps total per set)
- Copenhagen plank — 15 sec each side (right then left = 1 set)
- Rest 30 sec after both

**Solo:**
- Clamshells (banded) — 3 x 15 each side. Do all reps right, then left = 1 set.

## Bilateral Exercise Rule

For any exercise done one side at a time: complete all reps on BOTH sides before counting it as one set. Rest timer starts after both sides are done.

## Equipment Available

- Dumbbells up to 30 lbs
- Resistance bands
- Pull-up bar (door frame mount)
- Treadmill (with incline up to at least 8%)
- Stairs (for incline push-ups)

## Weight Loss Strategy

- **Target deficit**: 500-750 cal/day (1-1.5 lbs/week)
- **Maintenance calories**: ~2,800-3,000/day with activity
- **Biggest lever**: Nighttime snacking (400-800 cal)
  - Popcorn (air-popped) is the best snack option (~150 cal)
  - Ice cream: smaller bowl or protein ice cream, 2x/week treat
  - Nachos: once-a-week max (600-1000 cal bomb)
  - Rule: ONE snack per night, serve a portion, put container away
- **Meals**: Don't overhaul, just slightly smaller portions. Front-load calories earlier in day.
- **Don't cut calories** on high-activity days (long runs, ultimate frisbee)
- **No liquid calories**: Water, black coffee, tea only

## Race Readiness Meter (0-100%)

| Factor | Weight | 100% threshold |
|--------|--------|----------------|
| Longest run | 30% | 11 miles (don't need to run full 13.1 before race) |
| Weekly mileage consistency | 20% | 18 mi/week avg, 4 of 4 weeks active |
| Weight progress | 20% | At goal weight (200 lbs) |
| Workout completion rate | 15% | All planned workouts done (14-day window) |
| IT band status | 15% | Running 6+ miles flat/outdoors pain-free |

## Weekly Scorecard (Auto-calculated)

- Workouts completed vs planned
- Miles run this week
- Nutrition average (from daily 1-10 ratings)
- Weight trend direction
- Current streak
- Combined into letter grade (A/B/C/D)

## Milestones to Track

- First outdoor run pain-free
- Run 5, 8, 10, 12 miles
- Under 220, 210, 200 lbs
- 7-day, 30-day, 60-day streak
- First unassisted pull-up
- 10 full push-ups, 20 full push-ups

## Progression Notes

- **Running**: Auto-progresses weekly (duration in Phase 1, distance in Phase 2-3)
- **Strength**: Same exercises throughout. Progression comes from adding weight, more reps, or harder variations (lower stair for push-ups, slower negatives, attempt full pull-up)
- **Push-up progression**: Counter height → 4th stair → 3rd → 2nd → 1st → floor. Move down when you can do 15+ at current level.
- **Pull-up progression**: Dead hangs → negative pull-ups (5 sec) → band-assisted → full pull-up. Expected timeline: 6-8 weeks to first rep.
- **Upper body frequency**: 2x/week (full Tuesday + mini Saturday) for faster push-up/pull-up gains

## Calorie Formula (ACSM for incline running)

```
VO2 = (0.2 × speed_m_per_min) + (0.9 × speed_m_per_min × grade) + 3.5
Cal/min = VO2 × weight_kg / 200
```

At 225 lbs, 5.5 mph, 8% incline: ~18 cal/min (~540 cal for 30 min)
Compare to flat at same speed: ~12 cal/min (~360 cal for 30 min)
Incline running burns ~50% more calories at same speed.

## Gamification & Psychology

- **Streaks**: Most powerful motivator. Rest days (Sunday, Wednesday frisbee) don't break the streak.
- **Race readiness meter**: Watching it climb is addictive. Combines all progress factors.
- **Weekly scorecard**: Auto-graded letter grade keeps accountability without being punitive.
- **Milestones**: Celebration moments for concrete achievements.
- **Loss aversion**: Once you have a 20-day streak, the thought of losing it is more motivating than reaching 21.
- **Saturday is optional**: Removes guilt on family days. If you do it, it's bonus. If you skip, no streak break.
