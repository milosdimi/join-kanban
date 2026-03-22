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

        <div class="mobile-menu-btn" onclick="toggleMobileMenu(event)">
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


/**
 * Generates HTML for the authentication toast message.
 * @param {string} message - The message to display.
 * @returns {string} HTML string.
 */
function generateAuthToastHTML(message) {
    return /*html*/`
        <div class="auth-toast">${message} <img src="assets/img/mail_icon.png" style="filter: brightness(0) invert(1); width: 24px; height: 24px;"></div>
    `;
}
