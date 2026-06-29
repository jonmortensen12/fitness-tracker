// ========================================
// Google Sheets Integration
// ========================================

const GOOGLE_CLIENT_ID = '684988331804-lj0n1cdvf2nns154vfrv4oacies9q4sg.apps.googleusercontent.com';
const SPREADSHEET_ID = '1pbxXdSpjyVr61wGO9972nA0goBPFLoK-Q4XfTrNG-to';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets openid email';

let tokenClient;
let accessToken = null;
let currentUser = null;

// --- Authentication ---

function initGoogleAuth() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: handleTokenResponse
    });

    // Restore session state from localStorage
    const savedUser = localStorage.getItem('fitness_user');
    const savedToken = localStorage.getItem('fitness_token');
    const tokenExpiry = parseInt(localStorage.getItem('fitness_token_expiry') || '0');

    if (savedUser) {
        currentUser = savedUser;

        if (savedToken && Date.now() < tokenExpiry) {
            // Token still valid, restore it
            accessToken = savedToken;
            updateAuthUI(true);
            syncFromSheet();
        } else {
            // Token expired, try silent refresh
            localStorage.removeItem('fitness_token');
            localStorage.removeItem('fitness_token_expiry');
            tokenClient.requestAccessToken({ prompt: '' });
        }
    }
}

async function handleTokenResponse(response) {
    if (response.error) {
        console.error('Auth error:', response.error);
        // If silent refresh failed, just show sign-in button
        // but keep user display if we have a saved user
        const savedUser = localStorage.getItem('fitness_user');
        if (savedUser) {
            currentUser = savedUser;
            // Show as "needs re-auth" but not fully signed out
            updateAuthUI(false);
        }
        return;
    }
    accessToken = response.access_token;

    // Save token with expiry (tokens last ~3600 seconds = 1 hour)
    localStorage.setItem('fitness_token', accessToken);
    localStorage.setItem('fitness_token_expiry', String(Date.now() + 3500 * 1000)); // slightly less than 1hr

    try {
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const info = await res.json();
        currentUser = info.email;
        localStorage.setItem('fitness_user', currentUser);
        updateAuthUI(true);

        // Sync any locally-stored entries that weren't pushed yet
        await pushUnsyncedEntries();

        await syncFromSheet();
    } catch (err) {
        console.error('Failed to get user info:', err);
        currentUser = localStorage.getItem('fitness_user');
        if (currentUser) updateAuthUI(true);
    }
}

// Push entries that were logged while offline/not signed in
async function pushUnsyncedEntries() {
    const unsyncedRuns = Storage.get('unsynced_runs');
    const unsyncedWeights = Storage.get('unsynced_weights');
    const unsyncedNutrition = Storage.get('unsynced_nutrition');

    for (const entry of unsyncedRuns) {
        await syncRunToSheet(entry);
    }
    for (const entry of unsyncedWeights) {
        await syncWeightToSheet(entry);
    }
    for (const entry of unsyncedNutrition) {
        await syncNutritionToSheet(entry);
    }

    // Clear unsynced queues
    Storage.set('unsynced_runs', []);
    Storage.set('unsynced_weights', []);
    Storage.set('unsynced_nutrition', []);

    // Also check main storage for entries that predate the queue system
    // Compare local entries against what's in the sheet
    await pushMissingLocalEntries();
}

// Check if local entries exist that aren't in the sheet yet
async function pushMissingLocalEntries() {
    // Read what's currently in the sheet
    const sheetWeights = await readSheet('Weight');
    const sheetRuns = await readSheet('Runs');

    // Get local entries
    const localWeights = Storage.get('weights');
    const localRuns = Storage.get('runs');

    // Find local weights not in sheet (compare by timestamp)
    const sheetWeightTimestamps = new Set(
        sheetWeights.slice(1).map(row => String(row[3]))
    );
    const missingWeights = localWeights.filter(w => !sheetWeightTimestamps.has(String(w.timestamp)));

    for (const entry of missingWeights) {
        const user = currentUser || localStorage.getItem('fitness_user') || 'anonymous';
        await appendToSheet('Weight', [user, entry.date, entry.weight, entry.timestamp]);
    }

    // Find local runs not in sheet
    const sheetRunTimestamps = new Set(
        sheetRuns.slice(1).map(row => String(row[7]))
    );
    const missingRuns = localRuns.filter(r => !sheetRunTimestamps.has(String(r.timestamp)));

    for (const entry of missingRuns) {
        const user = currentUser || localStorage.getItem('fitness_user') || 'anonymous';
        await appendToSheet('Runs', [user, entry.date, entry.distance, entry.duration, entry.incline || 0, entry.calories || 0, entry.notes || '', entry.timestamp]);
    }
}

function signIn() {
    tokenClient.requestAccessToken();
}

function signOut() {
    if (accessToken) {
        google.accounts.oauth2.revoke(accessToken);
    }
    accessToken = null;
    currentUser = null;
    localStorage.removeItem('fitness_user');
    localStorage.removeItem('fitness_token');
    localStorage.removeItem('fitness_token_expiry');
    updateAuthUI(false);
}

function updateAuthUI(signedIn) {
    const signInBtn = document.getElementById('btn-sign-in');
    const signOutBtn = document.getElementById('btn-sign-out');
    const userDisplay = document.getElementById('user-display');
    const syncStatus = document.getElementById('sync-status');

    if (signedIn) {
        signInBtn.style.display = 'none';
        signOutBtn.style.display = 'inline-block';
        userDisplay.textContent = currentUser;
        userDisplay.style.display = 'inline-block';
        syncStatus.textContent = 'Synced';
        syncStatus.className = 'sync-badge synced';
    } else {
        signInBtn.style.display = 'inline-block';
        signOutBtn.style.display = 'none';
        userDisplay.style.display = 'none';
        syncStatus.textContent = 'Offline';
        syncStatus.className = 'sync-badge offline';
    }
}

// --- Sheet Operations ---

async function appendToSheet(sheetName, values) {
    if (!accessToken) return false;

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!A:Z:append?valueInputOption=USER_ENTERED`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ values: [values] })
        });

        if (response.status === 401) {
            // Token expired, clear stored token and re-auth
            accessToken = null;
            localStorage.removeItem('fitness_token');
            localStorage.removeItem('fitness_token_expiry');
            updateAuthUI(false);
            return false;
        }
        return response.ok;
    } catch (err) {
        console.error(`Failed to append to ${sheetName}:`, err);
        return false;
    }
}

async function readSheet(sheetName) {
    if (!accessToken) return [];

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!A:Z`;

    try {
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        if (!response.ok) return [];
        const data = await response.json();
        return data.values || [];
    } catch (err) {
        console.error(`Failed to read ${sheetName}:`, err);
        return [];
    }
}

// --- Sync: Push to Sheet ---

async function syncRunToSheet(entry) {
    const user = currentUser || localStorage.getItem('fitness_user') || 'anonymous';
    const values = [user, entry.date, entry.distance, entry.duration, entry.incline || 0, entry.calories || 0, entry.notes || '', entry.timestamp];

    if (!accessToken) {
        // Queue for later sync
        Storage.addEntry('unsynced_runs', entry);
        return false;
    }
    return appendToSheet('Runs', values);
}

async function syncWeightToSheet(entry) {
    const user = currentUser || localStorage.getItem('fitness_user') || 'anonymous';
    const values = [user, entry.date, entry.weight, entry.timestamp];

    if (!accessToken) {
        Storage.addEntry('unsynced_weights', entry);
        return false;
    }
    return appendToSheet('Weight', values);
}

async function syncNutritionToSheet(entry) {
    const user = currentUser || localStorage.getItem('fitness_user') || 'anonymous';
    const values = [user, entry.date, entry.rating, entry.timestamp];

    if (!accessToken) {
        Storage.addEntry('unsynced_nutrition', entry);
        return false;
    }
    return appendToSheet('Nutrition', values);
}

async function syncCompletionToSheet(dateStr) {
    const user = currentUser || localStorage.getItem('fitness_user') || 'anonymous';
    return appendToSheet('Completions', [
        user,
        dateStr,
        Date.now()
    ]);
}

// --- Sync: Pull from Sheet ---

async function syncFromSheet() {
    if (!accessToken) return;

    const syncStatus = document.getElementById('sync-status');
    syncStatus.textContent = 'Syncing...';
    syncStatus.className = 'sync-badge syncing';

    try {
        // Pull runs
        const runRows = await readSheet('Runs');
        if (runRows.length > 1) {
            const runs = runRows.slice(1).map(row => ({
                user: row[0],
                date: row[1],
                distance: parseFloat(row[2]) || 0,
                duration: parseInt(row[3]) || 0,
                incline: parseFloat(row[4]) || 0,
                calories: parseInt(row[5]) || 0,
                notes: row[6] || '',
                timestamp: parseInt(row[7]) || Date.now()
            }));
            // Merge: keep sheet data as source of truth
            Storage.set('runs', runs.sort((a, b) => b.timestamp - a.timestamp));
        }

        // Pull weights
        const weightRows = await readSheet('Weight');
        if (weightRows.length > 1) {
            const weights = weightRows.slice(1).map(row => ({
                user: row[0],
                date: row[1],
                weight: parseFloat(row[2]) || 0,
                timestamp: parseInt(row[3]) || Date.now()
            }));
            Storage.set('weights', weights.sort((a, b) => b.timestamp - a.timestamp));
        }

        // Pull nutrition
        const nutritionRows = await readSheet('Nutrition');
        if (nutritionRows.length > 1) {
            const nutrition = nutritionRows.slice(1).map(row => ({
                user: row[0],
                date: row[1],
                rating: parseInt(row[2]) || 5,
                timestamp: parseInt(row[3]) || Date.now()
            }));
            Storage.set('nutrition', nutrition.sort((a, b) => b.timestamp - a.timestamp));
        }

        // Pull completions
        const completionRows = await readSheet('Completions');
        if (completionRows.length > 1) {
            const dates = completionRows.slice(1).map(row => row[1]);
            Storage.set('completed_dates', [...new Set(dates)]);
        }

        syncStatus.textContent = 'Synced';
        syncStatus.className = 'sync-badge synced';

        // Re-render active view
        renderRunHistory();
        renderWeightHistory();
        updateQuickStats();
        updateReadinessBar();
    } catch (err) {
        console.error('Sync failed:', err);
        syncStatus.textContent = 'Sync failed';
        syncStatus.className = 'sync-badge offline';
    }
}
