// ========================================
// Workout Walker - Step-through exercise interface
// ========================================

let walkerExercises = [];
let walkerWarmup = [];
let walkerCurrentIndex = 0;
let walkerCurrentSet = 1;
let walkerPhase = 'warmup'; // 'warmup' or 'main'
let walkerIsPreview = false;
let restTimerInterval = null;
let restTimeRemaining = 0;

// --- Start Workout ---
function startWorkoutWalker(exercises, warmup, isPreview) {
    walkerWarmup = warmup || [];
    walkerExercises = flattenSupersets(exercises || []);
    walkerCurrentIndex = 0;
    walkerCurrentSet = 1;
    walkerPhase = walkerWarmup.length > 0 ? 'warmup' : 'main';
    walkerIsPreview = isPreview || false;

    // Switch to workout view
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById('view-workout').classList.add('active');
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));

    renderCurrentExercise();
}

// Flatten superset structures into a linear sequence for the walker
// Supersets become: [A, B, rest, A, B, rest, A, B, rest]
function flattenSupersets(exercises) {
    const flat = [];
    exercises.forEach(item => {
        if (item.isSuperset && item.exercises) {
            // For supersets, we treat the pair as one logical unit
            // The walker will show them alternating with rest only after both
            const exA = item.exercises[0];
            const exB = item.exercises[1];
            const sets = exA.sets || 3;
            const restAfterPair = exB.rest || 30;

            flat.push({
                name: `${item.name}: ${exA.name}`,
                supersetLabel: item.name,
                sets: sets,
                reps: exA.reps,
                rest: 0, // no rest between A and B
                notes: exA.notes,
                cues: exA.cues,
                video: exA.video,
                _isPartA: true,
                _pairName: exB.name
            });
            flat.push({
                name: `${item.name}: ${exB.name}`,
                supersetLabel: item.name,
                sets: sets,
                reps: exB.reps,
                rest: restAfterPair, // rest after completing the pair
                notes: exB.notes,
                cues: exB.cues,
                video: exB.video,
                _isPartB: true,
                _pairName: exA.name
            });
        } else {
            flat.push(item);
        }
    });
    return flat;
}

// --- Render Current Exercise ---
function renderCurrentExercise() {
    const exercises = walkerPhase === 'warmup' ? walkerWarmup : walkerExercises;
    const total = walkerWarmup.length + walkerExercises.length;
    const currentOverall = walkerPhase === 'warmup'
        ? walkerCurrentIndex + 1
        : walkerWarmup.length + walkerCurrentIndex + 1;

    if (walkerCurrentIndex >= exercises.length) {
        if (walkerPhase === 'warmup' && walkerExercises.length > 0) {
            // Transition from warmup to main exercises
            walkerPhase = 'main';
            walkerCurrentIndex = 0;
            walkerCurrentSet = 1;
            renderCurrentExercise();
            return;
        } else {
            // Workout complete
            finishWorkout();
            return;
        }
    }

    const exercise = exercises[walkerCurrentIndex];
    const nameEl = document.getElementById('exercise-name');
    const detailEl = document.getElementById('exercise-detail');
    const notesEl = document.getElementById('exercise-notes');
    const counterEl = document.getElementById('exercise-counter');
    const progressFill = document.getElementById('workout-progress-fill');
    const nextBtn = document.getElementById('btn-next-set');

    // Phase label
    const phaseLabel = walkerPhase === 'warmup' ? '(Warm-up) ' : '';
    nameEl.textContent = `${phaseLabel}${exercise.name}`;

    // Sets/reps display
    if (typeof exercise.reps === 'string') {
        detailEl.textContent = exercise.sets > 1
            ? `Set ${walkerCurrentSet} of ${exercise.sets} · ${exercise.reps}`
            : exercise.reps;
    } else {
        detailEl.textContent = exercise.sets > 1
            ? `Set ${walkerCurrentSet} of ${exercise.sets} · ${exercise.reps} reps`
            : `${exercise.reps} reps`;
    }

    // Notes + cues + video
    let infoHtml = exercise.notes || '';
    if (exercise.cues) {
        infoHtml = `<div class="exercise-cues">${exercise.cues}</div>`;
        if (exercise._isPartA) {
            infoHtml += `<div class="superset-hint">Then immediately: ${exercise._pairName}</div>`;
        }
        if (exercise.video) {
            infoHtml += `<a href="${exercise.video}" target="_blank" class="exercise-video-link">&#x1F3AC; Watch demo</a>`;
        }
    }
    notesEl.innerHTML = infoHtml;

    // Counter
    counterEl.textContent = `Exercise ${currentOverall} of ${total}`;

    // Progress bar
    const progress = ((currentOverall - 1) / total) * 100;
    progressFill.style.width = `${progress}%`;

    // Button text
    if (walkerCurrentSet < exercise.sets) {
        nextBtn.textContent = 'Done → Rest';
    } else {
        nextBtn.textContent = 'Done → Next';
    }

    // Hide rest timer
    hideRestTimer();
}

// --- Next Set / Next Exercise ---
function handleNextSet() {
    const exercises = walkerPhase === 'warmup' ? walkerWarmup : walkerExercises;
    const exercise = exercises[walkerCurrentIndex];

    // For superset part A: immediately move to part B (no rest)
    if (exercise._isPartA) {
        walkerCurrentIndex++;
        renderCurrentExercise();
        return;
    }

    // For superset part B or regular exercise: check if more sets
    if (walkerCurrentSet < exercise.sets) {
        walkerCurrentSet++;
        if (exercise.rest > 0) {
            startRestTimer(exercise.rest);
            // After rest, go back to part A if this is a superset
            if (exercise._isPartB) {
                walkerCurrentIndex--; // will go back to A after rest
            }
        } else {
            if (exercise._isPartB) {
                walkerCurrentIndex--;
            }
            renderCurrentExercise();
        }
    } else {
        // Move to next exercise (or next superset pair)
        walkerCurrentIndex++;
        walkerCurrentSet = 1;
        renderCurrentExercise();
    }
}

// --- Previous Exercise ---
function handlePrevExercise() {
    if (walkerCurrentSet > 1) {
        walkerCurrentSet = 1;
        renderCurrentExercise();
        return;
    }

    if (walkerCurrentIndex > 0) {
        walkerCurrentIndex--;
        walkerCurrentSet = 1;
        renderCurrentExercise();
    } else if (walkerPhase === 'main' && walkerWarmup.length > 0) {
        walkerPhase = 'warmup';
        walkerCurrentIndex = walkerWarmup.length - 1;
        walkerCurrentSet = 1;
        renderCurrentExercise();
    }
}

// --- Rest Timer ---
function startRestTimer(seconds) {
    restTimeRemaining = seconds;
    const timerEl = document.getElementById('rest-timer');
    const timeEl = document.getElementById('rest-time');
    const nextBtn = document.getElementById('btn-next-set');

    timerEl.style.display = 'block';
    timeEl.textContent = restTimeRemaining;
    nextBtn.textContent = 'Skip Rest';

    // Update exercise detail to show upcoming set
    const exercises = walkerPhase === 'warmup' ? walkerWarmup : walkerExercises;
    const exercise = exercises[walkerCurrentIndex];
    const detailEl = document.getElementById('exercise-detail');
    if (typeof exercise.reps === 'string') {
        detailEl.textContent = `Next: Set ${walkerCurrentSet} of ${exercise.sets} · ${exercise.reps}`;
    } else {
        detailEl.textContent = `Next: Set ${walkerCurrentSet} of ${exercise.sets} · ${exercise.reps} reps`;
    }

    restTimerInterval = setInterval(() => {
        restTimeRemaining--;
        timeEl.textContent = restTimeRemaining;

        if (restTimeRemaining <= 0) {
            clearInterval(restTimerInterval);
            restTimerInterval = null;
            hideRestTimer();
            renderCurrentExercise();
        }
    }, 1000);
}

function hideRestTimer() {
    const timerEl = document.getElementById('rest-timer');
    timerEl.style.display = 'none';
    if (restTimerInterval) {
        clearInterval(restTimerInterval);
        restTimerInterval = null;
    }
}

function skipRest() {
    hideRestTimer();
    renderCurrentExercise();
}

// --- Finish Workout ---
function finishWorkout() {
    const nameEl = document.getElementById('exercise-name');
    const detailEl = document.getElementById('exercise-detail');
    const notesEl = document.getElementById('exercise-notes');
    const counterEl = document.getElementById('exercise-counter');
    const progressFill = document.getElementById('workout-progress-fill');
    const nextBtn = document.getElementById('btn-next-set');
    const prevBtn = document.getElementById('btn-prev-exercise');

    nameEl.textContent = '🎉 Workout Complete!';
    detailEl.textContent = walkerIsPreview ? 'End of preview.' : 'Great work today.';
    notesEl.textContent = '';
    counterEl.textContent = '';
    progressFill.style.width = '100%';
    nextBtn.textContent = 'Done';
    nextBtn.onclick = exitWorkoutWalker;
    prevBtn.style.display = 'none';

    // Only mark complete if not a preview
    if (!walkerIsPreview) {
        markTodayComplete();
    }
}

function exitWorkoutWalker() {
    // Reset button handlers
    const nextBtn = document.getElementById('btn-next-set');
    const prevBtn = document.getElementById('btn-prev-exercise');
    nextBtn.onclick = null;
    prevBtn.style.display = 'block';

    // Switch back to today view
    switchView('today');
}

// --- Initialize Workout Walker Buttons ---
function initWorkoutWalker() {
    document.getElementById('btn-next-set').addEventListener('click', function() {
        if (this.onclick) return; // Custom handler (finish screen)
        if (restTimerInterval) {
            skipRest();
        } else {
            handleNextSet();
        }
    });

    document.getElementById('btn-prev-exercise').addEventListener('click', handlePrevExercise);
}

// Init on load
document.addEventListener('DOMContentLoaded', initWorkoutWalker);
