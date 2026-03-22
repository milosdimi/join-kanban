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
 * Renders the contact list grouped by first letter.
 */
function renderContactList() {
    let list = document.getElementById('contactList');
    list.innerHTML = '';
    if (contacts.length === 0) return displayEmptyContactList(list);
    contacts.sort((a, b) => a.name.localeCompare(b.name));
    renderContactsGrouped(list);
}



/**
 * Displays a placeholder message when the contact list is empty.
 * @param {HTMLElement} list - The list container element.
 */
function displayEmptyContactList(list) {
    list.innerHTML = '<div style="padding: 20px; text-align: center; color: #A8A8A8;">No contacts yet.</div>';
}



/**
 * Renders sorted contacts grouped by their first letter.
 * @param {HTMLElement} list - The list container element.
 */
function renderContactsGrouped(list) {
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
 * @param {string} name - The full name.
 * @returns {string} The initials (uppercase).
 */
function getInitials(name) {
    let parts = name.split(' ');
    let initials = parts[0].charAt(0);
    if (parts.length > 1) initials += parts[parts.length - 1].charAt(0);
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



/**
 * Highlights the active contact in the list.
 * @param {number} index - The index of the contact.
 */
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
    hideMobileMenuOptions();
}



/**
 * Hides the mobile menu options.
 */
function hideMobileMenuOptions() {
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
        if (menu.classList.contains('show')) document.addEventListener('click', closeMobileMenuOnClickOutside);
        else document.removeEventListener('click', closeMobileMenuOnClickOutside);
    }
}



/**
 * Closes the mobile menu when clicking outside of it.
 * @param {Event} event - The click event.
 */
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
    setupContactModalUI('Add contact', 'add');
    document.getElementById('contactForm').reset();
    resetContactAvatar();
    showContactModal();
}



/**
 * Resets the contact modal avatar to default placeholder.
 */
function resetContactAvatar() {
    const avatar = document.getElementById('contactModalAvatar');
    avatar.innerHTML = '<img src="assets/img/person.svg" alt="User" class="user-icon-placeholder">';
    avatar.style.backgroundColor = '#D1D1D1';
}



/**
 * Sets up the UI for the contact modal based on mode.
 * @param {string} title - The modal title.
 * @param {string} mode - 'add' or 'edit'.
 * @param {number} [index] - Optional contact index.
 */
function setupContactModalUI(title, mode, index = null) {
    document.getElementById('contactModalTitle').innerText = title;
    const actionsDiv = document.querySelector('.add-contact-actions');
    actionsDiv.innerHTML = generateContactModalActionsHTML(mode, index);
}



/**
 * Displays the contact modal overlay.
 */
function showContactModal() {
    resetContactValidation();
    const overlay = document.getElementById('addContactOverlay');
    overlay.classList.remove('d-none');
    overlay.onclick = function(e) { if (e.target === this) closeAddContact(); };
    document.body.classList.add('no-scroll');
}



/**
 * Opens the modal to edit an existing contact.
 * @param {number} index - The index of the contact.
 */
function openEditContact(index) {
    editingContactIndex = index;
    const contact = contacts[index];
    hideMobileMenuOptions();
    setupContactModalUI('Edit contact', 'edit', index);
    populateContactForm(contact);
    showContactModal();
}



/**
 * Populates the form fields with existing contact data.
 * @param {object} contact - The contact object.
 */
function populateContactForm(contact) {
    document.getElementById('contactName').value = contact.name;
    document.getElementById('contactEmail').value = contact.email;
    document.getElementById('contactPhone').value = contact.phone;
    const avatar = document.getElementById('contactModalAvatar');
    avatar.innerHTML = getInitials(contact.name);
    avatar.style.backgroundColor = contact.color;
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
