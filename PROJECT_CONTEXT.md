# Race Ready - Project Context

## What This Is

A PWA (Progressive Web App) that serves as a personal half marathon training companion. Built with plain HTML/CSS/JavaScript, hosted free on GitHub Pages, syncs data to Google Sheets. Dark-themed, mobile-first design.

## Key URLs and IDs

- **Live app**: https://jonmortensen12.github.io/fitness-tracker/
- **GitHub repo**: https://github.com/jonmortensen12/fitness-tracker
- **GitHub username**: jonmortensen12
- **Google Cloud Client ID**: 684988331804-lj0n1cdvf2nns154vfrv4oacies9q4sg.apps.googleusercontent.com
- **Google Spreadsheet ID**: 1pbxXdSpjyVr61wGO9972nA0goBPFLoK-Q4XfTrNG-to
- **Google Sheet tabs**: Runs, Weight, Strength, Nutrition, Completions

## Local Project Path

```
c:\Users\jdmort\Documents\Local Active Projects\Git Projects\Fitness Tracker\
```

Note: Kiro must use lowercase `c:\` due to a known bug.

## File Structure

| File | Purpose |
|------|---------|
| index.html | Main app UI - 5 views (Today, Week, Log, Progress, Workout Walker) |
| app.js | Navigation, form handling, stats, streak calculation, initialization |
| training-plan.js | 21-week training plan logic, IT band/neck protocols, strength workouts, calorie formula |
| google-sheets.js | Google OAuth, read/write to Sheets API, offline queue, sync |
| progress.js | Race readiness calculation, weight chart (canvas), scorecard, milestones |
| workout-walker.js | Step-through exercise interface with rest timers |
| styles.css | Dark theme, mobile-first responsive design |
| service-worker.js | Network-first caching for offline support |
| manifest.json | PWA config (name, icons, start URL) |

## Technical Notes

- **Timezone bug fix**: All date strings must use `'T12:00:00'` suffix when creating Date objects to avoid UTC midnight rolling back a day in US timezones
- **Auth persistence**: On load, app silently requests a fresh token if user was previously signed in
- **Offline queue**: Entries logged before sign-in are stored in `unsynced_*` localStorage keys and flushed on auth
- **Service worker**: Network-first strategy — always tries fresh content, falls back to cache for offline
- **Git**: Must use `& "C:\Program Files\Git\bin\git.exe"` in Kiro terminal, or use Git Bash for push

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

## Current Limitations

- **IT Band**: Lateral knee pain on outside of knee, ~1 mile into outdoor/flat runs. Worse downhill. Zero pain at 8% treadmill incline. Cross-leg toe touch stretch provides relief. Likely weak hip abductors.
- **Current fitness**: 5K in ~40 min at 8% incline (5.5 mph first mile, slowing to 5 mph with some 3.5 mph walking). Keeping incline at 8% throughout.
- **Strength**: Cannot do 10 full push-ups. Cannot do 1 unassisted pull-up.
- **Neck pain**: Left side, restricts head rotation. Posture-related (desk work).
- **Weight**: Trending up due to reduced running volume. Nighttime snacking (popcorn, ice cream, nachos) is the biggest calorie excess.

## Schedule Constraints

- **Mornings before 6 AM**: Primary workout time
- **Wednesday evenings (summer)**: Ultimate frisbee games — need fresh legs
- **Saturdays**: Sometimes basketball at night
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
- Increase distance 10% per week
- Long runs build from 5 to 11 miles
- Continue weight loss

### Phase 3: Weeks 15-20 (Oct 20 - Nov 14) — Race Prep
- Peak mileage (long runs: 10, 11, 12, 13, 10, 8)
- Practice race pace (10:00/mile)
- Taper in final 2 weeks
- Fall schedule (no ultimate frisbee)

### Week 21 (Nov 17-21) — Race Week
- Short easy shakeout runs Mon/Wed
- Rest Thu/Fri
- RACE DAY Saturday Nov 21

## Weekly Schedule (Summer — through ~Week 12)

| Day | Activity |
|-----|----------|
| Monday | Run (incline treadmill) + IT band protocol |
| Tuesday | Upper body strength + core + neck stretches |
| Wednesday | Light stretch AM → Ultimate frisbee evening |
| Thursday | Lower body strength + core + IT band protocol |
| Friday | Run (treadmill) + IT band protocol |
| Saturday | Long run + family walk |
| Sunday | Rest / family walk |

## Weekly Schedule (Fall — Weeks 13+)

| Day | Activity |
|-----|----------|
| Monday | Easy run + IT band protocol |
| Tuesday | Upper body strength + core |
| Wednesday | Rest |
| Thursday | Tempo run + IT band protocol |
| Friday | Lower body strength + core |
| Saturday | Long run |
| Sunday | Rest / family walk |

## IT Band Protocol (Daily, 5-10 min)

1. Foam roll TFL/outer thigh — 60 sec each side (NOT directly on IT band at knee)
2. Cross-leg toe touch stretch — 30 sec each side, 2x
3. Pigeon stretch (or figure-4) — 30 sec each side
4. Clamshells — 15 reps x 2 sets (band above knees if easy)
5. Single-leg glute bridges — 10 reps each side x 2 sets
6. Side-lying leg raises — 15 reps x 2 sets (straight leg, slightly behind)

## Neck Protocol (Daily, 2 min)

1. Chin tucks — 10 reps x 5 sec hold
2. Levator scapulae stretch — 30 sec each side, 2x
3. Neck rotations with overpressure — 5 each direction, hold 5 sec

## Strength: Upper Body (Tuesday)

1. Incline push-ups (stairs) — 3 x max reps (progress to lower stairs)
2. Dumbbell rows — 3 x 10 each arm (25-30 lbs)
3. Overhead press — 3 x 10 (20-25 lbs)
4. Band pull-aparts — 3 x 15
5. Dead hang — 3 x 15-30 sec
6. Negative pull-ups — 3 x 3-5 (lower over 5 sec)
7. Plank — 3 x 30-45 sec

## Strength: Lower Body (Thursday summer / Friday fall)

1. Goblet squats — 3 x 12 (30 lb dumbbell)
2. Romanian deadlifts — 3 x 10 (both dumbbells, 25-30 lbs)
3. Walking lunges — 3 x 10 each leg
4. Calf raises — 3 x 15 (edge of stair)
5. Clamshells (banded) — 3 x 15
6. Copenhagen plank — 3 x 15 sec each side
7. Dead bugs — 3 x 10 each side

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
| Longest run | 30% | 11 miles |
| Weekly mileage consistency | 20% | 18 mi/week avg, 4 of 4 weeks active |
| Weight progress | 20% | At goal weight (200 lbs) |
| Workout completion rate | 15% | All planned workouts done (14-day window) |
| IT band status | 15% | Running 6+ miles flat/outdoors pain-free |

## Milestones to Track

- First outdoor run pain-free
- Run 5, 8, 10, 12 miles
- Under 220, 210, 200 lbs
- 7-day, 30-day, 60-day streak
- First unassisted pull-up
- 10 full push-ups, 20 full push-ups

## Calorie Formula (ACSM for incline running)

```
VO2 = (0.2 × speed_m_per_min) + (0.9 × speed_m_per_min × grade) + 3.5
Cal/min = VO2 × weight_kg / 200
```

At 225 lbs, 5.5 mph, 8% incline: ~18 cal/min (~540 cal for 30 min)
Compare to flat at same speed: ~12 cal/min (~360 cal for 30 min)
