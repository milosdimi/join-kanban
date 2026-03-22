/**
 * Validates the contact form inputs.
 * @returns {boolean} True if valid.
 */
function validateContactForm() {
    const name = document.getElementById('contactName');
    const email = document.getElementById('contactEmail');
    const phone = document.getElementById('contactPhone');
    return validateInput(name) && validateInput(email) && validateInput(phone);
}


/**
 * Validates a single input field.
 * @param {HTMLInputElement} input - The input element to validate.
 * @returns {boolean} True if valid.
 */
function validateInput(input) {
    let message = getValidationMessage(input);
    return toggleInputError(input, message);
}


/**
 * Gets the validation error message for a specific input field.
 * @param {HTMLElement} input - The input element.
 * @returns {string} The error message, or empty if valid.
 */
function getValidationMessage(input) {
    if (!input.value.trim()) return 'This field is required.';
    if (input.type === 'email' && !isValidContactEmail(input.value)) {
        return 'Please enter a valid email address.';
    }
    if (input.id === 'contactPhone' && !isValidContactPhone(input.value)) {
        return 'Please enter a valid phone number.';
    }
    return '';
}


/**
 * Checks if a string is a valid email format.
 * @param {string} email - The email string.
 * @returns {boolean} True if valid.
 */
function isValidContactEmail(email) {
    const emailPattern = /^[^\s@]+@(?!.*\.\.)[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}


/**
 * Checks if a string is a valid phone format.
 * @param {string} phone - The phone string.
 * @returns {boolean} True if valid.
 */
function isValidContactPhone(phone) {
    const phonePattern = /^\+?[0-9\s\-]{3,}$/;
    return !phone.trim() || phonePattern.test(phone);
}


/**
 * Toggles the error state of an input field based on the message.
 * @param {HTMLElement} input - The input element.
 * @param {string} message - The error message.
 * @returns {boolean} True if no error.
 */
function toggleInputError(input, message) {
    const msgElement = document.getElementById(`msg-${input.id}`);
    if (message) {
        input.classList.add('error-border');
        if (msgElement) { msgElement.innerText = message; msgElement.classList.remove('d-none'); }
        return false;
    } else {
        input.classList.remove('error-border');
        if (msgElement) msgElement.classList.add('d-none');
        return true;
    }
}


/**
 * Resets all validation states in the contact form.
 */
function resetContactValidation() {
    const inputs = ['contactName', 'contactEmail', 'contactPhone'];
    inputs.forEach(id => {
        const input = document.getElementById(id);
        const msgElement = document.getElementById(`msg-${id}`);
        if (input) input.classList.remove('error-border');
        if (msgElement) msgElement.classList.add('d-none');
    });
}


/**
 * Creates a new contact and saves it.
 */
async function createContact() {
    const newContact = getContactDataFromForm();
    const user = firebase.auth().currentUser;
    if (user) await db.collection('users').doc(user.uid).collection('contacts').add(newContact);

    await loadContacts();
    renderContactList();
    closeAddContact();
    showContactSuccessMessage('Contact successfully created');
}


/**
 * Collects new contact data from the form.
 * @returns {object} The contact object.
 */
function getContactDataFromForm() {
    return {
        name: document.getElementById('contactName').value.trim(),
        email: document.getElementById('contactEmail').value.trim(),
        phone: document.getElementById('contactPhone').value.trim(),
        color: colors[Math.floor(Math.random() * colors.length)]
    };
}


/**
 * Saves changes to an existing contact.
 * @param {number} index - The index of the contact.
 */
async function saveContact(index) {
    updateContactObject(index);
    const contactId = contacts[index].id;
    const user = firebase.auth().currentUser;
    if (user) await db.collection('users').doc(user.uid).collection('contacts').doc(contactId).update(contacts[index]);

    renderContactList();
    showContactDetails(index);
    closeAddContact();
    showContactSuccessMessage('Contact successfully updated');
}


/**
 * Updates an existing contact object with form data.
 * @param {number} index - The index of the contact.
 */
function updateContactObject(index) {
    contacts[index].name = document.getElementById('contactName').value.trim();
    contacts[index].email = document.getElementById('contactEmail').value.trim();
    contacts[index].phone = document.getElementById('contactPhone').value.trim();
}


/**
 * Deletes a contact.
 * @param {number} index - The index of the contact.
 */
async function deleteContact(index) {
    const contactId = contacts[index].id;
    const user = firebase.auth().currentUser;
    if (user) await db.collection('users').doc(user.uid).collection('contacts').doc(contactId).delete();

    contacts.splice(index, 1);
    renderContactList();
    document.getElementById('contactDetail').innerHTML = '';
    closeMobileDetails();
    showContactSuccessMessage('Contact deleted');
}


/**
 * Shows a success message animation.
 * @param {string} text - The message text.
 */
function showContactSuccessMessage(text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = 'contact-success-msg';
    msgDiv.innerText = text;
    document.body.appendChild(msgDiv);
    setTimeout(() => msgDiv.remove(), 2000);
}
