/**
 * Generates the HTML for a task card on the board.
 * @param {object} task - The task object.
 * @returns {string} HTML string.
 */
function generateTaskHTML(task) {
    let categoryColor = getCategoryColor(task.category);
    let subtasksProgress = getSubtasksProgress(task);
    let prioIcon = `assets/img/${task.prio}_icon.png`;
    let contactsHTML = generateBoardContactsHTML(task.assignedContacts);
    let moveMenuHTML = generateMoveMenuHTML(task);

    return /*html*/`
    <div draggable="true" ondragstart="startDragging('${task.id}')" ondragend="stopDragging()" class="task-card" onclick="openTaskDetails('${task.id}')">
        <div class="task-card-header">
            <div class="task-category" style="background-color: ${categoryColor}">${task.category}</div>
            ${moveMenuHTML}
        </div>
        <div class="task-title">${task.title}</div>
        <div class="task-description">${task.description}</div>
        ${subtasksProgress}
        <div class="task-footer">
            <div class="task-contacts">
                ${contactsHTML}
            </div>
            <div class="task-prio">
                <img src="${prioIcon}" alt="${task.prio}">
            </div>
        </div>
    </div>
    `;
}


/**
 * Generates the HTML for the move-to menu on a task card.
 * @param {object} task - The task object.
 * @returns {string} HTML string.
 */
function generateMoveMenuHTML(task) {
    const statuses = [
        { id: 'todo', label: 'To Do' },
        { id: 'inprogress', label: 'In Progress' },
        { id: 'awaitingfeedback', label: 'Awaiting Feedback' },
        { id: 'done', label: 'Done' }
    ];

    let optionsHTML = statuses
        .filter(status => status.id !== task.status)
        .map(status => `
            <div class="move-menu-item" onclick="moveToFromMenu(event, '${task.id}', '${status.id}')">
                ${status.label}
            </div>
        `).join('');

    return /*html*/`
        <div class="move-menu-wrapper">
            <svg class="move-menu-btn" onclick="toggleMoveMenu(event, '${task.id}')" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8C13.1 8 14 7.1 14 6C14 4.9 13.1 4 12 4C10.9 4 10 4.9 10 6C10 7.1 10.9 8 12 8ZM12 10C10.9 10 10 10.9 10 12C10 13.1 10.9 14 12 14C13.1 14 14 13.1 14 12C14 10.9 13.1 10 12 10ZM12 16C10.9 16 10 16.9 10 18C10 19.1 10.9 20 12 20C13.1 20 14 19.1 14 18C14 16.9 13.1 16 12 16Z" fill="#2A3647"/>
            </svg>
            <div id="move-menu-${task.id}" class="move-menu-dropdown d-none">
                ${optionsHTML}
            </div>
        </div>
    `;
}


/**
 * Generates the HTML for the task detail modal.
 * @param {object} task - The task object.
 * @returns {string} HTML string.
 */
function generateTaskDetailHTML(task) {
    let categoryColor = getCategoryColor(task.category);
    let prioIcon = `assets/img/${task.prio}_icon.png`;
    let prioText = task.prio.charAt(0).toUpperCase() + task.prio.slice(1);
    let subtasksHTML = generateSubtaskListDetailHTML(task);
    let assignedContactsHTML = generateAssignedContactsDetailHTML(task.assignedContacts);
    let mobileMoveOptions = generateMobileMoveOptions(task);

    return /*html*/`
        <div class="task-detail-header">
            <div class="task-detail-category" style="background-color: ${categoryColor}">${task.category}</div>
            <img src="assets/img/cancel_icon.svg" alt="Close" class="close-icon" onclick="closeTaskDetails()">
        </div>

        <h1 class="task-detail-title">${task.title}</h1>
        <p class="task-detail-description">${task.description}</p>

        <div class="task-detail-info-row">
            <span class="task-detail-info-label">Due date:</span>
            <span>${new Date(task.dueDate).toLocaleDateString('de-DE')}</span>
        </div>

        <div class="task-detail-info-row">
            <span class="task-detail-info-label">Priority:</span>
            <div class="task-detail-prio">
                <span>${prioText}</span>
                <img src="${prioIcon}" alt="${task.prio}">
            </div>
        </div>

        <div class="task-detail-info-row column-direction">
            <span class="task-detail-info-label">Assigned To:</span>
            <div class="task-detail-assigned-list">
                ${assignedContactsHTML}
            </div>
        </div>

        <div class="task-detail-info-row column-direction">
            <span class="task-detail-info-label">Subtasks:</span>
            <ul class="task-detail-subtasks-list">
                ${subtasksHTML}
            </ul>
        </div>

        ${mobileMoveOptions}

        <div class="task-detail-footer">
            <div class="task-detail-btn" onclick="deleteTask('${task.id}')">
                <img src="assets/img/delete_icon.svg" alt="Delete">
                <span>Delete</span>
            </div>
            <div class="task-detail-divider"></div>
            <div class="task-detail-btn" onclick="editTask('${task.id}')">
                <img src="assets/img/edit_icon.svg" alt="Edit">
                <span>Edit</span>
            </div>
        </div>
    `;
}


/**
 * Generates HTML for mobile move options in detail view.
 * @param {object} task - The task object.
 * @returns {string} HTML string.
 */
function generateMobileMoveOptions(task) {
    const statuses = [
        { id: 'todo', label: 'To Do' },
        { id: 'inprogress', label: 'In Progress' },
        { id: 'awaitingfeedback', label: 'Awaiting Feedback' },
        { id: 'done', label: 'Done' }
    ];

    const options = statuses.filter(s => s.id !== task.status).map(s => `
        <div class="mobile-move-option" onclick="moveToStatus('${task.id}', '${s.id}')">
            Move to ${s.label}
        </div>
    `).join('');

    return /*html*/`
        <div class="mobile-move-container">
            <span class="task-detail-info-label">Move to:</span>
            <div class="mobile-move-options-list">${options}</div>
        </div>
    `;
}


/**
 * Generates the HTML for the subtask list in detail view.
 * @param {object} task - The task object.
 * @returns {string} HTML string.
 */
function generateSubtaskListDetailHTML(task) {
    let html = '';
    if (!task.subtasks || task.subtasks.length === 0) {
        return '<li>No subtasks.</li>';
    }
    task.subtasks.forEach((subtask, index) => {
        let checkImg = subtask.completed ? 'assets/img/checked.png' : 'assets/img/unchecked.png';
        html += /*html*/`
            <li class="task-detail-subtask-item">
                <img src="${checkImg}" class="subtask-checkbox-img" onclick="toggleSubtask('${task.id}', ${index})">
                <span>${subtask.title}</span>
            </li>
        `;
    });
    return html;
}


/**
 * Generates HTML for assigned contacts (small badges on board).
 * @param {string[]} assignedContacts - Array of contact emails.
 * @returns {string} HTML string.
 */
function generateBoardContactsHTML(assignedContacts) {
    if (!assignedContacts) return '';
    let html = '';
    const maxVisible = 4;
    const count = assignedContacts.length;

    let displayCount = count > maxVisible ? maxVisible - 1 : count;

    for (let i = 0; i < displayCount; i++) {
        let email = assignedContacts[i];
        let contact = contacts.find(c => c.email === email);
        if (contact) {
            html += `<div class="contact-badge-board" style="background-color: ${contact.color}">${getInitials(contact.name)}</div>`;
        }
    }

    if (count > maxVisible) {
        html += `<div class="contact-badge-board" style="background-color: #2A3647; color: white;">+${count - displayCount}</div>`;
    }
    return html;
}


/**
 * Generates HTML for assigned contacts list in detail view.
 * @param {string[]} assignedContacts - Array of contact emails.
 * @returns {string} HTML string.
 */
function generateAssignedContactsDetailHTML(assignedContacts) {
    if (!assignedContacts || assignedContacts.length === 0) return 'No contacts assigned';
    let html = '';
    assignedContacts.forEach(email => {
        let contact = contacts.find(c => c.email === email);
        if (contact) {
            html += /*html*/`
                <div class="assigned-contact-row">
                    <div class="contact-badge-board" style="background-color: ${contact.color}">${getInitials(contact.name)}</div>
                    <span>${contact.name}</span>
                </div>
            `;
        }
    });
    return html;
}


/**
 * Returns the color code for a given category.
 * @param {string} category - The category name.
 * @returns {string} Hex color code.
 */
function getCategoryColor(category) {
    if (category === 'Technical Task') return '#1FD7C1';
    if (category === 'User Story') return '#0022AA';
    return '#888';
}


/**
 * Generates the progress bar HTML for subtasks.
 * @param {object} task - The task object.
 * @returns {string} HTML string.
 */
function getSubtasksProgress(task) {
    if (!task.subtasks || task.subtasks.length === 0) return '';
    let completed = task.subtasks.filter(s => s.completed).length;
    let total = task.subtasks.length;
    let percent = (completed / total) * 100;

    return /*html*/`
    <div class="task-subtasks">
        <div class="progress-bar">
            <div class="progress-bar-fill" style="width: ${percent}%"></div>
        </div>
        <span class="subtask-text">${completed}/${total} Subtasks</span>
    </div>
    `;
}
