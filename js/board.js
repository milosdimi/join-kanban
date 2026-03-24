let tasks = [];
let currentDraggedElement;
let taskFormTemplate = '';



/**
 * Initializes the board by loading tasks, contacts, and templates.
 */
async function initBoard() {
    showSpinner();
    await loadTasks();
    await loadContacts();
    renderBoard();
    await loadTaskFormTemplate();
    hideSpinner();
}



/**
 * Loads tasks from local storage.
 */
async function loadTasks() {
    return new Promise((resolve) => {
        firebase.auth().onAuthStateChanged(async (user) => {
            if (user) {
                const snapshot = await db.collection('users').doc(user.uid).collection('tasks').get();
                tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            } else {
                tasks = [];
            }
            resolve();
        });
    });
}



/**
 * Loads the HTML template for the add task form.
 */
async function loadTaskFormTemplate() {
    try {
        let resp = await fetch('assets/templates/add-task-form.html');
        if (resp.ok) taskFormTemplate = await resp.text();
    } catch (e) {
        console.error('Failed to load task form template:', e);
    }
}



/**
 * Renders all tasks into their respective columns on the board.
 */
function renderBoard() {
    if (!document.getElementById('todo')) return;
    const searchInput = document.getElementById('searchInput');
    const search = searchInput ? searchInput.value.toLowerCase() : '';
    clearBoardColumns();
    renderTasksMatchingSearch(search);
    checkEmptyColumns();
}



/**
 * Clears all task columns on the board.
 */
function clearBoardColumns() {
    ['todo', 'inprogress', 'awaitingfeedback', 'done'].forEach(colId => {
        document.getElementById(colId).innerHTML = '';
    });
}



/**
 * Renders tasks that match the search query into columns.
 * @param {string} search - The search string.
 */
function renderTasksMatchingSearch(search) {
    tasks.forEach(task => {
        if (task.title.toLowerCase().includes(search) || task.description.toLowerCase().includes(search)) {
            const column = document.getElementById(task.status);
            if (column) column.innerHTML += generateTaskHTML(task);
        }
    });
}



/**
 * Checks if columns are empty and displays a placeholder message.
 */
function checkEmptyColumns() {
    const columns = [
        { id: 'todo', label: 'To do' },
        { id: 'inprogress', label: 'In progress' },
        { id: 'awaitingfeedback', label: 'Awaiting Feedback' },
        { id: 'done', label: 'Done' }
    ];

    columns.forEach(col => {
        const element = document.getElementById(col.id);
        if (element.innerHTML.trim() === '') {
            element.innerHTML = `<div class="no-tasks">No tasks ${col.label}</div>`;
        }
    });
}



/**
 * Toggles the visibility of the move-to menu on a task card.
 * @param {Event} event - The click event.
 * @param {string} taskId - The ID of the task.
 */
function toggleMoveMenu(event, taskId) {
    event.stopPropagation();
    let menu = document.getElementById(`move-menu-${taskId}`);
    document.querySelectorAll('.move-menu-dropdown').forEach(el => {
        if (el.id !== `move-menu-${taskId}`) el.classList.add('d-none');
    });
    menu.classList.toggle('d-none');
}



/**
 * Moves a task to a new status from the dropdown menu.
 * @param {Event} event - The click event.
 * @param {string} taskId - The ID of the task.
 * @param {string} newStatus - The new status.
 */
async function moveToFromMenu(event, taskId, newStatus) {
    event.stopPropagation();
    await moveToStatus(taskId, newStatus);
}



/**
 * Opens the task detail modal.
 * @param {string} taskId - The ID of the task to show.
 */
function openTaskDetails(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    const overlay = document.getElementById('taskDetailOverlay');
    const modal = overlay.querySelector('.task-detail-modal');
    modal.classList.remove('large-modal');
    modal.innerHTML = generateTaskDetailHTML(task);
    overlay.classList.remove('d-none');
    document.body.classList.add('no-scroll');
}



/**
 * Closes the task detail modal.
 */
function closeTaskDetails() {
    const overlay = document.getElementById('taskDetailOverlay');
    const modal = overlay.querySelector('.task-detail-modal');
    modal.classList.add('slide-out');

    setTimeout(() => {
        overlay.classList.add('d-none');
        modal.classList.remove('slide-out');
        modal.innerHTML = '';
        document.body.classList.remove('no-scroll');
    }, 300);
}



window.addEventListener('click', closeAllMoveMenus);



/**
 * Closes the move-to dropdown menus when clicking outside.
 */
function closeAllMoveMenus() {
    document.querySelectorAll('.move-menu-dropdown').forEach(menu => {
        if (!menu.classList.contains('d-none')) menu.classList.add('d-none');
    });
}



/**
 * Updates the status of a task.
 * @param {string} taskId - The ID of the task.
 * @param {string} newStatus - The new status.
 */
async function moveToStatus(taskId, newStatus) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        task.status = newStatus;
        const user = firebase.auth().currentUser;
        try {
            if (user) await db.collection('users').doc(user.uid).collection('tasks').doc(taskId).update({ status: newStatus });
        } catch (e) {
            console.error('Failed to update task status:', e);
        }
        closeTaskDetails();
        renderBoard();
    }
}



/**
 * Deletes a task from the board.
 * @param {string} taskId - The ID of the task.
 */
async function deleteTask(taskId) {
    const user = firebase.auth().currentUser;
    try {
        if (user) await db.collection('users').doc(user.uid).collection('tasks').doc(taskId).delete();
    } catch (e) {
        console.error('Failed to delete task:', e);
    }
    tasks = tasks.filter(t => t.id !== taskId);
    closeTaskDetails();
    renderBoard();
    showBoardToastMessage('Task deleted');
}



/**
 * Opens the edit task modal.
 * @param {string} taskId - The ID of the task to edit.
 */
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    const modal = document.querySelector('#taskDetailOverlay .task-detail-modal');
    loadContacts();
    setupEditTaskModal(task, modal);
}



/**
 * Sets up the modal for editing a task.
 * @param {object} task - The task object to edit.
 * @param {HTMLElement} modal - The modal element.
 */
function setupEditTaskModal(task, modal) {
    modal.classList.add('large-modal');
    modal.innerHTML = generateAddTaskModalHTML('Edit Task', taskFormTemplate);
    editingTaskId = task.id;
    newTaskStatus = task.status;
    populateForm(task);
    initializeTaskFormBehaviors();
    const createBtn = modal.querySelector('.btn-create');
    createBtn.innerHTML = 'Save <img src="assets/img/check_icon.png" alt="">';
    modal.querySelector('.btn-clear').classList.add('d-none');
}



/**
 * Initializes inputs, validations, and listeners for the task form.
 */
function initializeTaskFormBehaviors() {
    setupSubtaskInput();
    setMinDate();
    addValidationMsgElements();
    setupInputEventListeners();
}



/**
 * Opens the add task modal.
 * @param {string} status - The default status for the new task.
 */
function openAddTaskModal(status = 'todo') {
    if (window.innerWidth < 1000) {
        window.location.href = 'add-task.html';
        return;
    }
    const overlay = document.getElementById('addTaskOverlay');
    const modal = overlay.querySelector('.task-detail-modal');
    loadContacts();
    setupAddTaskModal(status, modal);
    overlay.classList.remove('d-none');
    document.body.classList.add('no-scroll');
}



/**
 * Sets up the modal for adding a new task.
 * @param {string} status - The default status.
 * @param {HTMLElement} modal - The modal element.
 */
function setupAddTaskModal(status, modal) {
    modal.classList.add('large-modal');
    modal.innerHTML = generateAddTaskModalHTML('Add Task', taskFormTemplate);
    newTaskStatus = status;
    editingTaskId = null;
    clearTask();
    initializeTaskFormBehaviors();
}



/**
 * Toggles the completion status of a subtask.
 * @param {string} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 */
async function toggleSubtask(taskId, subtaskIndex) {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
        const subtask = task.subtasks[subtaskIndex];
        subtask.completed = !subtask.completed;
        const user = firebase.auth().currentUser;
        try {
            if (user) await db.collection('users').doc(user.uid).collection('tasks').doc(taskId).update({ subtasks: task.subtasks });
        } catch (e) {
            console.error('Failed to update subtask:', e);
        }
        renderBoard();
        openTaskDetails(taskId);
    }
}



/**
 * Closes the add task modal.
 */
function closeAddTaskModal() {
    const overlay = document.getElementById('addTaskOverlay');
    const modal = overlay.querySelector('.task-detail-modal');
    modal.classList.add('slide-out');

    setTimeout(() => {
        overlay.classList.add('d-none');
        modal.classList.remove('slide-out');
        modal.innerHTML = '';
        document.body.classList.remove('no-scroll');
    }, 300);
}
