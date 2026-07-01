// ========================================
// Race Ready - Main Application
// ========================================

// --- Data Storage ---
const Storage = {
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },
    getObj(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : {};
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    addEntry(key, entry) {
        const entries = this.get(key);
        entries.unshift(entry);
        this.set(key, entries);
        return entries;
    },
    today() {
        return new Date().toISOString().split('T')[0];
    }
};

// --- Navigation ---
function initNavigation() {
    const tabs = document.querySelectorAll('.tab');
    const views = document.querySelectorAll('.view');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const viewId = tab.dataset.view;
            switchView(viewId);
        });
    });
}

function switchView(viewId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));

    const tab = document.querySelector(`.tab[data-view="${viewId}"]`);
    if (tab) tab.classList.add('active');
    document.getElementById(`view-${viewId}`).classList.add('active');

    // Trigger view-specific renders
    if (viewId === 'today') renderToday();
    if (viewId === 'week') renderWeek();
    if (viewId === 'progress') renderProgress();
}

// --- Today View ---
function renderToday() {
    // Race countdown
    const daysLeft = getDaysUntilRace();
    document.getElementById('race-countdown').textContent =
        daysLeft > 0 ? `${daysLeft} days to go` : 'Race Day!';

    // Today's plan (check overrides first)
    const overrides = Storage.getObj('week_overrides');
    const todayStr = Storage.today();
    let plan;

    if (overrides[todayStr]) {
        const weekNum = getWeekNumber(todayStr);
        plan = { ...overrides[todayStr], week: weekNum, day: getDayOfWeek(todayStr), date: todayStr };
    } else {
        plan = getTodayPlan();
    }
    const todayCard = document.getElementById('today-workout');
    const todayTitle = document.getElementById('today-title');
    const todayDate = document.getElementById('today-date');
    const todayActions = document.getElementById('today-actions');

    const now = new Date();
    todayDate.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

    if (!plan) {
        todayCard.innerHTML = '<p class="today-workout-type">No plan for today</p><p class="today-workout-desc">You\'re outside the training window. Enjoy your day!</p>';
        todayActions.style.display = 'none';
    } else {
        const weekLabel = getPhaseLabel(plan.week);
        todayCard.innerHTML = `
            <div class="today-workout-type">${plan.title}</div>
            <div class="today-workout-desc">${plan.desc}</div>
            <div class="today-workout-desc" style="margin-top:6px; font-size:0.75rem; opacity:0.7;">Week ${plan.week} - ${weekLabel}</div>
        `;

        // Show/hide actions based on workout type
        const startBtn = document.getElementById('btn-start-workout');
        const markBtn = document.getElementById('btn-mark-done');
        todayActions.style.display = 'flex';

        if (plan.type === 'strength') {
            startBtn.style.display = 'block';
            startBtn.textContent = 'Start Workout';
        } else if (plan.type === 'run') {
            startBtn.style.display = 'block';
            startBtn.textContent = 'View Warm-up';
        } else {
            startBtn.style.display = 'none';
        }

        // Check if already marked complete
        const completed = getCompletedDates();
        if (completed.includes(Storage.today())) {
            markBtn.textContent = '✓ Done (tap to undo)';
            markBtn.style.background = '#16a34a';
            markBtn.onclick = unmarkTodayComplete;
        } else {
            markBtn.textContent = 'Mark Complete';
            markBtn.style.background = '';
            markBtn.onclick = markTodayComplete;
        }
    }

    // Quick stats
    updateQuickStats();

    // Readiness bar
    updateReadinessBar();
}

function updateQuickStats() {
    // Streak
    const streak = calculateStreak();
    document.getElementById('stat-streak').textContent = streak;

    // Miles this week
    const weekMiles = getWeekMiles();
    document.getElementById('stat-week-miles').textContent = weekMiles.toFixed(1);

    // Current weight
    const weights = Storage.get('weights');
    if (weights.length > 0) {
        document.getElementById('stat-weight').textContent = weights[0].weight;
    }
}

function updateReadinessBar() {
    const readiness = calculateReadiness();
    document.getElementById('readiness-fill').style.width = `${readiness.total}%`;
    document.getElementById('readiness-label').textContent = `${Math.round(readiness.total)}% Race Ready`;
}

// --- Week View ---
function renderWeek() {
    const container = document.getElementById('week-grid');
    const today = Storage.today();
    const monday = getMonday(today);
    const completed = getCompletedDates();
    const overrides = Storage.getObj('week_overrides'); // custom edits to the plan

    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    let html = '';

    for (let i = 0; i < 7; i++) {
        const d = new Date(monday + 'T12:00:00');
        d.setDate(d.getDate() + i);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dd}`;
        const dayKey = getDayOfWeek(dateStr);
        const weekNum = getWeekNumber(dateStr);

        let workout = '—';
        let type = 'rest';

        // Check for user override first
        if (overrides[dateStr]) {
            workout = overrides[dateStr].title;
            type = overrides[dateStr].type;
        } else if (weekNum >= 1 && weekNum <= 21) {
            const weekPlan = getWeekPlan(weekNum);
            if (weekPlan[dayKey]) {
                workout = weekPlan[dayKey].title;
                type = weekPlan[dayKey].type;
            }
        }

        const isToday = dateStr === today;
        const isDone = completed.includes(dateStr);
        const isPast = dateStr < today && !isDone;
        let classes = 'week-day';
        if (isToday) classes += ' today';
        if (isDone) classes += ' completed';
        if (isPast && type !== 'rest') classes += ' missed';

        html += `
            <div class="${classes}" data-date="${dateStr}" data-type="${type}" onclick="openDayEditor('${dateStr}')">
                <div class="week-day-name">${dayNames[i]}</div>
                <div class="week-day-workout">${workout}</div>
                <div class="week-day-check"></div>
            </div>
        `;
    }

    container.innerHTML = html;
}

// --- Day Editor (tap a day in Week view to change it) ---

function startEveningRoutine() {
    startWorkoutWalker(null, EVENING_ROUTINE, false);
}

function togglePlanSection(btn) {
    const content = btn.nextElementSibling;
    if (content.style.display === 'none') {
        content.style.display = 'block';
        btn.innerHTML = btn.innerHTML.replace('▶', '▼');
    } else {
        content.style.display = 'none';
        btn.innerHTML = btn.innerHTML.replace('▼', '▶');
    }
}

function previewWorkout(type) {
    switch (type) {
        case 'upper':
            startWorkoutWalker(UPPER_BODY, MORNING_WARMUP, true);
            break;
        case 'lower':
            startWorkoutWalker(LOWER_BODY, MORNING_WARMUP, true);
            break;
        case 'evening':
            startWorkoutWalker(null, EVENING_ROUTINE, true);
            break;
    }
}

function openDayEditor(dateStr) {
    const overrides = Storage.getObj('week_overrides');
    const weekNum = getWeekNumber(dateStr);
    const dayKey = getDayOfWeek(dateStr);

    // Get current plan for this day
    let currentPlan = null;
    if (overrides[dateStr]) {
        currentPlan = overrides[dateStr];
    } else if (weekNum >= 1 && weekNum <= 21) {
        const weekPlan = getWeekPlan(weekNum);
        currentPlan = weekPlan[dayKey];
    }

    // Available workout options
    const options = [
        { type: 'run', title: 'Incline Run' },
        { type: 'run', title: 'Easy Run' },
        { type: 'run', title: 'Tempo Run' },
        { type: 'run', title: 'Long Run' },
        { type: 'strength', title: 'Upper Body + Core' },
        { type: 'strength', title: 'Lower Body + Core' },
        { type: 'rest', title: 'Rest' },
        { type: 'rest', title: 'Ultimate Frisbee' },
        { type: 'rest', title: 'Family Walk/Hike' }
    ];

    const dateLabel = formatDateFull(dateStr);
    const currentTitle = currentPlan ? currentPlan.title : 'Rest';

    let html = `
        <div class="day-editor-overlay" id="day-editor-overlay" onclick="closeDayEditor(event)">
            <div class="day-editor">
                <h3>${dateLabel}</h3>
                <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:12px;">Current: ${currentTitle}</p>
                <div class="day-editor-options">
    `;

    options.forEach(opt => {
        const selected = opt.title === currentTitle ? 'selected' : '';
        html += `<button class="day-editor-btn ${selected}" onclick="setDayOverride('${dateStr}', '${opt.type}', '${opt.title}')">${opt.title}</button>`;
    });

    html += `
                </div>
                <div class="day-editor-intensity">
                    <label>Custom notes/intensity:</label>
                    <input type="text" id="day-editor-desc" placeholder="e.g. 4 miles easy, skip lunges..." value="${currentPlan && currentPlan.customDesc ? currentPlan.customDesc : ''}" />
                    <button class="day-editor-btn" onclick="saveDayDesc('${dateStr}')">Save Notes</button>
                </div>
                <div class="day-editor-footer">
                    <button class="day-editor-btn" onclick="previewDayWorkout('${dateStr}')">&#x1F441; Preview Workout</button>
                    <button class="day-editor-btn reset-btn" onclick="resetDayOverride('${dateStr}')">Reset to Plan</button>
                </div>
            </div>
        </div>
    `;

    // Remove existing editor if open
    const existing = document.getElementById('day-editor-overlay');
    if (existing) existing.remove();

    document.body.insertAdjacentHTML('beforeend', html);
}

function closeDayEditor(event) {
    if (event.target.id === 'day-editor-overlay') {
        document.getElementById('day-editor-overlay').remove();
    }
}

function setDayOverride(dateStr, type, title) {
    const overrides = Storage.getObj('week_overrides');

    // Get the full plan details for this workout type
    const weekNum = getWeekNumber(dateStr);
    let desc = '';
    let exercises = null;
    let warmup = null;

    if (weekNum >= 1 && weekNum <= 21) {
        const weekPlan = getWeekPlan(weekNum);
        // Find matching day in plan to grab description
        Object.values(weekPlan).forEach(day => {
            if (day.title === title) {
                desc = day.desc;
                exercises = day.exercises;
                warmup = day.warmup;
            }
        });
    }

    overrides[dateStr] = { type, title, desc: desc || title, exercises, warmup };
    Storage.set('week_overrides', overrides);

    document.getElementById('day-editor-overlay').remove();
    renderWeek();
    renderToday(); // in case today was changed
}

function resetDayOverride(dateStr) {
    const overrides = Storage.getObj('week_overrides');
    delete overrides[dateStr];
    Storage.set('week_overrides', overrides);

    document.getElementById('day-editor-overlay').remove();
    renderWeek();
    renderToday();
}

function previewDayWorkout(dateStr) {
    const overrides = Storage.getObj('week_overrides');
    const weekNum = getWeekNumber(dateStr);
    const dayKey = getDayOfWeek(dateStr);

    let plan = overrides[dateStr];
    if (!plan && weekNum >= 1 && weekNum <= 21) {
        const weekPlan = getWeekPlan(weekNum);
        plan = weekPlan[dayKey];
    }

    if (!plan) return;

    // Close editor
    const overlay = document.getElementById('day-editor-overlay');
    if (overlay) overlay.remove();

    // Launch walker based on workout type (as preview)
    if (plan.type === 'strength' && plan.exercises) {
        startWorkoutWalker(plan.exercises, plan.warmup, true);
    } else if (plan.title === 'Upper Body + Core') {
        startWorkoutWalker(UPPER_BODY, MORNING_WARMUP, true);
    } else if (plan.title === 'Lower Body + Core') {
        startWorkoutWalker(LOWER_BODY, MORNING_WARMUP, true);
    } else if (plan.type === 'run' && plan.warmup) {
        startWorkoutWalker(null, plan.warmup, true);
    } else if (plan.type === 'run') {
        startWorkoutWalker(null, MORNING_WARMUP, true);
    }
}

function saveDayDesc(dateStr) {
    const descInput = document.getElementById('day-editor-desc');
    const customDesc = descInput.value.trim();

    const overrides = Storage.getObj('week_overrides');
    if (!overrides[dateStr]) {
        // Create override from current plan
        const weekNum = getWeekNumber(dateStr);
        const dayKey = getDayOfWeek(dateStr);
        if (weekNum >= 1 && weekNum <= 21) {
            const weekPlan = getWeekPlan(weekNum);
            overrides[dateStr] = { ...weekPlan[dayKey] };
        }
    }
    if (overrides[dateStr]) {
        overrides[dateStr].customDesc = customDesc;
        Storage.set('week_overrides', overrides);
    }

    document.getElementById('day-editor-overlay').remove();
    renderWeek();
    renderToday();
}

// --- Log View ---
function initLogTabs() {
    document.querySelectorAll('.log-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const panel = tab.dataset.logtab;
            document.querySelectorAll('.log-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.log-panel').forEach(p => p.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`logpanel-${panel}`).classList.add('active');
        });
    });
}

function initRunForm() {
    const form = document.getElementById('form-run');
    const dateInput = document.getElementById('run-date');
    dateInput.valueAsDate = new Date();

    // Live calorie/pace calculation
    const distInput = document.getElementById('run-distance');
    const durInput = document.getElementById('run-duration');
    const incInput = document.getElementById('run-incline');

    function updateCalcs() {
        const dist = parseFloat(distInput.value) || 0;
        const dur = parseInt(durInput.value) || 0;
        const incline = parseFloat(incInput.value) || 0;
        const weights = Storage.get('weights');
        const weight = weights.length > 0 ? weights[0].weight : 225;

        if (dist > 0 && dur > 0) {
            const pace = dur / dist;
            const paceMin = Math.floor(pace);
            const paceSec = Math.round((pace - paceMin) * 60).toString().padStart(2, '0');
            document.getElementById('run-pace').textContent = `Pace: ${paceMin}:${paceSec}/mi`;

            const cals = calculateRunCalories(dist, dur, incline, weight);
            document.getElementById('run-calories').textContent = `Calories: ~${cals}`;
        } else {
            document.getElementById('run-pace').textContent = 'Pace: --';
            document.getElementById('run-calories').textContent = 'Calories: --';
        }
    }

    distInput.addEventListener('input', updateCalcs);
    durInput.addEventListener('input', updateCalcs);
    incInput.addEventListener('input', updateCalcs);

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const dist = parseFloat(distInput.value);
        const dur = parseInt(durInput.value);
        const incline = parseFloat(incInput.value) || 0;
        const weights = Storage.get('weights');
        const weight = weights.length > 0 ? weights[0].weight : 225;

        const entry = {
            date: document.getElementById('run-date').value,
            distance: dist,
            duration: dur,
            incline: incline,
            calories: calculateRunCalories(dist, dur, incline, weight),
            notes: document.getElementById('run-notes').value,
            timestamp: Date.now()
        };
        Storage.addEntry('runs', entry);
        syncRunToSheet(entry);
        form.reset();
        dateInput.valueAsDate = new Date();
        renderRunHistory();
        updateQuickStats();
    });
}

function renderRunHistory() {
    const container = document.getElementById('run-history');
    const runs = Storage.get('runs');

    if (runs.length === 0) {
        container.innerHTML = '<p class="empty-state">No runs logged yet.</p>';
        return;
    }

    container.innerHTML = runs.slice(0, 15).map(run => {
        const pace = run.duration / run.distance;
        const paceMin = Math.floor(pace);
        const paceSec = Math.round((pace - paceMin) * 60).toString().padStart(2, '0');
        const inclineStr = run.incline > 0 ? ` @ ${run.incline}%` : '';
        return `
            <div class="history-item">
                <div>
                    <div class="value">${run.distance} mi in ${run.duration} min${inclineStr}</div>
                    <div class="detail">${paceMin}:${paceSec}/mi · ${run.calories || '--'} cal</div>
                </div>
                <div class="date">${formatDate(run.date)}</div>
            </div>
        `;
    }).join('');
}

function initWeightForm() {
    const form = document.getElementById('form-weight');
    const dateInput = document.getElementById('weight-date');
    dateInput.valueAsDate = new Date();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const entry = {
            date: document.getElementById('weight-date').value,
            weight: parseFloat(document.getElementById('weight-value').value),
            timestamp: Date.now()
        };
        Storage.addEntry('weights', entry);
        syncWeightToSheet(entry);
        form.reset();
        dateInput.valueAsDate = new Date();
        renderWeightHistory();
        updateQuickStats();
    });
}

function renderWeightHistory() {
    const container = document.getElementById('weight-history');
    const weights = Storage.get('weights');

    if (weights.length === 0) {
        container.innerHTML = '<p class="empty-state">No weigh-ins yet.</p>';
        return;
    }

    container.innerHTML = weights.slice(0, 15).map(w => `
        <div class="history-item">
            <div class="value">${w.weight} lbs</div>
            <div class="date">${formatDate(w.date)}</div>
        </div>
    `).join('');
}

function initNutrition() {
    const scale = document.getElementById('nutrition-scale');
    const dateInput = document.getElementById('nutrition-date');
    dateInput.valueAsDate = new Date();

    scale.addEventListener('click', (e) => {
        if (!e.target.classList.contains('nutrition-btn')) return;
        const rating = parseInt(e.target.dataset.rating);
        const selectedDate = dateInput.value || Storage.today();

        // Save rating
        const entry = {
            date: selectedDate,
            rating: rating,
            timestamp: Date.now()
        };

        // Replace this date's rating if exists
        let ratings = Storage.get('nutrition');
        ratings = ratings.filter(r => r.date !== selectedDate);
        ratings.unshift(entry);
        Storage.set('nutrition', ratings);
        syncNutritionToSheet(entry);

        // Update UI
        document.querySelectorAll('.nutrition-btn').forEach(btn => btn.classList.remove('selected'));
        e.target.classList.add('selected');
        document.getElementById('nutrition-today-status').textContent = `${formatDate(selectedDate)}: ${rating}/10 saved`;

        renderNutritionHistory();
    });

    // When date changes, show that date's existing rating
    dateInput.addEventListener('change', () => {
        const selectedDate = dateInput.value;
        const ratings = Storage.get('nutrition');
        const existing = ratings.find(r => r.date === selectedDate);

        document.querySelectorAll('.nutrition-btn').forEach(btn => btn.classList.remove('selected'));
        if (existing) {
            const btn = document.querySelector(`.nutrition-btn[data-rating="${existing.rating}"]`);
            if (btn) btn.classList.add('selected');
            document.getElementById('nutrition-today-status').textContent = `${formatDate(selectedDate)}: ${existing.rating}/10`;
        } else {
            document.getElementById('nutrition-today-status').textContent = '';
        }
    });

    // Show today's rating if exists
    const ratings = Storage.get('nutrition');
    const todayRating = ratings.find(r => r.date === Storage.today());
    if (todayRating) {
        document.querySelector(`.nutrition-btn[data-rating="${todayRating.rating}"]`).classList.add('selected');
        document.getElementById('nutrition-today-status').textContent = `Today: ${todayRating.rating}/10`;
    }

    renderNutritionHistory();
}

function renderNutritionHistory() {
    const container = document.getElementById('nutrition-history');
    const ratings = Storage.get('nutrition');

    // Show last 7 days
    const recent = ratings.slice(0, 7);
    if (recent.length === 0) {
        container.innerHTML = '<p class="empty-state">No ratings yet this week.</p>';
        return;
    }

    container.innerHTML = recent.map(r => `
        <div class="history-item">
            <div class="value">${r.rating}/10</div>
            <div class="date">${formatDate(r.date)}</div>
        </div>
    `).join('');
}

// --- Completion Tracking ---
function getCompletedDates() {
    return Storage.get('completed_dates');
}

function markTodayComplete() {
    const today = Storage.today();
    let completed = getCompletedDates();
    if (!completed.includes(today)) {
        completed.push(today);
        Storage.set('completed_dates', completed);
        syncCompletionToSheet(today);
    }
    renderToday();
}

function unmarkTodayComplete() {
    const today = Storage.today();
    let completed = getCompletedDates();
    completed = completed.filter(d => d !== today);
    Storage.set('completed_dates', completed);
    renderToday();
}

// --- Streak Calculation ---
function calculateStreak() {
    const completed = getCompletedDates().sort();
    if (completed.length === 0) return 0;

    const today = Storage.today();
    let streak = 0;
    let checkDate = new Date(today);

    // If today isn't done yet, start from yesterday
    if (!completed.includes(today)) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
        const dateStr = checkDate.toISOString().split('T')[0];
        const dayOfWeek = checkDate.getDay(); // 0=Sun

        // Skip rest days (Sunday) in streak calculation
        if (dayOfWeek === 0) {
            checkDate.setDate(checkDate.getDate() - 1);
            continue;
        }

        // Check if this day's plan was a rest day (Wed in summer can count)
        const weekNum = getWeekNumber(dateStr);
        if (weekNum >= 1 && weekNum <= 21) {
            const dayKey = getDayOfWeek(dateStr);
            const weekPlan = getWeekPlan(weekNum);
            if (weekPlan[dayKey] && weekPlan[dayKey].type === 'rest') {
                checkDate.setDate(checkDate.getDate() - 1);
                continue;
            }
        }

        if (completed.includes(dateStr)) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else {
            break;
        }
    }

    return streak;
}

// --- Week Miles ---
function getWeekMiles() {
    const monday = getMonday(Storage.today());
    const runs = Storage.get('runs');
    return runs
        .filter(r => r.date >= monday)
        .reduce((sum, r) => sum + r.distance, 0);
}

// --- Utilities ---
function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${parseInt(month)}/${parseInt(day)}`;
}

function formatDateFull(dateStr) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

// --- Button Handlers ---
function initButtons() {
    document.getElementById('btn-start-workout').addEventListener('click', () => {
        const overrides = Storage.getObj('week_overrides');
        const todayStr = Storage.today();
        let plan;
        if (overrides[todayStr]) {
            plan = overrides[todayStr];
        } else {
            plan = getTodayPlan();
        }
        if (!plan) return;

        if (plan.type === 'strength' && plan.exercises) {
            startWorkoutWalker(plan.exercises, plan.warmup, false);
        } else if (plan.title === 'Upper Body + Core') {
            startWorkoutWalker(UPPER_BODY, MORNING_WARMUP, false);
        } else if (plan.title === 'Lower Body + Core') {
            startWorkoutWalker(LOWER_BODY, MORNING_WARMUP, false);
        } else if (plan.type === 'run' && plan.warmup) {
            startWorkoutWalker(null, plan.warmup, false);
        }
    });

    // Mark done button is handled via onclick in renderToday()
}

// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('service-worker.js')
            .then(reg => console.log('SW registered:', reg.scope))
            .catch(err => console.log('SW registration failed:', err));
    });
}

// --- Initialize ---
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initLogTabs();
    initRunForm();
    initWeightForm();
    initNutrition();
    initButtons();
    renderToday();
    renderRunHistory();
    renderWeightHistory();

    // Initialize Google Auth
    if (typeof google !== 'undefined') {
        initGoogleAuth();
    } else {
        window.addEventListener('load', () => {
            if (typeof google !== 'undefined') {
                initGoogleAuth();
            }
        });
    }
});
