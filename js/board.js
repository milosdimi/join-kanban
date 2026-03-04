let tasks = [];
let currentDraggedElement;
let taskFormTemplate = ''; 

/**
 * Initializes the board by loading tasks, contacts, and templates.
 */
async function initBoard() {
    await loadTasks();
    await loadContacts(); 
    renderBoard();
    await loadTaskFormTemplate(); 
}

/**
 * Loads tasks from local storage.
 */
async function loadTasks() {
    try {
        tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    } catch (e) {
        console.error('Could not load tasks', e);
        tasks = [];
    }
}

/**
 * Loads the HTML template for the add task form.
 */
async function loadTaskFormTemplate() {
    try {
        let resp = await fetch('assets/templates/add-task-form.html');
        if (resp.ok) {
            taskFormTemplate = await resp.text();
        }
    } catch (e) { console.error('Could not load task form template', e); }
}

/**
 * Renders all tasks into their respective columns on the board.
 */
function renderBoard() {
    const columns = ['todo', 'inprogress', 'awaitingfeedback', 'done'];
    const searchInput = document.getElementById('searchInput');
    const search = searchInput ? searchInput.value.toLowerCase() : '';

    columns.forEach(colId => {
        document.getElementById(colId).innerHTML = '';
    });

    tasks.forEach(task => {
        if (task.title.toLowerCase().includes(search) || task.description.toLowerCase().includes(search)) {
            const column = document.getElementById(task.status);
            if (column) {
                column.innerHTML += generateTaskHTML(task);
            }
        }
    });

    checkEmptyColumns();
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
 * @param {number} taskId - The ID of the task.
 */
function toggleMoveMenu(event, taskId) {
    event.stopPropagation(); 
    let menu = document.getElementById(`move-menu-${taskId}`);
    
    
    document.querySelectorAll('.move-menu-dropdown').forEach(el => {
        if(el.id !== `move-menu-${taskId}`) el.classList.add('d-none');
    });

    menu.classList.toggle('d-none');
}

/**
 * Moves a task to a new status from the dropdown menu.
 * @param {Event} event - The click event.
 * @param {number} taskId - The ID of the task.
 * @param {string} newStatus - The new status.
 */
async function moveToFromMenu(event, taskId, newStatus) {
    event.stopPropagation(); 
    await moveToStatus(taskId, newStatus); 
}

/**
 * Starts the drag operation.
 * @param {number} id - The ID of the dragged task.
 */
function startDragging(id) {
    currentDraggedElement = id;
    setTimeout(() => {
        document.body.classList.add('dragging-active');
    }, 10);
}

/**
 * Allows dropping an element.
 * @param {Event} ev - The dragover event.
 */
function allowDrop(ev) {
    ev.preventDefault();
}

/**
 * Stops the drag operation and cleans up.
 */
function stopDragging() {
    document.body.classList.remove('dragging-active');
}

/**
 * Highlights the drop area when dragging a task over it.
 * @param {string} id - The ID of the column.
 */
function highlight(id) {
    document.getElementById(id).classList.add('drag-area-highlight');
}

/**
 * Removes the highlight from the drop area.
 * @param {string} id - The ID of the column.
 */
function removeHighlight(id) {
    document.getElementById(id).classList.remove('drag-area-highlight');
}

/**
 * Moves the dragged task to a new status column.
 * @param {string} status - The target status.
 */
function moveTo(status) {
    const taskIndex = tasks.findIndex(t => t.id === currentDraggedElement);
    if (taskIndex !== -1) {
        tasks[taskIndex].status = status;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        renderBoard();
        removeHighlight(status);
        stopDragging();
    }
}

// --- Task Detail Modal ---

/**
 * Opens the task detail modal.
 * @param {number} taskId - The ID of the task to show.
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

// Closes dropdowns when clicking outside
window.addEventListener('click', function(e) {
    document.querySelectorAll('.move-menu-dropdown').forEach(menu => {
        if (!menu.classList.contains('d-none')) {
            menu.classList.add('d-none');
        }
    });
});

/**
 * Updates the status of a task.
 * @param {number} taskId - The ID of the task.
 * @param {string} newStatus - The new status.
 */
async function moveToStatus(taskId, newStatus) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex].status = newStatus;
        await localStorage.setItem('tasks', JSON.stringify(tasks));
        closeTaskDetails();
        renderBoard();
    }
}

/**
 * Deletes a task from the board.
 * @param {number} taskId - The ID of the task.
 */
async function deleteTask(taskId) {
    tasks = tasks.filter(t => t.id !== taskId);
    await localStorage.setItem('tasks', JSON.stringify(tasks));
    closeTaskDetails();
    renderBoard();
}

/**
 * Opens the edit task modal.
 * @param {number} taskId - The ID of the task to edit.
 */
function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    const modal = document.querySelector('#taskDetailOverlay .task-detail-modal');
    loadContacts(); 
    modal.classList.add('large-modal'); 
    
    modal.innerHTML = generateAddTaskModalHTML('Edit Task', taskFormTemplate);

    // Setup Edit Mode
    editingTaskId = taskId;
    newTaskStatus = task.status;
    populateForm(task);
    setupSubtaskInput(); 
    addValidationMsgElements();
    setupInputEventListeners();

    
    const createBtn = modal.querySelector('.btn-create');
    createBtn.innerHTML = 'Save <img src="assets/img/check_icon.png" alt="">';
    modal.querySelector('.btn-clear').classList.add('d-none');
}

/**
 * Opens the add task modal.
 * @param {string} status - The default status for the new task.
 */
function openAddTaskModal(status = 'todo') {
    const overlay = document.getElementById('addTaskOverlay');
    const modal = overlay.querySelector('.task-detail-modal');
    loadContacts(); 
    modal.classList.add('large-modal'); 
    
    modal.innerHTML = generateAddTaskModalHTML('Add Task', taskFormTemplate);
    
    newTaskStatus = status; 
    editingTaskId = null;
    clearTask(); 
    setMinDate(); 
    setupSubtaskInput(); 
    addValidationMsgElements();
    setupInputEventListeners();
    
    overlay.classList.remove('d-none');
    document.body.classList.add('no-scroll'); 
}

/**
 * Toggles the completion status of a subtask.
 * @param {number} taskId - The ID of the task.
 * @param {number} subtaskIndex - The index of the subtask.
 */
async function toggleSubtask(taskId, subtaskIndex) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        const subtask = tasks[taskIndex].subtasks[subtaskIndex];
        subtask.completed = !subtask.completed;
        await localStorage.setItem('tasks', JSON.stringify(tasks));
                
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