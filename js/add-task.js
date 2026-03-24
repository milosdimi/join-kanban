let currentPrio = 'medium';
let subtasks = [];
let editingTaskId = null;
let newTaskStatus = 'todo';
let contacts = [];
let assignedContacts = [];
let messageTimeout = null;


/**
 * Initializes the add task page.
 */
async function initAddTask() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    await loadContacts();
    setMinDate();
    setupSubtaskInput();
    addValidationMsgElements();
    setupInputEventListeners();

    if (id) {
        editingTaskId = id;
        prepareEditMode();
    }
}


/**
 * Sets the minimum date for the due date input to today.
 */
function setMinDate() {
    const dateInput = document.getElementById('dueDate');
    if (!dateInput) return;

    const today = new Date().toISOString().split('T')[0];
    dateInput.setAttribute('min', today);

    dateInput.addEventListener('blur', function() {
        if (this.value && this.value < today) this.value = today;
    });
}


/**
 * Loads contacts from Firestore.
 */
async function loadContacts() {
    return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                const snapshot = await db.collection('users').doc(user.uid).collection('contacts').get();
                contacts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                contacts = [];
            }
            resolve();
        });
    });
}


/**
 * Prepares the form for editing an existing task.
 */
async function prepareEditMode() {
    document.querySelector('h1').innerText = 'Edit Task';
    const createBtn = document.querySelector('.btn-create');
    createBtn.innerHTML = 'Save <img src="assets/img/check_icon.png" alt="">';
    document.querySelector('.btn-clear').classList.add('d-none');
    await fetchAndPopulateTaskToEdit();
}


/**
 * Fetches tasks from Firestore and populates the edit form.
 */
async function fetchAndPopulateTaskToEdit() {
    let tasks = [];
    const user = firebase.auth().currentUser;
    try {
        if (user) {
            const snapshot = await db.collection('users').doc(user.uid).collection('tasks').get();
            tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        }
    } catch (e) {
        console.error('Failed to fetch task for editing:', e);
    }
    const taskToEdit = tasks.find(t => t.id === editingTaskId);
    if (taskToEdit) populateForm(taskToEdit);
}


/**
 * Sets the priority for the task and updates the button styles.
 * @param {string} prio - The selected priority ('urgent', 'medium', 'low').
 */
function setPrio(prio) {
    document.querySelectorAll('.prio-btn').forEach(button => button.classList.remove('active'));
    const selectedButton = document.getElementById(`prio${prio.charAt(0).toUpperCase() + prio.slice(1)}`);
    selectedButton.classList.add('active');
    currentPrio = prio;
}


/**
 * Clears all inputs in the task form.
 */
function clearTask() {
    clearTaskInputs();
    resetTaskVariablesAndErrors();
}


/**
 * Clears all text and value inputs in the task form.
 */
function clearTaskInputs() {
    ['title', 'description', 'dueDate', 'category', 'subtask'].forEach(id => {
        document.getElementById(id).value = '';
    });
    document.getElementById('subtaskList').innerHTML = '';
}


/**
 * Resets variables, priorities, and validation errors for the task form.
 */
function resetTaskVariablesAndErrors() {
    setPrio('medium');
    subtasks = [];
    newTaskStatus = 'todo';
    assignedContacts = [];
    renderSelectedContactsBadges();
    ['title', 'dueDate', 'category'].forEach(id => {
        document.getElementById(id).classList.remove('error-border');
        document.getElementById(`msg-${id}`)?.classList.add('d-none');
    });
}


/**
 * Populates the form with data from an existing task.
 * @param {object} task - The task object to load.
 */
function populateForm(task) {
    document.getElementById('title').value = task.title;
    document.getElementById('description').value = task.description;
    document.getElementById('dueDate').value = task.dueDate;
    document.getElementById('category').value = task.category;
    setPrio(task.prio);
    subtasks = task.subtasks || [];
    assignedContacts = task.assignedContacts || [];
    renderSelectedContactsBadges();
    renderSubtasks();
}


/**
 * Handles the form submission event.
 * @returns {boolean} Always false to prevent default submission.
 */
function handleTaskFormSubmit() {
    if (!validateTaskForm()) return false;
    if (editingTaskId !== null) {
        saveEditedTask();
    } else {
        createTask();
    }
    return false;
}


/**
 * Creates a new task and saves it to Firestore.
 */
async function createTask() {
    const btn = document.querySelector('.btn-create');
    if (btn) btn.disabled = true;

    let newTask = getTaskData();
    const user = firebase.auth().currentUser;
    try {
        if (user) await db.collection('users').doc(user.uid).collection('tasks').add(newTask);
    } catch (e) {
        console.error('Failed to create task:', e);
        if (btn) btn.disabled = false;
        return;
    }
    showTaskAddedMessage();
    redirectToBoard();
}


/**
 * Collects task data from the form inputs.
 * @returns {object} The task object.
 */
function getTaskData() {
    return {
        title: document.getElementById('title').value,
        description: document.getElementById('description').value,
        dueDate: document.getElementById('dueDate').value,
        category: document.getElementById('category').value,
        prio: currentPrio,
        subtasks: subtasks,
        status: newTaskStatus,
        assignedContacts: assignedContacts
    };
}


/**
 * Redirects the user to the board page after a short delay.
 */
function redirectToBoard() {
    if (window.location.pathname.includes('board.html')) {
        setTimeout(async () => {
            if (typeof closeAddTaskModal === 'function') closeAddTaskModal();
            if (typeof closeTaskDetails === 'function') closeTaskDetails();
            await loadTasks();
            renderBoard();
        }, 1000);
    } else {
        setTimeout(() => {
            window.location.href = 'board.html';
        }, 1500);
    }
}


/**
 * Saves changes to an existing task.
 */
async function saveEditedTask() {
    const btn = document.querySelector('.btn-create');
    if (btn) btn.disabled = true;

    const user = firebase.auth().currentUser;
    if (user && editingTaskId) {
        let updatedTask = {};
        updateTaskObject(updatedTask);
        try {
            await db.collection('users').doc(user.uid).collection('tasks').doc(editingTaskId).update(updatedTask);
            showTaskAddedMessage('Task updated');
            redirectToBoard();
        } catch (e) {
            console.error('Failed to save edited task:', e);
            if (btn) btn.disabled = false;
        }
    }
}


/**
 * Updates a task object with current form values.
 * @param {object} task - The task object to update.
 */
function updateTaskObject(task) {
    task.title = document.getElementById('title').value;
    task.description = document.getElementById('description').value;
    task.dueDate = document.getElementById('dueDate').value;
    task.category = document.getElementById('category').value;
    task.prio = currentPrio;
    task.subtasks = subtasks;
    task.assignedContacts = assignedContacts;
}


/**
 * Shows a confirmation message when a task is added or updated.
 * @param {string} text - The message to show.
 */
function showTaskAddedMessage(text = 'Task added to board') {
    const msgElement = document.getElementById('taskAddedMsg');
    if (msgElement) {
        if (messageTimeout) clearTimeout(messageTimeout);
        msgElement.innerHTML = `${text} <img src="assets/img/board-icon.svg" alt="">`;
        msgElement.classList.add('d-none');
        void msgElement.offsetWidth;
        msgElement.classList.remove('d-none');
        messageTimeout = setTimeout(() => msgElement.classList.add('d-none'), 2000);
    }
}
