// ========================================
// Training Plan - 21 Week Half Marathon Program
// ========================================
// Race Day: November 21, 2026 (Saturday)
// Plan Start: June 30, 2026 (Monday of Week 1)
// Phase 1 (Weeks 1-6): Rehab - IT band fix, incline treadmill, build hip strength
// Phase 2 (Weeks 7-14): Build - Transition to flat/outdoor, increase distance
// Phase 3 (Weeks 15-20): Race Prep - Peak mileage, practice race pace, taper
// Week 21: Race week

const RACE_DATE = '2026-11-21';
const PLAN_START = '2026-06-30'; // Monday of week 1
const GOAL_WEIGHT = 200;
const START_WEIGHT = 228;

// --- IT Band Protocol (daily) ---
const IT_BAND_PROTOCOL = [
    { name: 'Foam Roll TFL/Outer Thigh', sets: 1, reps: '60 sec each side', rest: 0,
      notes: 'Roll the muscle above the knee, not directly on IT band',
      cues: 'Lie on your side with the roller under your upper outer thigh (between hip and knee). Roll slowly, pausing on tender spots. Keep core engaged to control pressure.',
      video: 'https://www.youtube.com/watch?v=iqY3sQRGzNI' },
    { name: 'Cross-Leg Toe Touch Stretch', sets: 2, reps: '30 sec each side', rest: 0,
      notes: 'Cross one leg behind the other, reach for toes',
      cues: 'Stand tall. Cross your right leg behind your left. Reach down toward your left toes, pushing hips to the right. You should feel a stretch along the outside of your right hip/thigh.',
      video: 'https://www.youtube.com/watch?v=5PXIy4Q_LhI' },
    { name: 'Pigeon Stretch', sets: 2, reps: '30 sec each side', rest: 0,
      notes: 'Or figure-4 stretch lying on back',
      cues: 'From all fours, bring right knee forward behind your right wrist. Extend left leg back. Sink hips toward floor. Keep hips square. Feel the stretch deep in the right glute.',
      video: 'https://www.youtube.com/watch?v=_fLxXFfxFSM' },
    { name: 'Clamshells', sets: 2, reps: 15, rest: 20,
      notes: 'Band above knees if too easy. Keep hips stacked.',
      cues: 'Lie on your side, knees bent 45 degrees, feet together. Lift top knee as high as possible without rolling your hips back. Squeeze the glute at the top. Slow and controlled.',
      video: 'https://www.youtube.com/watch?v=bC5MNJsVmPk' },
    { name: 'Single-Leg Glute Bridges', sets: 2, reps: 10, rest: 20,
      notes: 'Drive through heel, squeeze glute at top',
      cues: 'Lie on back, one foot flat on floor close to butt. Extend other leg up. Push through your heel to lift hips. Squeeze glute hard at top for 1 second. Don\'t let hips rotate.',
      video: 'https://www.youtube.com/watch?v=AVAXhy6pl7o' },
    { name: 'Side-Lying Leg Raises', sets: 2, reps: 15, rest: 20,
      notes: 'Straight leg, slightly behind you, toe pointed down',
      cues: 'Lie on your side, bottom leg slightly bent for stability. Top leg straight, angled slightly behind you (not forward). Point toe slightly downward. Lift from the hip, not the ankle. Keep it slow.',
      video: 'https://www.youtube.com/watch?v=jghbMRTjFQI' }
];

// --- Neck Protocol (daily, 2 min) ---
const NECK_PROTOCOL = [
    { name: 'Chin Tucks', sets: 1, reps: '10 x 5 sec hold', rest: 0,
      notes: 'Pull chin straight back, make a double chin',
      cues: 'Sit or stand tall. Pull your chin straight back (not down) as if making a double chin. Hold 5 seconds. You should feel a gentle stretch at the base of your skull. Avoid tilting your head.',
      video: 'https://www.youtube.com/watch?v=wQylqaCl8Zo' },
    { name: 'Levator Scapulae Stretch', sets: 2, reps: '30 sec each side', rest: 0,
      notes: 'Look down at armpit, gently pull head with hand',
      cues: 'Turn your head 45 degrees (look at your armpit). Gently pull your head down with the same-side hand. Feel the stretch along the back/side of your neck. Keep opposite shoulder relaxed and down.',
      video: 'https://www.youtube.com/watch?v=CsAMt7bmFHo' },
    { name: 'Neck Rotations with Overpressure', sets: 1, reps: '5 each direction', rest: 0,
      notes: 'Turn head, gently push a bit further, hold 5 sec',
      cues: 'Turn your head as far as comfortable. Place fingertips on your chin and gently push a tiny bit further. Hold 5 seconds. Be gentle — this is mobility work, not a deep stretch. Never force through pain.',
      video: 'https://www.youtube.com/watch?v=xMTw3WjfEfI' }
];

// --- Strength: Upper Body + Core (Tuesday) ---
const UPPER_BODY = [
    { name: 'Incline Push-ups', sets: 3, reps: 'Max reps', rest: 60,
      notes: 'Use stairs. Progress to lower stair as you get stronger.',
      cues: 'Hands on stair edge, shoulder-width apart. Body in a straight line from head to heels. Lower chest to the stair, elbows at ~45 degrees (not flared out). Push back up. Once you can do 15+, move to a lower stair.',
      video: 'https://www.youtube.com/watch?v=WmMLkpCnUkQ' },
    { name: 'Dumbbell Rows', sets: 3, reps: 10, rest: 60,
      notes: '25-30 lbs each arm. Pull to hip, squeeze shoulder blade.',
      cues: 'One hand and knee on bench/couch for support. Other hand holds dumbbell. Pull the weight to your hip (not your armpit). Squeeze your shoulder blade back at the top. Keep core tight, back flat.',
      video: 'https://www.youtube.com/watch?v=xl1YEsQpWwg' },
    { name: 'Overhead Press', sets: 3, reps: 10, rest: 60,
      notes: '20-25 lbs. Stand tall, brace core.',
      cues: 'Stand with feet shoulder-width, dumbbells at shoulder height. Brace your core (squeeze abs). Press straight up until arms are fully extended. Lower slowly under control. Don\'t arch your lower back.',
      video: 'https://www.youtube.com/watch?v=qEwKCR5JCog' },
    { name: 'Band Pull-Aparts', sets: 3, reps: 15, rest: 45,
      notes: 'Arms straight, pull band to chest level. Great for posture.',
      cues: 'Hold band in front at shoulder height, arms straight, slight tension. Pull the band apart by squeezing shoulder blades together. End with hands wide, band touching your chest. Slow return. Helps counter desk posture.',
      video: 'https://www.youtube.com/watch?v=fPJqk21Amn4' },
    { name: 'Dead Hang', sets: 3, reps: '15-30 sec', rest: 45,
      notes: 'Pull-up bar. Decompresses spine, builds grip for pull-ups.',
      cues: 'Grab the bar with an overhand grip, shoulder-width. Let your body hang with arms fully straight. Relax your shoulders slightly (active hang: pull shoulders down from ears). Breathe. Great for grip, shoulders, and spine decompression.',
      video: 'https://www.youtube.com/watch?v=M9L1i3esNVk' },
    { name: 'Negative Pull-ups', sets: 3, reps: '3-5', rest: 60,
      notes: 'Jump up, lower yourself over 5 seconds. Key to first pull-up.',
      cues: 'Jump or step up so your chin is over the bar. Now lower yourself as slowly as possible (aim for 5 seconds). Fight gravity the whole way down. This builds the strength for your first full pull-up faster than anything else.',
      video: 'https://www.youtube.com/watch?v=S3gNgnAR37g' },
    { name: 'Plank', sets: 3, reps: '30-45 sec', rest: 45,
      notes: 'Elbows under shoulders, squeeze glutes, don\'t sag.',
      cues: 'Forearms on ground, elbows directly under shoulders. Body in a straight line — squeeze glutes, brace abs as if someone is about to punch your stomach. Don\'t let hips sag or pike up. Breathe normally.',
      video: 'https://www.youtube.com/watch?v=BQu26ABuVS0' }
];

// --- Strength: Lower Body + Core (Thursday summer / Friday fall) ---
const LOWER_BODY = [
    { name: 'Goblet Squats', sets: 3, reps: 12, rest: 60,
      notes: 'Hold one 30 lb dumbbell at chest. Sit back, knees track toes.',
      cues: 'Hold dumbbell vertically at your chest with both hands. Feet shoulder-width, toes slightly out. Sit back and down as if into a chair. Knees track over toes (don\'t cave in). Go as deep as comfortable. Drive up through heels.',
      video: 'https://www.youtube.com/watch?v=MeIiIdhvXT4' },
    { name: 'Romanian Deadlifts', sets: 3, reps: 10, rest: 60,
      notes: 'Both dumbbells, 25-30 lbs. Hinge at hips, slight knee bend.',
      cues: 'Stand holding dumbbells in front of thighs. Slight bend in knees (keep constant throughout). Push hips back and hinge forward, sliding weights down your legs. Feel the stretch in your hamstrings. Drive hips forward to stand. Back stays flat throughout.',
      video: 'https://www.youtube.com/watch?v=XISJxsccN68' },
    { name: 'Walking Lunges', sets: 3, reps: '10 each leg', rest: 60,
      notes: 'Bodyweight or light dumbbells. Big step, knee doesn\'t pass toe.',
      cues: 'Take a big step forward. Lower until back knee nearly touches the floor. Front knee stays over ankle (not past toes). Push off front foot to step into the next lunge. Keep torso upright, core engaged.',
      video: 'https://www.youtube.com/watch?v=L8fvypPH3qs' },
    { name: 'Calf Raises', sets: 3, reps: 15, rest: 45,
      notes: 'Edge of a stair for full range. Slow on the way down.',
      cues: 'Stand on the edge of a stair with heels hanging off. Rise up onto your toes as high as possible. Squeeze at the top. Lower slowly below stair level for a full stretch. Hold something for balance.',
      video: 'https://www.youtube.com/watch?v=gwLzBJYoWlI' },
    { name: 'Clamshells (Banded)', sets: 3, reps: 15, rest: 30,
      notes: 'Doubles as IT band rehab. Keep hips stacked.',
      cues: 'Same as IT band protocol clamshells but with a resistance band above your knees for extra challenge. Focus on not letting your hips roll backward.',
      video: 'https://www.youtube.com/watch?v=bC5MNJsVmPk' },
    { name: 'Copenhagen Plank', sets: 3, reps: '15 sec each side', rest: 30,
      notes: 'Top leg on bench/chair edge. Inner thigh + hip stability.',
      cues: 'Side plank position with top leg resting on a bench or sturdy chair (inner thigh on the edge). Bottom leg hangs free. Lift hips to form a straight line. Hold. This targets the adductors (inner thigh) which support knee stability.',
      video: 'https://www.youtube.com/watch?v=ePjd3HO5rMI' },
    { name: 'Dead Bugs', sets: 3, reps: '10 each side', rest: 30,
      notes: 'Low back pressed to floor. Slow and controlled.',
      cues: 'Lie on back, arms pointing to ceiling, knees bent 90 degrees. Press your lower back firmly into the floor (flatten the arch). Slowly extend one arm overhead and opposite leg out straight. Return. Switch sides. If your back arches, you\'ve gone too far.',
      video: 'https://www.youtube.com/watch?v=4XLEnwUr1d8' }
];

// --- Weekly Plan Generator ---
// Returns the plan for a given week number (1-21)
function getWeekPlan(weekNum) {
    // Summer schedule (ultimate frisbee): Mon run, Tue upper, Wed rest/frisbee, Thu lower, Fri run, Sat long, Sun rest
    // Fall schedule (no frisbee): Mon run, Tue upper, Wed rest, Thu run, Fri lower, Sat long, Sun rest
    const isSummer = weekNum <= 12; // roughly through mid-September

    if (weekNum <= 6) return getPhase1Week(weekNum, isSummer);
    if (weekNum <= 14) return getPhase2Week(weekNum, isSummer);
    if (weekNum <= 20) return getPhase3Week(weekNum);
    return getRaceWeek();
}

function getPhase1Week(week, isSummer) {
    // Incline treadmill, building IT band strength
    const baseMin = 25 + (week * 2); // 27-37 min progression
    const longMin = 35 + (week * 2); // 37-47 min

    const plan = {
        mon: { type: 'run', title: 'Incline Run', desc: `${baseMin} min at 8% incline. Jog 5.5 mph, walk as needed.`, warmup: IT_BAND_PROTOCOL.concat(NECK_PROTOCOL) },
        tue: { type: 'strength', title: 'Upper Body + Core', desc: 'Push-ups, rows, press, pull-up progression, plank', exercises: UPPER_BODY, warmup: NECK_PROTOCOL },
        wed: { type: 'rest', title: isSummer ? 'Ultimate Frisbee' : 'Rest', desc: isSummer ? 'Light stretch AM. Play hard tonight!' : 'Rest day. Light stretch if desired.' },
        thu: isSummer ?
            { type: 'strength', title: 'Lower Body + Core', desc: 'Squats, RDLs, lunges, calf raises, core', exercises: LOWER_BODY, warmup: IT_BAND_PROTOCOL } :
            { type: 'run', title: 'Incline Run', desc: `${baseMin - 5} min at 8% incline. Focus on continuous jogging.`, warmup: IT_BAND_PROTOCOL.concat(NECK_PROTOCOL) },
        fri: isSummer ?
            { type: 'run', title: 'Incline Run', desc: `${baseMin - 5} min at 8% incline. Easy effort after yesterday's legs.`, warmup: IT_BAND_PROTOCOL.concat(NECK_PROTOCOL) } :
            { type: 'strength', title: 'Lower Body + Core', desc: 'Squats, RDLs, lunges, calf raises, core', exercises: LOWER_BODY, warmup: IT_BAND_PROTOCOL },
        sat: { type: 'run', title: 'Long Incline Run', desc: `${longMin} min at 6-8% incline. Slow and steady.`, warmup: IT_BAND_PROTOCOL },
        sun: { type: 'rest', title: 'Rest / Family Walk', desc: 'Enjoy the walk! Active recovery.' }
    };

    // Week 4-5: add flat test
    if (week === 4 || week === 5) {
        plan.mon.desc += ' Then test: 10 min at 0% incline, 6.5 mph. Note any knee pain.';
    }

    return plan;
}

function getPhase2Week(week, isSummer) {
    // Transition to flat/outdoor, increase distance
    const weekInPhase = week - 6; // 1-8
    const easyMiles = 3.5 + (weekInPhase * 0.25); // 3.75 - 5.5
    const longMiles = 5 + (weekInPhase * 0.75); // 5.75 - 11

    const plan = {
        mon: { type: 'run', title: 'Easy Run', desc: `${easyMiles.toFixed(1)} miles easy pace. Flat or slight incline.`, warmup: IT_BAND_PROTOCOL.concat(NECK_PROTOCOL) },
        tue: { type: 'strength', title: 'Upper Body + Core', desc: 'Push-ups, rows, press, pull-up progression, plank', exercises: UPPER_BODY, warmup: NECK_PROTOCOL },
        wed: { type: 'rest', title: isSummer ? 'Ultimate Frisbee' : 'Rest', desc: isSummer ? 'Light stretch AM. Play hard tonight!' : 'Rest day.' },
        thu: isSummer ?
            { type: 'strength', title: 'Lower Body + Core', desc: 'Squats, RDLs, lunges, calf raises, core', exercises: LOWER_BODY, warmup: IT_BAND_PROTOCOL } :
            { type: 'run', title: 'Tempo Run', desc: `${(easyMiles - 0.5).toFixed(1)} miles. Middle miles at 9:30-10:00 pace.`, warmup: IT_BAND_PROTOCOL.concat(NECK_PROTOCOL) },
        fri: isSummer ?
            { type: 'run', title: 'Moderate Run', desc: `${(easyMiles - 0.5).toFixed(1)} miles. Steady effort.`, warmup: IT_BAND_PROTOCOL.concat(NECK_PROTOCOL) } :
            { type: 'strength', title: 'Lower Body + Core', desc: 'Squats, RDLs, lunges, calf raises, core', exercises: LOWER_BODY, warmup: IT_BAND_PROTOCOL },
        sat: { type: 'run', title: 'Long Run', desc: `${longMiles.toFixed(1)} miles. Slow pace (10:30-11:00/mi). Walk water breaks are fine.`, warmup: IT_BAND_PROTOCOL },
        sun: { type: 'rest', title: 'Rest / Family Walk', desc: 'Active recovery. Keep it easy.' }
    };

    // Mid-phase: encourage outdoor running
    if (weekInPhase >= 3) {
        plan.mon.desc += ' Try outdoors if knee allows.';
        plan.sat.desc += ' Aim for outdoors.';
    }

    return plan;
}

function getPhase3Week(week) {
    // Race prep - peak mileage, taper. Fall schedule (no frisbee)
    const weekInPhase = week - 14; // 1-6
    const longRunMiles = [10, 11, 12, 13, 10, 8]; // peak then taper
    const easyMiles = [5, 5, 5.5, 5.5, 4.5, 4]; // taper down last 2 weeks
    const tempoMiles = [4, 4.5, 4.5, 5, 4, 3]; // taper

    const plan = {
        mon: { type: 'run', title: 'Easy Run', desc: `${easyMiles[weekInPhase - 1]} miles easy. Conversational pace.`, warmup: IT_BAND_PROTOCOL.concat(NECK_PROTOCOL) },
        tue: { type: 'strength', title: 'Upper Body + Core', desc: 'Push-ups, rows, press, pull-ups, plank', exercises: UPPER_BODY, warmup: NECK_PROTOCOL },
        wed: { type: 'rest', title: 'Rest', desc: 'Rest day. Light stretch and foam roll.' },
        thu: { type: 'run', title: 'Tempo Run', desc: `${tempoMiles[weekInPhase - 1]} miles. Race pace practice (10:00/mi) for middle miles.`, warmup: IT_BAND_PROTOCOL.concat(NECK_PROTOCOL) },
        fri: { type: 'strength', title: 'Lower Body + Core', desc: 'Squats, RDLs, lunges, core. Lighter weights in taper weeks.', exercises: LOWER_BODY, warmup: IT_BAND_PROTOCOL },
        sat: { type: 'run', title: 'Long Run', desc: `${longRunMiles[weekInPhase - 1]} miles. Steady 10:00-10:30/mi pace.`, warmup: IT_BAND_PROTOCOL },
        sun: { type: 'rest', title: 'Rest / Family Walk', desc: 'Active recovery.' }
    };

    // Taper adjustments (weeks 5-6 of phase, which is weeks 19-20 overall)
    if (weekInPhase >= 5) {
        plan.tue.desc = 'Lighter session. Maintain form, reduce volume.';
        plan.fri.desc = 'Light session. Keep muscles active, don\'t fatigue.';
    }

    return plan;
}

function getRaceWeek() {
    return {
        mon: { type: 'run', title: 'Easy Shakeout', desc: '3 miles very easy. Shake out the legs.', warmup: IT_BAND_PROTOCOL },
        tue: { type: 'rest', title: 'Rest', desc: 'Rest. Hydrate well. Eat normally.' },
        wed: { type: 'run', title: 'Short Shakeout', desc: '2 miles easy. A few 30-sec pickups at race pace.', warmup: IT_BAND_PROTOCOL },
        thu: { type: 'rest', title: 'Rest', desc: 'Rest. Pack race gear. Early dinner, early bed.' },
        fri: { type: 'rest', title: 'Rest', desc: 'Travel day if needed. Light walk. Hydrate. Carb-load dinner.' },
        sat: { type: 'race', title: 'RACE DAY!', desc: '13.1 miles. Gilbert Days Half Marathon. Target: 2:11 (10:00/mi). Trust your training!' },
        sun: { type: 'rest', title: 'Recovery', desc: 'You did it! Celebrate. Easy walk if you feel like it.' }
    };
}

// --- Utilities ---

function getWeekNumber(dateStr) {
    // Returns 1-21 based on plan start date, or 0 if before plan, 22+ if after
    // Use noon to avoid timezone issues with date-only strings
    const date = new Date(dateStr + 'T12:00:00');
    const start = new Date(PLAN_START + 'T12:00:00');
    const diffDays = Math.floor((date - start) / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7) + 1;
}

function getDayOfWeek(dateStr) {
    // Returns 'mon', 'tue', etc.
    const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    return days[new Date(dateStr + 'T12:00:00').getDay()];
}

function getTodayPlan() {
    const today = new Date().toISOString().split('T')[0];
    const week = getWeekNumber(today);
    if (week < 1 || week > 21) return null;
    const weekPlan = getWeekPlan(week);
    const day = getDayOfWeek(today);
    return { ...weekPlan[day], week, day, date: today };
}

function getWeekPlanForDate(dateStr) {
    const week = getWeekNumber(dateStr);
    if (week < 1 || week > 21) return null;
    return { weekNum: week, plan: getWeekPlan(week) };
}

function getMonday(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    // Return local date string (avoid toISOString which uses UTC)
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${dd}`;
}

function getDaysUntilRace() {
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const race = new Date(RACE_DATE + 'T12:00:00');
    return Math.round((race - today) / (1000 * 60 * 60 * 24));
}

function getPhaseLabel(weekNum) {
    if (weekNum <= 6) return 'Phase 1: Rehab & Build';
    if (weekNum <= 14) return 'Phase 2: Distance Build';
    if (weekNum <= 20) return 'Phase 3: Race Prep';
    return 'Race Week';
}

// Calorie calculation for incline running
function calculateRunCalories(distanceMiles, durationMin, inclinePercent, weightLbs) {
    const weightKg = weightLbs / 2.205;
    const speedMph = distanceMiles / (durationMin / 60);
    const speedMetersPerMin = speedMph * 26.82;
    const grade = inclinePercent / 100;

    // ACSM metabolic equation for running
    // VO2 = 0.2*speed + 0.9*speed*grade + 3.5 (ml/kg/min)
    const vo2 = (0.2 * speedMetersPerMin) + (0.9 * speedMetersPerMin * grade) + 3.5;

    // Calories per minute = VO2 * weight(kg) / 200
    const calPerMin = vo2 * weightKg / 200;
    return Math.round(calPerMin * durationMin);
}
