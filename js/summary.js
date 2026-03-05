/**
 * Initializes the summary page.
 */
function initSummary() {
    setGreeting();
    updateSummaryMetrics();
    checkMobileGreeting();
}

/**
 * Sets the greeting text based on time and user status.
 */
function setGreeting() {
    let greetingElement = document.querySelector('.greeting-text');
    let nameElement = document.querySelector('.greeting-name');
    let user = localStorage.getItem('currentUser');
    let timeText = getTimeGreeting();

    if (!greetingElement || !nameElement) return;

    if (user === 'guest') {
        greetingElement.innerHTML = `${timeText}!`;
        nameElement.innerHTML = '';
    } else {
        greetingElement.innerHTML = `${timeText},`;
        nameElement.innerHTML = user || 'User';
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
function updateSummaryMetrics() {
    let tasks = loadTasksFromStorage();
    updateTaskCounts(tasks);
    updateUrgentMetric(tasks);
}

/**
 * Loads tasks from local storage safely.
 * @returns {Array} Array of tasks.
 */
function loadTasksFromStorage() {
    try {
        return JSON.parse(localStorage.getItem('tasks')) || [];
    } catch (e) {
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
function checkMobileGreeting() {
    if (window.innerWidth < 1000 && !sessionStorage.getItem('mobileGreetingShown')) {
        showMobileGreetingOverlay();
    }
}

/**
 * Displays the mobile greeting overlay and hides it after a delay.
 */
function showMobileGreetingOverlay() {
    const overlay = document.getElementById('mobileGreeting');
    if (!overlay) return;
    
    const user = localStorage.getItem('currentUser') || 'Guest';
    const greeting = getTimeGreeting();

    overlay.querySelector('.greeting-content').innerHTML = generateMobileGreetingHTML(greeting, user);
    overlay.classList.remove('d-none');
    sessionStorage.setItem('mobileGreetingShown', 'true');

    setTimeout(() => {
        overlay.classList.add('d-none');
    }, 2500);
}