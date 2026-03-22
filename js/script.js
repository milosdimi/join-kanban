/**
 * Initializes the main application logic.
 */
async function init() {
    await includeHTML();
    preventAuthFlash();
    checkCookieConsent();
    handleLoginAnimation();
    checkSignupSuccess();
    checkAuth();
}


/**
 * Fetches and includes HTML content for elements with the 'w3-include-html' attribute.
 */
async function includeHTML() {
    let includeElements = document.querySelectorAll('[w3-include-html]');
    for (let i = 0; i < includeElements.length; i++) {
        const element = includeElements[i];
        let file = element.getAttribute("w3-include-html");
        let resp = await fetch(file);
        if (resp.ok) {
            element.innerHTML = await resp.text();
        } else {
            element.innerHTML = 'Page not found';
        }
    }
}


/**
 * Highlights the sidebar menu link corresponding to the current URL.
 */
function highlightActiveMenu() {
    let url = window.location.pathname;
    let links = document.querySelectorAll('.menu-link');
    links.forEach(link => {
        if (url.includes(link.getAttribute('href'))) link.classList.add('active');
    });
}


/**
 * Checks if the user has accepted cookies. If not, displays a banner.
 */
function checkCookieConsent() {
    if (!localStorage.getItem('cookieConsent')) {
        document.body.insertAdjacentHTML('beforeend', generateCookieBannerHTML());
    }
}


/**
 * Saves cookie consent and removes the banner.
 */
function acceptCookies() {
    localStorage.setItem('cookieConsent', 'true');
    document.getElementById('cookie-banner').remove();
}


/**
 * Declines cookie consent and removes the banner.
 */
function declineCookies() {
    localStorage.setItem('cookieConsent', 'false');
    document.getElementById('cookie-banner').remove();
}


/**
 * Handles the intro animation on the login page.
 */
function handleLoginAnimation() {
    const path = window.location.pathname;
    const isSignup = path.includes('signup.html');
    const logo = document.querySelector('.logo');
    const loginCard = document.querySelector('.login-card');
    const signupBox = document.querySelector('.header-signup-box');
    const loginPage = document.querySelector('.login-page');

    if (!isSignup && logo && loginCard && loginPage && !sessionStorage.getItem('introShown')) {
        logo.classList.add('animate');
        loginCard.classList.add('animate');
        if (signupBox) signupBox.classList.add('animate');
        loginPage.classList.add('animate');
        sessionStorage.setItem('introShown', 'true');
    }
}


/**
 * Checks URL parameters for signup success message and displays a toast.
 */
function checkSignupSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('msg') === 'signup_success') showSignupSuccessToast();
}


/**
 * Displays the signup success toast and cleans up the URL.
 */
function showSignupSuccessToast() {
    const msgDiv = createSignupToastElement();
    injectSignupToastStyles();
    document.body.appendChild(msgDiv);

    setTimeout(() => {
        msgDiv.remove();
        window.history.replaceState({}, document.title, window.location.pathname);
    }, 3000);
}


/**
 * Creates the toast message element for signup success.
 * @returns {HTMLElement} The created toast element.
 */
function createSignupToastElement() {
    const msgDiv = document.createElement('div');
    msgDiv.innerText = 'You Signed Up successfully';
    msgDiv.style.cssText = "position: fixed; bottom: 50%; left: 50%; transform: translate(-50%, 50%); background: #2A3647; color: white; padding: 20px; border-radius: 20px; z-index: 999; box-shadow: 0 4px 8px rgba(0,0,0,0.2); animation: slideInAndOut 3s ease-in-out forwards;";
    return msgDiv;
}


/**
 * Injects CSS keyframes for the signup toast animation if not present.
 */
function injectSignupToastStyles() {
    if (!document.getElementById('keyframes-slideInAndOut')) {
        const style = document.createElement('style');
        style.id = 'keyframes-slideInAndOut';
        style.innerHTML = `@keyframes slideInAndOut { 0% { opacity: 0; transform: translate(-50%, 100px); } 10% { opacity: 1; transform: translate(-50%, 50%); } 90% { opacity: 1; transform: translate(-50%, 50%); } 100% { opacity: 0; transform: translate(-50%, 100px); } }`;
        document.head.appendChild(style);
    }
}


/**
 * Creates the initial set of dummy tasks and contacts for a new user in Firestore.
 * @param {string} userId - The UID of the new user.
 * @param {string} name - The name of the user.
 * @param {string} email - The email of the user.
 */
async function seedInitialDataForUser(userId, name, email) {
    const batch = db.batch();
    setNewUserDocument(batch, userId, name, email);
    seedDummyTasks(batch, userId);
    seedDummyContacts(batch, userId);
    await batch.commit();
}


/**
 * Sets the basic user document in the batch.
 * @param {object} batch - The Firestore batch.
 * @param {string} userId - The user ID.
 * @param {string} name - The user name.
 * @param {string} email - The user email.
 */
function setNewUserDocument(batch, userId, name, email) {
    const userRef = db.collection('users').doc(userId);
    batch.set(userRef, {
        name: name,
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
}


/**
 * Adds dummy tasks to the batch for a new user.
 * @param {object} batch - The Firestore batch.
 * @param {string} userId - The user ID.
 */
function seedDummyTasks(batch, userId) {
    const dummyTasks = getDummyTasks();
    dummyTasks.forEach(task => {
        const taskRef = db.collection('users').doc(userId).collection('tasks').doc();
        batch.set(taskRef, task);
    });
}


/**
 * Adds dummy contacts to the batch for a new user.
 * @param {object} batch - The Firestore batch.
 * @param {string} userId - The user ID.
 */
function seedDummyContacts(batch, userId) {
    const dummyContacts = getDummyContacts();
    dummyContacts.forEach(contact => {
        const contactRef = db.collection('users').doc(userId).collection('contacts').doc();
        batch.set(contactRef, contact);
    });
}


/**
 * Shows the global loading spinner.
 */
function showSpinner() {
    document.getElementById('loader-overlay').classList.remove('d-none');
}


/**
 * Hides the global loading spinner.
 */
function hideSpinner() {
    document.getElementById('loader-overlay').classList.add('d-none');
}
