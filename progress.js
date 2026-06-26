// ========================================
// Progress - Readiness, Weight Graph, Scorecard, Milestones
// ========================================

// --- Race Readiness Calculation ---
function calculateReadiness() {
    const runs = Storage.get('runs');
    const weights = Storage.get('weights');
    const completed = getCompletedDates();

    // Factor 1: Longest run (30% weight) - capped at 11 miles = 100%
    const longestRun = runs.reduce((max, r) => Math.max(max, r.distance || 0), 0);
    const longestRunScore = Math.min((longestRun / 11) * 100, 100);

    // Factor 2: Weekly mileage consistency (20%) - rolling 4-week avg vs target
    const weeklyMileageScore = calculateMileageConsistency(runs);

    // Factor 3: Weight progress (20%) - position between start (228) and goal (200)
    let weightScore = 0;
    if (weights.length > 0) {
        const currentWeight = weights[0].weight;
        const totalToLose = START_WEIGHT - GOAL_WEIGHT; // 28 lbs
        const lost = START_WEIGHT - currentWeight;
        weightScore = Math.min(Math.max((lost / totalToLose) * 100, 0), 100);
    }

    // Factor 4: Workout completion rate (15%) - last 14 days
    const completionScore = calculateCompletionRate(completed);

    // Factor 5: IT band status (15%) - based on outdoor runs without pain
    const itBandScore = calculateITBandStatus(runs);

    const total = (longestRunScore * 0.30) +
                  (weeklyMileageScore * 0.20) +
                  (weightScore * 0.20) +
                  (completionScore * 0.15) +
                  (itBandScore * 0.15);

    return {
        total: Math.round(total),
        longestRun: Math.round(longestRunScore),
        mileage: Math.round(weeklyMileageScore),
        weight: Math.round(weightScore),
        completion: Math.round(completionScore),
        itBand: Math.round(itBandScore)
    };
}

function calculateMileageConsistency(runs) {
    // Get last 4 weeks of mileage
    const today = new Date();
    let totalMiles = 0;
    let weeksWithRuns = 0;

    for (let w = 0; w < 4; w++) {
        const weekStart = new Date(today);
        weekStart.setDate(weekStart.getDate() - (w * 7) - today.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const startStr = weekStart.toISOString().split('T')[0];
        const endStr = weekEnd.toISOString().split('T')[0];

        const weekMiles = runs
            .filter(r => r.date >= startStr && r.date <= endStr)
            .reduce((sum, r) => sum + r.distance, 0);

        if (weekMiles > 0) weeksWithRuns++;
        totalMiles += weekMiles;
    }

    // Target: consistent running (at least 3 of 4 weeks with meaningful mileage)
    const consistencyScore = (weeksWithRuns / 4) * 100;

    // Also factor in volume (avg miles per week vs a reasonable target of 15-20 for a HM build)
    const avgPerWeek = totalMiles / 4;
    const volumeScore = Math.min((avgPerWeek / 18) * 100, 100);

    return (consistencyScore * 0.5) + (volumeScore * 0.5);
}

function calculateCompletionRate(completed) {
    const today = new Date();
    let planned = 0;
    let done = 0;

    for (let i = 0; i < 14; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const weekNum = getWeekNumber(dateStr);

        if (weekNum >= 1 && weekNum <= 21) {
            const dayKey = getDayOfWeek(dateStr);
            const weekPlan = getWeekPlan(weekNum);
            if (weekPlan[dayKey] && weekPlan[dayKey].type !== 'rest') {
                planned++;
                if (completed.includes(dateStr)) done++;
            }
        }
    }

    return planned > 0 ? (done / planned) * 100 : 0;
}

function calculateITBandStatus(runs) {
    // Look for runs with 0% incline (flat/outdoor) in recent history
    const recentFlat = runs.filter(r => {
        const isRecent = r.date >= getDateDaysAgo(30);
        const isFlat = (r.incline || 0) === 0;
        return isRecent && isFlat;
    });

    if (recentFlat.length === 0) return 20; // Haven't tested yet
    if (recentFlat.length < 3) return 50; // Starting to test
    if (recentFlat.some(r => r.distance >= 4)) return 80; // Running 4+ miles flat
    if (recentFlat.some(r => r.distance >= 6)) return 100; // Cleared

    return 60;
}

// --- Render Progress View ---
function renderProgress() {
    renderReadinessDetail();
    renderWeightChart();
    renderScorecard();
    renderMilestones();
}

// --- Readiness Detail ---
function renderReadinessDetail() {
    const readiness = calculateReadiness();
    const container = document.getElementById('readiness-detail');

    const factors = [
        { label: 'Longest Run', value: readiness.longestRun, color: '--accent' },
        { label: 'Weekly Miles', value: readiness.mileage, color: '--accent' },
        { label: 'Weight Loss', value: readiness.weight, color: '--green' },
        { label: 'Consistency', value: readiness.completion, color: '--purple' },
        { label: 'IT Band', value: readiness.itBand, color: '--orange' }
    ];

    container.innerHTML = factors.map(f => `
        <div class="readiness-factor">
            <span class="readiness-factor-label">${f.label}</span>
            <div class="readiness-factor-bar">
                <div class="readiness-factor-fill" style="width:${f.value}%; background:var(${f.color})"></div>
            </div>
            <span class="readiness-factor-value">${f.value}%</span>
        </div>
    `).join('');
}

// --- Weight Chart (Canvas) ---
function renderWeightChart() {
    const canvas = document.getElementById('weight-chart');
    const ctx = canvas.getContext('2d');
    const weights = Storage.get('weights');

    // Set canvas resolution for retina
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    const W = rect.width;
    const H = rect.height;

    // Clear
    ctx.clearRect(0, 0, W, H);

    if (weights.length < 2) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = '14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Log at least 2 weigh-ins to see chart', W / 2, H / 2);
        document.getElementById('weight-projections').innerHTML = '';
        return;
    }

    // Sort weights by date (oldest first for charting)
    const sorted = [...weights].sort((a, b) => a.date.localeCompare(b.date));
    const padding = { top: 20, right: 12, bottom: 25, left: 38 };
    const chartW = W - padding.left - padding.right;
    const chartH = H - padding.top - padding.bottom;

    // Determine y-axis range
    const allWeights = sorted.map(w => w.weight);
    const minW = Math.min(...allWeights, GOAL_WEIGHT) - 2;
    const maxW = Math.max(...allWeights) + 2;

    // X positions based on date range
    const firstDate = new Date(sorted[0].date);
    const lastDate = new Date(sorted[sorted.length - 1].date);
    const dateRange = Math.max((lastDate - firstDate) / (1000 * 60 * 60 * 24), 1);

    function xPos(dateStr) {
        const d = new Date(dateStr);
        const dayOffset = (d - firstDate) / (1000 * 60 * 60 * 24);
        return padding.left + (dayOffset / dateRange) * chartW;
    }

    function yPos(weight) {
        return padding.top + ((maxW - weight) / (maxW - minW)) * chartH;
    }

    // Draw goal line
    ctx.strokeStyle = 'rgba(34, 197, 94, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(padding.left, yPos(GOAL_WEIGHT));
    ctx.lineTo(W - padding.right, yPos(GOAL_WEIGHT));
    ctx.stroke();
    ctx.setLineDash([]);

    // Goal label
    ctx.fillStyle = 'rgba(34, 197, 94, 0.6)';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${GOAL_WEIGHT}`, padding.left + 2, yPos(GOAL_WEIGHT) - 4);

    // Draw data points and line
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    sorted.forEach((w, i) => {
        const x = xPos(w.date);
        const y = yPos(w.weight);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.stroke();

    // Draw dots
    sorted.forEach(w => {
        const x = xPos(w.date);
        const y = yPos(w.weight);
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#3b82f6';
        ctx.fill();
    });

    // Draw 7-day smoothed trendline
    if (sorted.length >= 3) {
        const smoothed = calculateSmoothedTrend(sorted, 7);
        ctx.strokeStyle = 'rgba(168, 85, 247, 0.7)';
        ctx.lineWidth = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        smoothed.forEach((p, i) => {
            const x = xPos(p.date);
            const y = yPos(p.weight);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    }

    // Y-axis labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '10px sans-serif';
    ctx.textAlign = 'right';
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
        const w = maxW - (i / ySteps) * (maxW - minW);
        ctx.fillText(Math.round(w), padding.left - 4, padding.top + (i / ySteps) * chartH + 3);
    }

    // Projections
    renderWeightProjections(sorted);
}

function calculateSmoothedTrend(sorted, windowDays) {
    const smoothed = [];
    sorted.forEach(point => {
        const d = new Date(point.date);
        const windowStart = new Date(d);
        windowStart.setDate(windowStart.getDate() - windowDays);
        const startStr = windowStart.toISOString().split('T')[0];

        const windowPoints = sorted.filter(p => p.date >= startStr && p.date <= point.date);
        const avg = windowPoints.reduce((sum, p) => sum + p.weight, 0) / windowPoints.length;
        smoothed.push({ date: point.date, weight: avg });
    });
    return smoothed;
}

function renderWeightProjections(sorted) {
    const container = document.getElementById('weight-projections');

    if (sorted.length < 7) {
        container.innerHTML = '<p style="font-size:0.75rem; color:var(--text-muted); text-align:center;">Need 7+ weigh-ins for projections</p>';
        return;
    }

    // Calculate weekly trend (lbs/week based on last 14 days)
    const recent14 = sorted.filter(w => w.date >= getDateDaysAgo(14));
    const recent7 = sorted.filter(w => w.date >= getDateDaysAgo(7));

    let weeklyRate = 0;
    let monthlyRate = 0;

    if (recent7.length >= 2) {
        const first7 = recent7[0].weight;
        const last7 = recent7[recent7.length - 1].weight;
        const days7 = Math.max((new Date(recent7[recent7.length - 1].date) - new Date(recent7[0].date)) / (1000*60*60*24), 1);
        weeklyRate = ((last7 - first7) / days7) * 7;
    }

    if (recent14.length >= 2) {
        const first14 = recent14[0].weight;
        const last14 = recent14[recent14.length - 1].weight;
        const days14 = Math.max((new Date(recent14[recent14.length - 1].date) - new Date(recent14[0].date)) / (1000*60*60*24), 1);
        monthlyRate = ((last14 - first14) / days14) * 7;
    }

    // All-time trend
    const allTimeRate = sorted.length >= 2
        ? ((sorted[sorted.length - 1].weight - sorted[0].weight) /
           Math.max((new Date(sorted[sorted.length - 1].date) - new Date(sorted[0].date)) / (1000*60*60*24), 1)) * 7
        : 0;

    // Project to race day
    const currentWeight = sorted[sorted.length - 1].weight;
    const weeksToRace = getDaysUntilRace() / 7;

    const projWeekly = Math.round((currentWeight + weeklyRate * weeksToRace) * 10) / 10;
    const projMonthly = Math.round((currentWeight + monthlyRate * weeksToRace) * 10) / 10;
    const projAllTime = Math.round((currentWeight + allTimeRate * weeksToRace) * 10) / 10;

    container.innerHTML = `
        <div class="proj-item">
            <div class="proj-value">${projWeekly}</div>
            <div class="proj-label">Weekly trend</div>
        </div>
        <div class="proj-item">
            <div class="proj-value">${projMonthly}</div>
            <div class="proj-label">2-week trend</div>
        </div>
        <div class="proj-item">
            <div class="proj-value">${projAllTime}</div>
            <div class="proj-label">All-time trend</div>
        </div>
    `;
}

// --- Weekly Scorecard ---
function renderScorecard() {
    const container = document.getElementById('scorecard');
    const today = Storage.today();
    const monday = getMonday(today);

    // Workouts completed this week
    const completed = getCompletedDates();
    const weekCompleted = completed.filter(d => d >= monday).length;

    // Planned workouts this week (excluding rest days)
    let weekPlanned = 0;
    const weekNum = getWeekNumber(today);
    if (weekNum >= 1 && weekNum <= 21) {
        const plan = getWeekPlan(weekNum);
        Object.values(plan).forEach(day => {
            if (day.type !== 'rest') weekPlanned++;
        });
    }

    // Miles this week
    const weekMiles = getWeekMiles();

    // Nutrition average this week
    const nutrition = Storage.get('nutrition');
    const weekNutrition = nutrition.filter(n => n.date >= monday);
    const nutritionAvg = weekNutrition.length > 0
        ? (weekNutrition.reduce((sum, n) => sum + n.rating, 0) / weekNutrition.length).toFixed(1)
        : '--';

    // Weight direction
    const weights = Storage.get('weights');
    const weekWeights = weights.filter(w => w.date >= monday);
    let weightTrend = '--';
    if (weekWeights.length >= 2) {
        const sorted = [...weekWeights].sort((a, b) => a.date.localeCompare(b.date));
        const diff = sorted[sorted.length - 1].weight - sorted[0].weight;
        weightTrend = diff <= 0 ? `↓ ${Math.abs(diff).toFixed(1)} lbs` : `↑ ${diff.toFixed(1)} lbs`;
    }

    // Calculate grade
    const workoutPct = weekPlanned > 0 ? (weekCompleted / weekPlanned) * 100 : 0;
    const nutritionPct = nutritionAvg !== '--' ? (parseFloat(nutritionAvg) / 10) * 100 : 50;
    const overallPct = (workoutPct * 0.5) + (nutritionPct * 0.5);
    const grade = overallPct >= 90 ? 'A' : overallPct >= 80 ? 'A-' : overallPct >= 70 ? 'B+' :
                  overallPct >= 60 ? 'B' : overallPct >= 50 ? 'C+' : overallPct >= 40 ? 'C' : 'D';

    container.innerHTML = `
        <div class="scorecard-grade">${grade}</div>
        <div class="scorecard-row">
            <span class="scorecard-row-label">Workouts</span>
            <span class="scorecard-row-value">${weekCompleted} / ${weekPlanned}</span>
        </div>
        <div class="scorecard-row">
            <span class="scorecard-row-label">Miles</span>
            <span class="scorecard-row-value">${weekMiles.toFixed(1)} mi</span>
        </div>
        <div class="scorecard-row">
            <span class="scorecard-row-label">Nutrition Avg</span>
            <span class="scorecard-row-value">${nutritionAvg}/10</span>
        </div>
        <div class="scorecard-row">
            <span class="scorecard-row-label">Weight This Week</span>
            <span class="scorecard-row-value">${weightTrend}</span>
        </div>
        <div class="scorecard-row">
            <span class="scorecard-row-label">Streak</span>
            <span class="scorecard-row-value">${calculateStreak()} days</span>
        </div>
    `;
}

// --- Milestones ---
function renderMilestones() {
    const container = document.getElementById('milestones');
    const runs = Storage.get('runs');
    const weights = Storage.get('weights');
    const streak = calculateStreak();

    const longestRun = runs.reduce((max, r) => Math.max(max, r.distance || 0), 0);
    const currentWeight = weights.length > 0 ? weights[0].weight : START_WEIGHT;

    const milestones = [
        { icon: '🏃', text: 'First outdoor run pain-free', achieved: runs.some(r => (r.incline || 0) === 0 && r.distance >= 2) },
        { icon: '📏', text: 'Run 5 miles', achieved: longestRun >= 5 },
        { icon: '📏', text: 'Run 8 miles', achieved: longestRun >= 8 },
        { icon: '📏', text: 'Run 10 miles', achieved: longestRun >= 10 },
        { icon: '📏', text: 'Run 12 miles', achieved: longestRun >= 12 },
        { icon: '⚖️', text: 'Under 220 lbs', achieved: currentWeight < 220 },
        { icon: '⚖️', text: 'Under 210 lbs', achieved: currentWeight < 210 },
        { icon: '⚖️', text: 'Under 200 lbs (goal!)', achieved: currentWeight < 200 },
        { icon: '🔥', text: '7-day streak', achieved: streak >= 7 },
        { icon: '🔥', text: '30-day streak', achieved: streak >= 30 },
        { icon: '🔥', text: '60-day streak', achieved: streak >= 60 },
        { icon: '💪', text: 'First unassisted pull-up', achieved: Storage.getObj('milestones_manual').pullup || false },
        { icon: '💪', text: '10 full push-ups', achieved: Storage.getObj('milestones_manual').pushups10 || false },
        { icon: '💪', text: '20 full push-ups', achieved: Storage.getObj('milestones_manual').pushups20 || false }
    ];

    container.innerHTML = milestones.map(m => `
        <div class="milestone ${m.achieved ? 'achieved' : ''}">
            <span class="milestone-icon">${m.icon}</span>
            <span class="milestone-text">${m.text}</span>
        </div>
    `).join('');
}

// --- Utilities ---
function getDateDaysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return d.toISOString().split('T')[0];
}
