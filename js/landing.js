/**
 * @fileoverview Landing page logic: state switching and daily request counter.
 *
 * States:
 *   'welcome'     – Initial page with role selection (State 1)
 *   'stakeholder' – Email request page (State 2, normal)
 *   'limit'       – Daily limit reached page (State 3)
 */

const DAILY_LIMIT = 10;

/**
 * Switches the visible landing page state by toggling the d-none class.
 * @param {'welcome'|'stakeholder'|'limit'} stateName - Target state ID suffix.
 */
function showState(stateName) {
    const stateIds = ['welcome', 'stakeholder', 'limit'];
    stateIds.forEach(id => {
        const el = document.getElementById(`state-${id}`);
        if (el) el.classList.toggle('d-none', id !== stateName);
    });
}

/**
 * Navigates to the team member login page.
 */
function goToLogin() {
    window.location.href = 'login.html';
}

/**
 * Fetches the current daily request count from Firestore.
 * Resets to 0 if the stored date differs from today.
 * @returns {Promise<number>} Number of requests used today (0 on error).
 */
async function fetchDailyCount() {
    const today = new Date().toISOString().slice(0, 10);

    try {
        const docRef = db.collection('system').doc('dailyLimit');
        const snap = await docRef.get();

        if (!snap.exists) return 0;

        const data = snap.data();
        if (data.date !== today) return 0;

        return typeof data.count === 'number' ? data.count : 0;
    } catch (err) {
        console.error('[Landing] Failed to fetch daily limit:', err);
        return 0;
    }
}

/**
 * Called when the user clicks "Create request".
 * Checks the daily counter and routes to stakeholder or limit state.
 */
async function showStakeholderState() {
    const count = await fetchDailyCount();
    if (count >= DAILY_LIMIT) {
        showState('limit');
    } else {
        updateCounterDisplay(count);
        showState('stakeholder');
    }
}

/**
 * Updates the "X of 10" counter element in State 2.
 * @param {number} count - Number of requests used today.
 */
function updateCounterDisplay(count) {
    const el = document.getElementById('stakeholderCountDisplay');
    if (el) el.textContent = `${count} of ${DAILY_LIMIT}`;
}

/**
 * Opens the mailto link so the user can send a request email.
 */
function openMailto() {
    window.location.href = 'mailto:support@join.dimit.cc';
}

/**
 * Exposes the current request count for use by other states.
 * @returns {Promise<number>}
 */
async function getDailyCount() {
    return fetchDailyCount();
}
