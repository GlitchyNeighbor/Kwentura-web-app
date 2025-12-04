
const DAILY_USAGE_LIMIT_MS = 90 * 60 * 1000; 
const SLEEP_UNTIL_NEXT_DAY_KEY = 'appSleepUntilNextDayTimestamp';
const USAGE_START_TIME_KEY = 'appDailyUsageStartTime';

let usageTimer = null;
let isAppSleeping = false;

function setAppActiveState() {
    if (isAppSleeping) {
        console.log('App is now active.');
    }
    isAppSleeping = false;
    document.body.classList.remove('app-is-sleeping');

    const sleepMessageElement = document.getElementById('app-rest-message-overlay');
    if (sleepMessageElement) {
        sleepMessageElement.style.display = 'none';
    }
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

        Object.assign(restMessageElement.style, {
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 'clamp(1.2em, 4vw, 2em)',
            textAlign: 'center',
            zIndex: '10000',
            padding: '20px',
            boxSizing: 'border-box',
            lineHeight: '1.5'
        });
        document.body.appendChild(restMessageElement);
    }
    restMessageElement.textContent = message;
    restMessageElement.style.display = 'flex';

}

function activateRestModeDueToUsageLimit() {
    clearTimeout(usageTimer);
    usageTimer = null;

    const message = "You've used the app for 1 hour and 30 minutes. Time for a rest! The app will be available tomorrow.";
    setAppRestState(message);

    localStorage.setItem(SLEEP_UNTIL_NEXT_DAY_KEY, new Date().toISOString());

}

/**
 * Starts or restarts the usage timer for the allowed duration.
 * @param {number} durationMs - The duration in milliseconds for the timer.
 */
function startUsageTimer(durationMs) {
    clearTimeout(usageTimer);

    if (isAppSleeping) {

        console.log('App is in rest state, usage timer not started.');
        return;
    }

    if (durationMs <= 0) {
        console.log('No usage time remaining for today. Activating rest mode.');
        activateRestModeDueToUsageLimit();
    } else {
        console.log(`Usage timer started. App available for ${Math.round(durationMs / 60000)} minutes.`);
        usageTimer = setTimeout(activateRestModeDueToUsageLimit, durationMs);
        setAppActiveState();
    }
}

function checkAppStatusOnLoad() {
    const now = new Date();
    const todayDateStr = now.toDateString();

    const sleepTimestampStr = localStorage.getItem(SLEEP_UNTIL_NEXT_DAY_KEY);

    if (sleepTimestampStr) {
        const sleepUntilDate = new Date(sleepTimestampStr);
        if (sleepUntilDate.toDateString() === todayDateStr || sleepUntilDate > now) {
            const message = "The app is currently resting. Please come back tomorrow.";
            setAppRestState(message);
            console.log('App is in rest mode from today or a previous session. No usage timer started.');
            return; 
        } else {
            console.log('Rest period ended. Waking up for a new day.');
            localStorage.removeItem(SLEEP_UNTIL_NEXT_DAY_KEY);
            localStorage.removeItem(USAGE_START_TIME_KEY); 
        }
    }
    let dailyUsageStartTime;
    const usageStartTimeStr = localStorage.getItem(USAGE_START_TIME_KEY);

    if (usageStartTimeStr) {
        dailyUsageStartTime = new Date(usageStartTimeStr);
        if (dailyUsageStartTime.toDateString() !== todayDateStr) {
            console.log('Usage start time from a previous day. Resetting for today.');
            localStorage.setItem(USAGE_START_TIME_KEY, now.toISOString());
            dailyUsageStartTime = now;
        }
    } else {

        console.log('No usage start time found for today. Starting fresh.');
        localStorage.setItem(USAGE_START_TIME_KEY, now.toISOString());
        dailyUsageStartTime = now;
    }

    const elapsedTodayMs = now.getTime() - dailyUsageStartTime.getTime();

    if (elapsedTodayMs >= DAILY_USAGE_LIMIT_MS) {

        console.log('Daily usage limit already exhausted for today upon load.');
        activateRestModeDueToUsageLimit();
    } else {
        const remainingTimeMs = DAILY_USAGE_LIMIT_MS - elapsedTodayMs;
        startUsageTimer(remainingTimeMs);

    }
}

document.addEventListener('DOMContentLoaded', checkAppStatusOnLoad);
