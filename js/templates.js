/**
 * Generates HTML for a single subtask in the list.
 * @param {object} subtask - The subtask object.
 * @param {number} index - The index of the subtask.
 * @returns {string} HTML string.
 */
function generateSubtaskHTML(subtask, index) {
    return /*html*/`
        <li class="subtask-item" id="subtask-${index}">
            <span>• ${subtask.title}</span>
            <div class="subtask-actions">
                <img src="assets/img/edit_icon.svg" onclick="editSubtask(${index})" class="subtask-action-icon">
                <div class="subtask-separator-list"></div>
                <img src="assets/img/delete_icon.svg" onclick="deleteSubtask(${index})" class="subtask-action-icon">
            </div>
        </li>
    `;
}

/**
 * Generates HTML for the subtask edit mode.
 * @param {string} currentTitle - The current title of the subtask.
 * @param {number} index - The index of the subtask.
 * @returns {string} HTML string.
 */
function generateEditSubtaskHTML(currentTitle, index) {
    return /*html*/`
        <div class="subtask-edit-input-wrapper">
            <input type="text" id="edit-subtask-${index}" value="${currentTitle}" onkeydown="if(event.key === 'Enter'){saveSubtask(${index}); return false;}">
            <div class="subtask-edit-actions">
                <img src="assets/img/delete_icon.svg" onclick="deleteSubtask(${index})" class="subtask-action-icon">
                <div class="subtask-separator-list"></div>
                <img src="assets/img/check_dark_icon.svg" onclick="saveSubtask(${index})" class="subtask-action-icon">
            </div>
        </div>
    `;
}

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
    <div draggable="true" ondragstart="startDragging(${task.id})" class="task-card" onclick="openTaskDetails(${task.id})">
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
            <div class="move-menu-item" onclick="moveToFromMenu(event, ${task.id}, '${status.id}')">
                ${status.label}
            </div>
        `).join('');

    return /*html*/`
        <div class="move-menu-wrapper">
            <svg class="move-menu-btn" onclick="toggleMoveMenu(event, ${task.id})" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <div class="task-detail-btn" onclick="deleteTask(${task.id})">
                <img src="assets/img/delete_icon.svg" alt="Delete">
                <span>Delete</span>
            </div>
            <div class="task-detail-btn" onclick="editTask(${task.id})">
                <img src="assets/img/edit_icon.svg" alt="Edit">
                <span>Edit</span>
            </div>
        </div>
    `;
}

/**
 * Generates the HTML for mobile move options in detail view.
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
        <div class="mobile-move-option" onclick="moveToStatus(${task.id}, '${s.id}')">
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
        let checked = subtask.completed ? 'checked' : '';
        html += /*html*/`
            <li class="task-detail-subtask-item">
                <input type="checkbox" ${checked} onchange="toggleSubtask(${task.id}, ${index})">
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
    assignedContacts.forEach(email => {
        let contact = contacts.find(c => c.email === email);
        if (contact) {
            html += `<div class="contact-badge-board" style="background-color: ${contact.color}">${getInitials(contact.name)}</div>`;
        }
    });
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
 * Generates the HTML structure for the Add/Edit Task Modal.
 * @param {string} title - The title of the modal (Add Task / Edit Task).
 * @param {string} formContent - The HTML content of the form.
 * @returns {string} HTML string.
 */
function generateAddTaskModalHTML(title, formContent) {
    return /*html*/`
        <div class="task-detail-header">
            <h1>${title}</h1>
            <img src="assets/img/cancel_icon.svg" alt="Close" class="close-icon" onclick="${title === 'Edit Task' ? 'closeTaskDetails()' : 'closeAddTaskModal()'}">
        </div>
        <form id="addTaskForm" onsubmit="handleTaskFormSubmit(); return false;" novalidate>
            ${formContent}
        </form>
    `;
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

/**
 * Generates HTML for a contact letter section header.
 * @param {string} letter - The letter.
 * @returns {string} HTML string.
 */
function generateContactLetterHTML(letter) {
    return /*html*/`
        <div class="contact-letter">${letter}</div>
        <div class="contact-separator"></div>
    `;
}

/**
 * Generates HTML for a contact item in the list.
 * @param {object} contact - The contact object.
 * @param {number} index - The index of the contact.
 * @returns {string} HTML string.
 */
function generateContactItemHTML(contact, index) {
    return /*html*/`
        <div class="contact-item" id="contact-${index}" onclick="showContactDetails(${index})">
            <div class="contact-avatar" style="background-color: ${contact.color};">${getInitials(contact.name)}</div>
            <div class="contact-info">
                <span class="contact-name">${contact.name}</span>
                <span class="contact-email">${contact.email}</span>
            </div>
        </div>
    `;
}

/**
 * Generates HTML for the contact detail view.
 * @param {object} contact - The contact object.
 * @param {number} index - The index of the contact.
 * @returns {string} HTML string.
 */
function generateContactDetailHTML(contact, index) {
    return /*html*/`
        <img src="assets/img/arrow_left_icon.png" class="mobile-back-arrow" onclick="closeMobileDetails()">

        <div class="contact-detail-header">
            <div class="contact-avatar-large" style="background-color: ${contact.color};">${getInitials(contact.name)}</div>
            <div class="contact-detail-name-box">
                <span class="contact-detail-name">${contact.name}</span>
                <div class="contact-detail-actions">
                    <div class="action-btn" onclick="openEditContact(${index})"><img src="assets/img/edit_icon.svg" alt=""> Edit</div>
                    <div class="action-btn" onclick="deleteContact(${index})"><img src="assets/img/delete_icon.svg" alt=""> Delete</div>
                </div>
            </div>
        </div>

        <div class="contact-info-headline">Contact Information</div>
        
        <div class="contact-info-box">
            <span class="info-label">Email</span>
            <a href="mailto:${contact.email}" class="info-value-email">${contact.email}</a>
            
            <span class="info-label">Phone</span>
            <a href="tel:${contact.phone}" class="info-value-phone">${contact.phone}</a>
        </div>

        <div class="mobile-menu-btn" onclick="toggleMobileMenu()">
            <img src="assets/img/more_vert_icon.svg" alt="Options">
        </div>

        <div id="mobileMenuOptions" class="mobile-menu-options">
            <div class="action-btn" onclick="openEditContact(${index})"><img src="assets/img/edit_icon.svg" alt=""> Edit</div>
            <div class="action-btn" onclick="deleteContact(${index})"><img src="assets/img/delete_icon.svg" alt=""> Delete</div>
        </div>
    `;
}

/**
 * Generates HTML for the contact modal action buttons.
 * @param {string} mode - 'add' or 'edit'.
 * @param {number} [index] - The index of the contact (only for edit mode).
 * @returns {string} HTML string.
 */
function generateContactModalActionsHTML(mode, index) {
    if (mode === 'add') {
        return /*html*/`
            <button type="button" class="btn-transparent" onclick="closeAddContact()">Cancel <img src="assets/img/cancel_icon.svg" alt=""></button>
            <button type="submit" id="contactModalSubmitBtn" class="btn-primary btn-create-contact">Create contact <img src="assets/img/check_icon.png" alt=""></button>
        `;
    } else {
        return /*html*/`
            <button type="button" class="btn-transparent" onclick="deleteContact(${index}); closeAddContact()" style="display:flex; justify-content:center; padding: 16px;">Delete</button>
            <button type="submit" id="contactModalSubmitBtn" class="btn-primary btn-create-contact">Save <img src="assets/img/check_icon.png" alt=""></button>
        `;
    }
}

/**
 * Generates HTML for the mobile greeting overlay.
 * @param {string} greeting - The greeting text (e.g., "Good morning").
 * @param {string} name - The user's name.
 * @returns {string} HTML string.
 */
function generateMobileGreetingHTML(greeting, name) {
    return /*html*/`${greeting},<br><span style="color: var(--secondary-color); font-size: 48px;">${name}</span>`;
}
/**
 * Generates HTML for a contact option in the dropdown.
 * @param {object} contact - The contact object.
 * @param {number} index - The index of the contact.
 * @param {boolean} isSelected - Whether the contact is selected.
 * @returns {string} HTML string.
 */
function generateContactOptionHTML(contact, index, isSelected) {
    return /*html*/`
        <div class="dropdown-option ${isSelected ? 'selected' : ''}" onclick="toggleContactSelection(${index})">
            <div class="contact-badge" style="background-color: ${contact.color}">${getInitials(contact.name)}</div>
            <span>${contact.name}</span>
            <input type="checkbox" ${isSelected ? 'checked' : ''}>
        </div>
    `;
}

/**
 * Generates HTML for the cookie consent banner.
 * @returns {string} HTML string.
 */
function generateCookieBannerHTML() {
    return /*html*/`
        <div id="cookie-banner" style="position: fixed; bottom: 0; left: 0; width: 100%; background: #2A3647; color: white; padding: 20px; text-align: center; z-index: 9999; display: flex; justify-content: center; align-items: center; gap: 20px; box-shadow: 0 -2px 10px rgba(0,0,0,0.2); flex-wrap: wrap;">
            <span style="font-size: 16px;">We use cookies to ensure you get the best experience on our website. <a href="privacy-policy.html" style="color: #29ABE2; text-decoration: underline;">Privacy Policy</a></span>
            <div style="display: flex; gap: 10px;">
                <button onclick="acceptCookies()" style="background: #29ABE2; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 16px;">Accept</button>
                <button onclick="declineCookies()" style="background: transparent; color: white; border: 1px solid white; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 16px;">Decline</button>
            </div>
        </div>
    `;
}

/**
 * Generates HTML for the profile dropdown menu.
 * @param {string|null} user - The current user.
 * @returns {string} HTML string.
 */
function generateProfileMenuHTML(user) {
    if (!user) {
        return /*html*/`
            <a href="help.html">Help</a>
            <a href="legal-notice.html">Legal Notice</a>
            <a href="privacy-policy.html">Privacy Policy</a>
            <a href="index.html">Log in</a>
        `;
    } else {
        return /*html*/`
            <a href="help.html">Help</a>
            <a href="legal-notice.html">Legal Notice</a>
            <a href="privacy-policy.html">Privacy Policy</a>
            <a href="#" onclick="logOut()">Log out</a>
        `;
    }
}