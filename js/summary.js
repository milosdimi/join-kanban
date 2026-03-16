/**
 * Initializes the summary page.
 */
function initSummary() {
    firebase.auth().onAuthStateChanged(async (user) => {
        showSpinner();
        if (user) {
            if (user.isAnonymous) {
                const tasksSnapshot = await db.collection('users').doc(user.uid).collection('tasks').limit(1).get();
                if (tasksSnapshot.empty) {
                    await seedInitialDataForUser(user.uid, 'Guest', 'guest@join.test');
                }
            }
            setGreeting(user);
            await updateSummaryMetrics(user);
            checkMobileGreeting(user);
            hideSpinner();
        }
    });
}

/**
 * Sets the greeting text based on time and user status.
 */
function setGreeting(user) {
    let greetingElement = document.querySelector('.greeting-text');
    let nameElement = document.querySelector('.greeting-name');
    let timeText = getTimeGreeting();

    if (!greetingElement || !nameElement) return;

    if (user.isAnonymous) {
        greetingElement.innerHTML = `${timeText}!`;
        nameElement.innerHTML = '';
    } else {
        greetingElement.innerHTML = `${timeText},`;
        nameElement.innerHTML = user.displayName || 'User';
    }
}

/**
 * Returns the greeting string based on the current hour.
 * @returns {string} The appropriate greeting.
 */
function getTimeGreeting() {
    let hour = new Date().getHours();
    if (hour < 12) {
        return 'Good morning';
    } else if (hour < 18) {
        return 'Good afternoon';
    } else {
        return 'Good evening';
    }
}

/**
 * Loads tasks and updates the metric cards on the summary page.
 */
async function updateSummaryMetrics(user) {
    let tasks = await loadTasksFromFirestore(user.uid);
    updateTaskCounts(tasks);
    updateUrgentMetric(tasks);
}

/**
 * Loads tasks from Firestore.
 * @returns {Array} Array of tasks.
 */
async function loadTasksFromFirestore(userId) {
    try {
        const snapshot = await db.collection('users').doc(userId).collection('tasks').get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error('Could not load tasks', e);
        return [];
    }
}

/**
 * Updates the count numbers for each task status.
 * @param {Array} tasks - The list of tasks.
 */
function updateTaskCounts(tasks) {
    const duration = 1000;
    animateNumber(document.getElementById('summaryTodo'), getCount(tasks, 'status', 'todo'), duration);
    animateNumber(document.getElementById('summaryDone'), getCount(tasks, 'status', 'done'), duration);
    animateNumber(document.getElementById('summaryTotal'), tasks.length, duration);
    animateNumber(document.getElementById('summaryInProgress'), getCount(tasks, 'status', 'inprogress'), duration);
    animateNumber(document.getElementById('summaryAwaiting'), getCount(tasks, 'status', 'awaitingfeedback'), duration);
    animateNumber(document.getElementById('summaryUrgent'), getCount(tasks, 'prio', 'urgent'), duration);
}

/**
 * Helper to count tasks by property.
 */
function getCount(tasks, key, value) {
    return tasks.filter(t => t[key] === value).length;
}

/**
 * Updates the urgent task date display.
 * @param {Array} tasks - The list of tasks.
 */
function updateUrgentMetric(tasks) {
    const urgentTasks = tasks.filter(t => t.prio === 'urgent');
    const upcomingUrgentTask = urgentTasks
        .filter(t => new Date(t.dueDate) >= new Date()) 
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))[0]; 

    const urgentDateElement = document.getElementById('summaryUrgentDate');
    if (upcomingUrgentTask) {
        urgentDateElement.innerText = new Date(upcomingUrgentTask.dueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    } else {
        urgentDateElement.innerText = 'None upcoming';
    }
}

/**
 * Animates a number from 0 to a target value.
 * @param {HTMLElement} element The element to update.
 * @param {number} endValue The final number.
 * @param {number} duration The animation duration in ms.
 */
function animateNumber(element, endValue, duration) {
    if (!element) return;
    let startValue = 0;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        let timeElapsed = currentTime - startTime;
        let progress = Math.min(timeElapsed / duration, 1);
        let currentValue = Math.floor(progress * (endValue - startValue) + startValue);
        element.innerText = currentValue;

        if (progress < 1) {
            requestAnimationFrame(animation);
        } else {
            element.innerText = endValue; 
        }
    }

    requestAnimationFrame(animation);
}

/**
 * Handles the mobile greeting animation.
 */
function checkMobileGreeting(user) {
    if (window.innerWidth < 1000 && !sessionStorage.getItem('mobileGreetingShown')) {
        showMobileGreetingOverlay(user);
    }
}

/**
 * Displays the mobile greeting overlay and hides it after a delay.
 */
function showMobileGreetingOverlay(user) {
    const overlay = document.getElementById('mobileGreeting');
    if (!overlay) return;
    const userName = user.isAnonymous ? 'Guest' : (user.displayName || 'User');
    const greeting = getTimeGreeting();

    overlay.querySelector('.greeting-content').innerHTML = generateMobileGreetingHTML(greeting, userName);
    overlay.classList.remove('d-none');
    sessionStorage.setItem('mobileGreetingShown', 'true');

    setTimeout(() => {
        overlay.classList.add('d-none');
    }, 2500);
}