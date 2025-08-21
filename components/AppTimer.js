/**
 * Implements a daily usage limit for the application.
 * After 1 hour and 30 minutes of usage within a calendar day,
 * the app notifies the user and goes into a "rest mode" until the next day.
 */

// --- Configuration ---
const DAILY_USAGE_LIMIT_MS = 90 * 60 * 1000; // 90 minutes in milliseconds
const SLEEP_UNTIL_NEXT_DAY_KEY = 'appSleepUntilNextDayTimestamp'; // localStorage key for sleep state
const USAGE_START_TIME_KEY = 'appDailyUsageStartTime'; // localStorage key for tracking daily usage start

// --- State Variables ---
let usageTimer = null; // Timer for the daily usage limit
let isAppSleeping = false; // Flag to reflect the app's current sleep/active state

// --- Core UI Functions ---

/**
 * Sets the application to its active, usable state.
 * Removes sleep-related UI and messages.
 */
function setAppActiveState() {
    if (isAppSleeping) { // Only update if changing state
        console.log('App is now active.');
    }
    isAppSleeping = false;
    document.body.classList.remove('app-is-sleeping');

    const sleepMessageElement = document.getElementById('app-rest-message-overlay');
    if (sleepMessageElement) {
        sleepMessageElement.style.display = 'none';
    }
    // Add any other logic needed to make the app fully interactive
}

/**
 * Sets the application to its "rest" or "sleep" state.
 * Displays a message to the user.
 * @param {string} message - The message to display to the user.
 */
function setAppRestState(message) {
    if (!isAppSleeping) { // Only update if changing state
        console.log(`Activating rest mode: ${message}`);
    }
    isAppSleeping = true;
    document.body.classList.add('app-is-sleeping');

    let restMessageElement = document.getElementById('app-rest-message-overlay');
    if (!restMessageElement) {
        restMessageElement = document.createElement('div');
        restMessageElement.id = 'app-rest-message-overlay';
        // Apply basic styling (consider moving to CSS for better maintainability)
        Object.assign(restMessageElement.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column', // Allow for multi-line text easily
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 'clamp(1.2em, 4vw, 2em)', // Responsive font size
            textAlign: 'center',
            zIndex: '10000', // Ensure it's on top of other content
            padding: '20px',
            boxSizing: 'border-box',
            lineHeight: '1.5'
        });
        document.body.appendChild(restMessageElement);
    }
    restMessageElement.textContent = message;
    restMessageElement.style.display = 'flex';

    // The 'app-is-sleeping' class on the body can be used in CSS
    // to hide or disable interaction with the main app content.
}

// --- Logic Functions ---

/**
 * Activates the rest mode when the daily usage limit is reached.
 * Notifies the user and stores the rest state.
 */
function activateRestModeDueToUsageLimit() {
    clearTimeout(usageTimer);
    usageTimer = null;

    const message = "You've used the app for 1 hour and 30 minutes. Time for a rest! The app will be available tomorrow.";
    setAppRestState(message);

    // Store the timestamp indicating the app should rest until the next calendar day
    localStorage.setItem(SLEEP_UNTIL_NEXT_DAY_KEY, new Date().toISOString());
    // Optional: Clear the usage start time as the SLEEP_UNTIL_NEXT_DAY_KEY now governs.
    // localStorage.removeItem(USAGE_START_TIME_KEY);
}

/**
 * Starts or restarts the usage timer for the allowed duration.
 * @param {number} durationMs - The duration in milliseconds for the timer.
 */
function startUsageTimer(durationMs) {
    clearTimeout(usageTimer); // Clear any pre-existing timer

    if (isAppSleeping) {
        // If the app has already been determined to be sleeping (e.g. by checkAppStatusOnLoad),
        // do not start a new usage timer.
        console.log('App is in rest state, usage timer not started.');
        return;
    }

    if (durationMs <= 0) {
        // If remaining time is zero or less, go to rest mode immediately
        console.log('No usage time remaining for today. Activating rest mode.');
        activateRestModeDueToUsageLimit();
    } else {
        console.log(`Usage timer started. App available for ${Math.round(durationMs / 60000)} minutes.`);
        usageTimer = setTimeout(activateRestModeDueToUsageLimit, durationMs);
        setAppActiveState(); // Ensure app UI is in active state
    }
}

/**
 * Checks the app's status on load (or reload).
 * Determines if the app should be in rest mode or active, and for how long.
 */
function checkAppStatusOnLoad() {
    const now = new Date();
    const todayDateStr = now.toDateString(); // Used for comparing dates easily

    const sleepTimestampStr = localStorage.getItem(SLEEP_UNTIL_NEXT_DAY_KEY);

    if (sleepTimestampStr) {
        const sleepUntilDate = new Date(sleepTimestampStr);
        // Check if the stored sleep date is still today or in the future
        if (sleepUntilDate.toDateString() === todayDateStr || sleepUntilDate > now) {
            const message = "The app is currently resting. Please come back tomorrow.";
            setAppRestState(message);
            console.log('App is in rest mode from today or a previous session. No usage timer started.');
            return; // Stop further processing, app remains in rest mode
        } else {
            // Sleep period has ended (it's a new day)
            console.log('Rest period ended. Waking up for a new day.');
            localStorage.removeItem(SLEEP_UNTIL_NEXT_DAY_KEY);
            localStorage.removeItem(USAGE_START_TIME_KEY); // Reset daily usage for the new day
        }
    }

    // If not forced to sleep, manage or start the daily usage quota
    let dailyUsageStartTime;
    const usageStartTimeStr = localStorage.getItem(USAGE_START_TIME_KEY);

    if (usageStartTimeStr) {
        dailyUsageStartTime = new Date(usageStartTimeStr);
        // If usage start time is from a previous day, reset it for today
        if (dailyUsageStartTime.toDateString() !== todayDateStr) {
            console.log('Usage start time from a previous day. Resetting for today.');
            localStorage.setItem(USAGE_START_TIME_KEY, now.toISOString());
            dailyUsageStartTime = now;
        }
    } else {
        // No usage start time recorded yet for today, so start fresh
        console.log('No usage start time found for today. Starting fresh.');
        localStorage.setItem(USAGE_START_TIME_KEY, now.toISOString());
        dailyUsageStartTime = now;
    }

    const elapsedTodayMs = now.getTime() - dailyUsageStartTime.getTime();

    if (elapsedTodayMs >= DAILY_USAGE_LIMIT_MS) {
        // Daily limit already exhausted (e.g., user re-opened tab after limit was hit)
        console.log('Daily usage limit already exhausted for today upon load.');
        activateRestModeDueToUsageLimit(); // This will also set the sleep state
    } else {
        const remainingTimeMs = DAILY_USAGE_LIMIT_MS - elapsedTodayMs;
        startUsageTimer(remainingTimeMs);
        // setAppActiveState() is called within startUsageTimer if duration > 0
    }
}

// --- Initialization ---
// Check app status when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', checkAppStatusOnLoad);

// --- Recommended CSS (place in your CSS file) ---
/*
body.app-is-sleeping > *:not(#app-rest-message-overlay) {
    // Hide or visually disable main app content when in rest mode
    // Option 1: Visually indicate and disable interaction
    // filter: blur(4px) grayscale(0.8);
    // pointer-events: none;
    // Option 2: Completely hide other elements
    display: none !important; // Use !important if necessary to override other styles
}

// #app-rest-message-overlay styles are defined in JS for dynamic creation,
// but you can define or override them here if preferred.
// For example, to ensure it's always on top:
#app-rest-message-overlay {
    z-index: 10000;
}
*/