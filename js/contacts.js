let contacts = [];
const colors = ['#FF7A00', '#FF5EB3', '#6E52FF', '#9327FF', '#00BEE8', '#1FD7C1', '#FF745E', '#FFA35E', '#FC71FF', '#FFC701', '#0038FF', '#C3FF2B', '#FFE62B', '#FF4646', '#FFBB2B'];
let editingContactIndex = null;

/**
 * Initializes the contacts page.
 */
async function initContacts() {
    showSpinner();
    await loadContacts();
    renderContactList();
    hideSpinner();
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
 * Renders the contact list grouped by first letter.
 */
function renderContactList() {
    let list = document.getElementById('contactList');
    list.innerHTML = '';

    if (contacts.length === 0) {
        list.innerHTML = '<div style="padding: 20px; text-align: center; color: #A8A8A8;">No contacts yet.</div>';
        return;
    }

    contacts.sort((a, b) => a.name.localeCompare(b.name));

    let currentLetter = '';

    for (let i = 0; i < contacts.length; i++) {
        const contact = contacts[i];
        const firstLetter = contact.name.charAt(0).toUpperCase();

        if (firstLetter !== currentLetter) {
            currentLetter = firstLetter;
            list.innerHTML += generateContactLetterHTML(currentLetter);
        }

        list.innerHTML += generateContactItemHTML(contact, i);
    }
}

/**
 * Generates initials from a name.
 */
function getInitials(name) {
    let parts = name.split(' ');
    let initials = parts[0].charAt(0);
    if (parts.length > 1) {
        initials += parts[parts.length - 1].charAt(0);
    }
    return initials.toUpperCase();
}

/**
 * Displays the details of a selected contact.
 * @param {number} index - The index of the contact.
 */
function showContactDetails(index) {
    const contact = contacts[index];
    const content = document.getElementById('contactDetail');

    if (window.innerWidth < 1000) {
        document.querySelector('.contacts-container').classList.add('show-mobile-details');
        document.body.classList.add('no-scroll');
    }

    content.innerHTML = generateContactDetailHTML(contact, index);
    highlightActiveContact(index);
}

function highlightActiveContact(index) {

    document.querySelectorAll('.contact-item').forEach(item => item.classList.remove('active'));

    const activeItem = document.getElementById(`contact-${index}`);
    if (activeItem) activeItem.classList.add('active');
}

/**
 * Closes the mobile detail view.
 */
function closeMobileDetails() {
    document.querySelector('.contacts-container').classList.remove('show-mobile-details');
    document.body.classList.remove('no-scroll');

    const menu = document.getElementById('mobileMenuOptions');
    if (menu) menu.classList.remove('show');
}

/**
 * Toggles the mobile options menu.
 * @param {Event} event - The click event.
 */
function toggleMobileMenu(event) {
    if (event) event.stopPropagation();
    const menu = document.getElementById('mobileMenuOptions');
    if (menu) {
        menu.classList.toggle('show');
        if (menu.classList.contains('show')) {
            document.addEventListener('click', closeMobileMenuOnClickOutside);
        } else {
            document.removeEventListener('click', closeMobileMenuOnClickOutside);
        }
    }
}

function closeMobileMenuOnClickOutside(event) {
    const menu = document.getElementById('mobileMenuOptions');
    if (!menu || !menu.contains(event.target)) {
        if (menu) menu.classList.remove('show');
        document.removeEventListener('click', closeMobileMenuOnClickOutside);
    }
}

/**
 * Opens the modal to add a new contact.
 */
function openAddContact() {
    editingContactIndex = null;
    document.getElementById('contactModalTitle').innerText = 'Add contact';
    
    const actionsDiv = document.querySelector('.add-contact-actions');
    actionsDiv.innerHTML = generateContactModalActionsHTML('add');

    document.getElementById('contactForm').reset();
    const avatar = document.getElementById('contactModalAvatar');
    avatar.innerHTML = '<img src="assets/img/person.svg" alt="User" class="user-icon-placeholder">';
    avatar.style.backgroundColor = '#D1D1D1';

    resetContactValidation();
    document.getElementById('addContactOverlay').classList.remove('d-none');
    document.getElementById('addContactOverlay').onclick = function(e) {
        if(e.target === this) closeAddContact();
    };
    document.body.classList.add('no-scroll'); 
}

/**
 * Opens the modal to edit an existing contact.
 * @param {number} index - The index of the contact.
 */
function openEditContact(index) {
    editingContactIndex = index;
    const contact = contacts[index];

    const menu = document.getElementById('mobileMenuOptions');
    if (menu) menu.classList.remove('show');

    document.getElementById('contactModalTitle').innerText = 'Edit contact';
    
    const actionsDiv = document.querySelector('.add-contact-actions');
    actionsDiv.innerHTML = generateContactModalActionsHTML('edit', index);

    document.getElementById('contactName').value = contact.name;
    document.getElementById('contactEmail').value = contact.email;
    document.getElementById('contactPhone').value = contact.phone;

    const avatar = document.getElementById('contactModalAvatar');
    avatar.innerHTML = getInitials(contact.name);
    avatar.style.backgroundColor = contact.color;

    resetContactValidation();
    document.getElementById('addContactOverlay').classList.remove('d-none');
    document.getElementById('addContactOverlay').onclick = function(e) {
        if(e.target === this) closeAddContact();
    };
    document.body.classList.add('no-scroll'); 
}

/**
 * Closes the add/edit contact modal.
 */
function closeAddContact() {
    const overlay = document.getElementById('addContactOverlay');
    const card = overlay.querySelector('.add-contact-card');
    card.classList.add('slide-out');

    setTimeout(() => {
        overlay.classList.add('d-none');
        card.classList.remove('slide-out');
        document.body.classList.remove('no-scroll'); 
    }, 300);
}

/**
 * Handles the form submission for adding or editing a contact.
 */
function handleContactFormSubmit() {
    if (!validateContactForm()) return;

    if (editingContactIndex === null) {
        createContact();
    } else {
        saveContact(editingContactIndex);
    }
}

/**
 * Validates the contact form inputs.
 * @returns {boolean} True if valid.
 */
function validateContactForm() {
    const name = document.getElementById('contactName');
    const email = document.getElementById('contactEmail');
    const phone = document.getElementById('contactPhone');
    
    let isValid = true;
    if (!validateInput(name)) isValid = false;
    if (!validateInput(email)) isValid = false;
    if (!validateInput(phone)) isValid = false;

    return isValid;
}

/**
 * Validates a single input field (checks for empty value and email format).
 * @param {HTMLInputElement} input - The input element to validate.
 * @returns {boolean} True if valid, false otherwise.
 */
function validateInput(input) {
    const msgElement = document.getElementById(`msg-${input.id}`);
    let message = '';

    if (!input.value.trim()) {
        message = 'This field is required.';
    } 
    
    if (!message && input.type === 'email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(input.value)) {
            message = 'Please enter a valid email address.';
        }
    }

    if (!message && input.id === 'contactPhone') {
        const phonePattern = /^[+0-9\s]*$/;
        if (input.value.trim() && !phonePattern.test(input.value)) {
            message = 'Please enter a valid phone number.';
        }
    }

    if (message) {
        input.classList.add('error-border');
        if (msgElement) {
            msgElement.innerText = message;
            msgElement.classList.remove('d-none');
        }
        return false;
    } else {
        input.classList.remove('error-border');
        if (msgElement) {
            msgElement.classList.add('d-none');
        }
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
        if (input) {
            input.classList.remove('error-border');
        }
        if (msgElement) {
            msgElement.classList.add('d-none');
        }
    });
}
/**
 * Creates a new contact and saves it.
 */
async function createContact() {
    let name = document.getElementById('contactName');
    let email = document.getElementById('contactEmail');
    let phone = document.getElementById('contactPhone');

    const newContact = {
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        color: colors[Math.floor(Math.random() * colors.length)]
    };

    const user = firebase.auth().currentUser;
    if (user) await db.collection('users').doc(user.uid).collection('contacts').add(newContact);
    
    await loadContacts();
    renderContactList();
    closeAddContact();
    showContactSuccessMessage('Contact successfully created');
}

/**
 * Saves changes to an existing contact.
 * @param {number} index - The index of the contact.
 */
async function saveContact(index) {
    let name = document.getElementById('contactName').value;
    let email = document.getElementById('contactEmail').value;
    let phone = document.getElementById('contactPhone').value;
    
    const contactId = contacts[index].id;

    contacts[index].name = name.trim();
    contacts[index].email = email.trim();
    contacts[index].phone = phone.trim();

    const user = firebase.auth().currentUser;
    if (user) await db.collection('users').doc(user.uid).collection('contacts').doc(contactId).update(contacts[index]);

    renderContactList();
    showContactDetails(index);
    closeAddContact();
    showContactSuccessMessage('Contact successfully updated');
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