// ========================================
// Fitness Tracker PWA - Main Application
// ========================================

// --- Data Storage ---
const Storage = {
    get(key) {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    },
    set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    },
    addEntry(key, entry) {
        const entries = this.get(key);
        entries.unshift(entry); // newest first
        this.set(key, entries);
        return entries;
    }
};

// --- Navigation ---
function initNavigation() {
    const tabs = document.querySelectorAll('.tab');
    const views = document.querySelectorAll('.view');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const viewId = tab.dataset.view;

            tabs.forEach(t => t.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));

            tab.classList.add('active');
            document.getElementById(`view-${viewId}`).classList.add('active');

            // Auto-refresh from sheet when switching to dashboard
            if (viewId === 'dashboard' && accessToken) {
                syncFromSheet();
            }
        });
    });
}

// --- Running ---
function initRunForm() {
    const form = document.getElementById('form-run');
    const dateInput = document.getElementById('run-date');
    dateInput.valueAsDate = new Date();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const entry = {
            date: document.getElementById('run-date').value,
            distance: parseFloat(document.getElementById('run-distance').value),
            duration: parseInt(document.getElementById('run-duration').value),
            notes: document.getElementById('run-notes').value,
            timestamp: Date.now()
        };
        Storage.addEntry('runs', entry);
        syncRunToSheet(entry);
        form.reset();
        dateInput.valueAsDate = new Date();
        renderRunHistory();
        updateDashboard();
    });
}

function renderRunHistory() {
    const container = document.getElementById('run-history');
    const localRuns = Storage.get('runs');
    const sharedRuns = Storage.get('runs_shared');

    // Merge: use shared data if available, otherwise local
    const runs = sharedRuns.length > 0 ? sharedRuns.sort((a, b) => b.timestamp - a.timestamp) : localRuns;

    if (runs.length === 0) {
        container.innerHTML = '<p class="empty-state">No runs logged yet. Get out there!</p>';
        return;
    }

    container.innerHTML = runs.slice(0, 20).map(run => {
        const pace = run.duration / run.distance;
        const paceMin = Math.floor(pace);
        const paceSec = Math.round((pace - paceMin) * 60).toString().padStart(2, '0');
        const userLabel = run.user ? `<span class="user-tag">${run.user.split('@')[0]}</span>` : '';
        return `
            <div class="history-item">
                <div>
                    <div class="value">${run.distance} mi ${userLabel}</div>
                    <div class="detail">${run.duration} min (${paceMin}:${paceSec}/mi)</div>
                </div>
                <div class="date">${formatDate(run.date)}</div>
            </div>
        `;
    }).join('');
}

// --- Weight ---
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
        updateDashboard();
    });
}

function renderWeightHistory() {
    const container = document.getElementById('weight-history');
    const localWeights = Storage.get('weights');
    const sharedWeights = Storage.get('weights_shared');

    const weights = sharedWeights.length > 0 ? sharedWeights.sort((a, b) => b.timestamp - a.timestamp) : localWeights;

    if (weights.length === 0) {
        container.innerHTML = '<p class="empty-state">No weigh-ins yet. Start tracking!</p>';
        return;
    }

    container.innerHTML = weights.slice(0, 20).map(w => {
        const userLabel = w.user ? `<span class="user-tag">${w.user.split('@')[0]}</span>` : '';
        return `
            <div class="history-item">
                <div class="value">${w.weight} lbs ${userLabel}</div>
                <div class="date">${formatDate(w.date)}</div>
            </div>
        `;
    }).join('');
}

// --- Strength ---
function initStrengthForm() {
    const form = document.getElementById('form-strength');
    const dateInput = document.getElementById('strength-date');
    dateInput.valueAsDate = new Date();

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const entry = {
            date: document.getElementById('strength-date').value,
            exercise: document.getElementById('strength-exercise').value,
            sets: parseInt(document.getElementById('strength-sets').value),
            reps: parseInt(document.getElementById('strength-reps').value),
            weight: parseFloat(document.getElementById('strength-weight').value) || 0,
            timestamp: Date.now()
        };
        Storage.addEntry('strength', entry);
        syncStrengthToSheet(entry);
        form.reset();
        dateInput.valueAsDate = new Date();
        renderStrengthHistory();
        updateDashboard();
    });
}

function renderStrengthHistory() {
    const container = document.getElementById('strength-history');
    const localEntries = Storage.get('strength');
    const sharedEntries = Storage.get('strength_shared');

    const entries = sharedEntries.length > 0 ? sharedEntries.sort((a, b) => b.timestamp - a.timestamp) : localEntries;

    if (entries.length === 0) {
        container.innerHTML = '<p class="empty-state">No workouts logged yet. Time to lift!</p>';
        return;
    }

    container.innerHTML = entries.slice(0, 20).map(s => {
        const userLabel = s.user ? `<span class="user-tag">${s.user.split('@')[0]}</span>` : '';
        return `
            <div class="history-item">
                <div>
                    <div class="value">${s.exercise} ${userLabel}</div>
                    <div class="detail">${s.sets}x${s.reps} @ ${s.weight} lbs</div>
                </div>
                <div class="date">${formatDate(s.date)}</div>
            </div>
        `;
    }).join('');
}

// --- Dashboard ---
function updateDashboard() {
    const now = new Date();
    const weekAgo = new Date(now);
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekStr = weekAgo.toISOString().split('T')[0];

    // Running stat: miles this week
    const runs = Storage.get('runs');
    const weekRuns = runs.filter(r => r.date >= weekStr);
    const totalMiles = weekRuns.reduce((sum, r) => sum + r.distance, 0);
    document.getElementById('stat-running').textContent = `${totalMiles.toFixed(1)} mi this week`;

    // Weight stat: latest weight
    const weights = Storage.get('weights');
    if (weights.length > 0) {
        document.getElementById('stat-weight').textContent = `${weights[0].weight} lbs`;
    }

    // Strength stat: workouts this week
    const strength = Storage.get('strength');
    const weekDates = new Set(strength.filter(s => s.date >= weekStr).map(s => s.date));
    document.getElementById('stat-strength').textContent = `${weekDates.size} workouts this week`;
}

// --- Utilities ---
function formatDate(dateStr) {
    const [year, month, day] = dateStr.split('-');
    return `${parseInt(month)}/${parseInt(day)}`;
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
    initRunForm();
    initWeightForm();
    initStrengthForm();
    renderRunHistory();
    renderWeightHistory();
    renderStrengthHistory();
    updateDashboard();

    // Initialize Google Auth once the library loads
    if (typeof google !== 'undefined') {
        initGoogleAuth();
    } else {
        // Library loads async, wait for it
        window.addEventListener('load', () => {
            if (typeof google !== 'undefined') {
                initGoogleAuth();
            }
        });
    }
});
