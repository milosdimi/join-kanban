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
 * Injects validation message elements into the DOM if they don't exist.
 */
function addValidationMsgElements() {
    const fields = ['title', 'dueDate', 'category'];
    fields.forEach(id => {
        const input = document.getElementById(id);
        if (input && !document.getElementById(`msg-${id}`)) {
            const msgDiv = document.createElement('div');
            msgDiv.id = `msg-${id}`;
            msgDiv.className = 'input-error-msg d-none';
            msgDiv.innerText = 'This field is required';
            input.parentNode.insertBefore(msgDiv, input.nextSibling);
        }
    });
}


/**
 * Sets up event listeners to clear validation errors on input/change.
 */
function setupInputEventListeners() {
    const fields = ['title', 'dueDate', 'category'];
    fields.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            ['input', 'change'].forEach(eventType => {
                input.addEventListener(eventType, () => {
                    input.classList.remove('error-border');
                    const msg = document.getElementById(`msg-${id}`);
                    if (msg) msg.classList.add('d-none');
                });
            });
        }
    });
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
        if (this.value && this.value < today) {
            this.value = today;
        }
    });
}


/**
 * Loads contacts from local storage.
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
    if (user) {
        const snapshot = await db.collection('users').doc(user.uid).collection('tasks').get();
        tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    const taskToEdit = tasks.find(t => t.id === editingTaskId);
    if (taskToEdit) populateForm(taskToEdit);
}


/**
 * Sets the priority for the task and updates the button styles.
 * @param {string} prio - The selected priority ('urgent', 'medium', 'low').
 */
function setPrio(prio) {    
    const buttons = document.querySelectorAll('.prio-btn');
    buttons.forEach(button => {
        button.classList.remove('active');
    });

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
 * Validates the required fields in the task form.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateTaskForm() {
    let isValid = true;
    const title = document.getElementById('title');
    const date = document.getElementById('dueDate');
    const category = document.getElementById('category');

    if (!validateField(title, 'msg-title')) isValid = false;
    if (!validateField(date, 'msg-dueDate')) isValid = false;
    if (!validateField(category, 'msg-category')) isValid = false;

    if (date.value && new Date(date.value).getFullYear() < 2000) {
        document.getElementById('msg-dueDate').innerText = 'Please enter a valid year';
        document.getElementById('msg-dueDate').classList.remove('d-none');
        isValid = false;
    }
    return isValid;
}


/**
 * Validates a single input field.
 * @param {HTMLElement} input - The input element to validate.
 * @param {string} msgId - The ID of the error message element.
 * @returns {boolean} True if valid.
 */
function validateField(input, msgId) {
    const msgElement = document.getElementById(msgId);
    if (!input.value.trim()) {
        input.classList.add('error-border');
        if (msgElement) msgElement.classList.remove('d-none');
        return false;
    } else {
        input.classList.remove('error-border');
        if (msgElement) msgElement.classList.add('d-none');
        return true;
    }
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
 * Creates a new task and saves it to storage.
 */
async function createTask() {
    const btn = document.querySelector('.btn-create');
    if (btn) btn.disabled = true;

    let newTask = getTaskData();
    
    const user = firebase.auth().currentUser;
    if (user) await db.collection('users').doc(user.uid).collection('tasks').add(newTask);
    
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
        await db.collection('users').doc(user.uid).collection('tasks').doc(editingTaskId).update(updatedTask);
        showTaskAddedMessage('Task updated');
        redirectToBoard();
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
 * Sets up the event listener for the subtask input field (Enter key).
 */
function setupSubtaskInput() {
    const input = document.getElementById('subtask');
    if (input) {
        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter') {
                event.preventDefault(); 
                addSubtask();
            }
        });
    }
}


/**
 * Adds a new subtask to the list.
 */
function addSubtask() {
    let input = document.getElementById('subtask');
    if (input.value.trim().length > 0) {
        subtasks.push({
            title: input.value,
            completed: false
        });
        input.value = '';
        renderSubtasks();
    }
}


/**
 * Renders the list of subtasks.
 */
function renderSubtasks() {
    let list = document.getElementById('subtaskList');
    list.innerHTML = '';
    
    for (let i = 0; i < subtasks.length; i++) {
        list.innerHTML += generateSubtaskHTML(subtasks[i], i);
    }
}


/**
 * Enables edit mode for a specific subtask.
 * @param {number} index - The index of the subtask.
 */
function editSubtask(index) {
    let subtaskItem = document.getElementById(`subtask-${index}`);
    let currentTitle = subtasks[index].title;
    
    subtaskItem.classList.add('editing');
    subtaskItem.innerHTML = generateEditSubtaskHTML(currentTitle, index);
    document.getElementById(`edit-subtask-${index}`).focus();
}


/**
 * Saves the edited subtask title.
 * @param {number} index - The index of the subtask.
 */
function saveSubtask(index) {
    let input = document.getElementById(`edit-subtask-${index}`);
    if (input.value.trim().length > 0) {
        subtasks[index].title = input.value;
    } else {
        subtasks.splice(index, 1);
    }
    renderSubtasks();
}


/**
 * Deletes a subtask from the list.
 * @param {number} index - The index of the subtask.
 */
function deleteSubtask(index) {
    subtasks.splice(index, 1);
    renderSubtasks();
}


/**
 * Clears the subtask input field.
 */
function clearSubtaskInput() {
    document.getElementById('subtask').value = '';
}


/**
 * Shows a confirmation message when a task is added.
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

        messageTimeout = setTimeout(() => {
            msgElement.classList.add('d-none');
        }, 2000);
    }
}


/**
 * Toggles the visibility of the contacts dropdown.
 * @param {Event} event - The click event.
 */
function toggleContactsDropdown(event) {
    if(event) event.stopPropagation();
    const options = document.getElementById('dropdownOptions');
    options.classList.toggle('d-none');
    
    if (!options.classList.contains('d-none')) {
        renderContactsDropdown();
        document.addEventListener('click', closeDropdownOnClickOutside, true);
    } else {
        document.removeEventListener('click', closeDropdownOnClickOutside, true);
    }
}


/**
 * Closes the dropdown when clicking outside of it.
 * @param {Event} event - The click event.
 */
function closeDropdownOnClickOutside(event) {
    const dropdown = document.getElementById('dropdownAssigned');
    if (dropdown && !dropdown.contains(event.target)) {
        document.getElementById('dropdownOptions').classList.add('d-none');
        document.removeEventListener('click', closeDropdownOnClickOutside, true);
    }
}


/**
 * Renders the list of contacts in the dropdown.
 */
function renderContactsDropdown() {
    const container = document.getElementById('dropdownOptions');
    container.innerHTML = '';
    
    contacts.forEach((contact, index) => {
        const isSelected = assignedContacts.includes(contact.email);
        container.innerHTML += generateContactOptionHTML(contact, index, isSelected);
    });
}


/**
 * Toggles the selection status of a contact.
 * @param {number} index - The index of the contact.
 */
function toggleContactSelection(index) {
    const contact = contacts[index];
    const contactIndex = assignedContacts.indexOf(contact.email);
    
    if (contactIndex === -1) {
        assignedContacts.push(contact.email);
    } else {
        assignedContacts.splice(contactIndex, 1);
    }
    renderContactsDropdown();
    renderSelectedContactsBadges();
}


/**
 * Renders badges for selected contacts below the dropdown.
 */
function renderSelectedContactsBadges() {
    const container = document.getElementById('selectedContactsContainer');
    container.innerHTML = '';
    
    assignedContacts.forEach(email => {
        const contact = contacts.find(c => c.email === email);
        if (contact) {
            container.innerHTML += `<div class="contact-badge-small" style="background-color: ${contact.color}">${getInitials(contact.name)}</div>`;
        }
    });
}


/**
 * Generates initials from a name.
 * @param {string} name - The full name.
 * @returns {string} The initials (uppercase).
 */
function getInitials(name) {
    let parts = name.split(' ');
    let initials = parts[0].charAt(0);
    if (parts.length > 1) {
        initials += parts[parts.length - 1].charAt(0);
    }
    return initials.toUpperCase();
}