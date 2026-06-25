// ========================================
// Google Sheets Integration
// ========================================

const GOOGLE_CLIENT_ID = '684988331804-lj0n1cdvf2nns154vfrv4oacies9q4sg.apps.googleusercontent.com';
const SPREADSHEET_ID = '1pbxXdSpjyVr61wGO9972nA0goBPFLoK-Q4XfTrNG-to';
const SCOPES = 'https://www.googleapis.com/auth/spreadsheets';

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
}

function handleTokenResponse(response) {
    if (response.error) {
        console.error('Auth error:', response.error);
        return;
    }
    accessToken = response.access_token;

    // Get user info
    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    })
    .then(res => res.json())
    .then(info => {
        currentUser = info.email;
        localStorage.setItem('fitness_user', currentUser);
        updateAuthUI(true);
        syncFromSheet();
    })
    .catch(err => console.error('Failed to get user info:', err));
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
        syncStatus.className = 'sync-status synced';
    } else {
        signInBtn.style.display = 'inline-block';
        signOutBtn.style.display = 'none';
        userDisplay.style.display = 'none';
        userDisplay.textContent = '';
        syncStatus.textContent = 'Offline';
        syncStatus.className = 'sync-status offline';
    }
}

// --- Sheet Operations ---

async function appendToSheet(sheetName, values) {
    if (!accessToken) {
        console.log('Not signed in, saving locally only');
        return false;
    }

    const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${sheetName}!A:Z:append?valueInputOption=USER_ENTERED`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                values: [values]
            })
        });

        if (response.status === 401) {
            // Token expired, try to re-auth
            accessToken = null;
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

// --- Sync Helpers ---

async function syncRunToSheet(entry) {
    return appendToSheet('Runs', [
        currentUser || 'anonymous',
        entry.date,
        entry.distance,
        entry.duration,
        entry.notes || '',
        entry.timestamp
    ]);
}

async function syncWeightToSheet(entry) {
    return appendToSheet('Weight', [
        currentUser || 'anonymous',
        entry.date,
        entry.weight,
        entry.timestamp
    ]);
}

async function syncStrengthToSheet(entry) {
    return appendToSheet('Strength', [
        currentUser || 'anonymous',
        entry.date,
        entry.exercise,
        entry.sets,
        entry.reps,
        entry.weight,
        entry.timestamp
    ]);
}

async function syncFromSheet() {
    if (!accessToken) return;

    const syncStatus = document.getElementById('sync-status');
    syncStatus.textContent = 'Syncing...';
    syncStatus.className = 'sync-status syncing';

    try {
        // Pull runs
        const runRows = await readSheet('Runs');
        if (runRows.length > 1) {
            const runs = runRows.slice(1).map(row => ({
                user: row[0],
                date: row[1],
                distance: parseFloat(row[2]),
                duration: parseInt(row[3]),
                notes: row[4] || '',
                timestamp: parseInt(row[5]) || Date.now()
            }));
            Storage.set('runs_shared', runs);
        }

        // Pull weights
        const weightRows = await readSheet('Weight');
        if (weightRows.length > 1) {
            const weights = weightRows.slice(1).map(row => ({
                user: row[0],
                date: row[1],
                weight: parseFloat(row[2]),
                timestamp: parseInt(row[3]) || Date.now()
            }));
            Storage.set('weights_shared', weights);
        }

        // Pull strength
        const strengthRows = await readSheet('Strength');
        if (strengthRows.length > 1) {
            const strength = strengthRows.slice(1).map(row => ({
                user: row[0],
                date: row[1],
                exercise: row[2],
                sets: parseInt(row[3]),
                reps: parseInt(row[4]),
                weight: parseFloat(row[5]),
                timestamp: parseInt(row[6]) || Date.now()
            }));
            Storage.set('strength_shared', strength);
        }

        syncStatus.textContent = 'Synced';
        syncStatus.className = 'sync-status synced';

        // Re-render with shared data
        renderRunHistory();
        renderWeightHistory();
        renderStrengthHistory();
        updateDashboard();
    } catch (err) {
        console.error('Sync failed:', err);
        syncStatus.textContent = 'Sync failed';
        syncStatus.className = 'sync-status offline';
    }
}
