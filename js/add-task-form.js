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
 * Toggles the visibility of the contacts dropdown.
 * @param {Event} event - The click event.
 */
function toggleContactsDropdown(event) {
    if (event) event.stopPropagation();
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
    if (parts.length > 1) initials += parts[parts.length - 1].charAt(0);
    return initials.toUpperCase();
}
