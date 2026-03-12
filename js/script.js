/**
 * Initializes the main application logic.
 * Includes HTML templates, checks authentication, and highlights the active menu.
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
        if (url.includes(link.getAttribute('href'))) {
            link.classList.add('active');
        }
    });
}

/**
 * Checks if the user is logged in and redirects accordingly.
 * Redirects logged-in users away from login pages.
 * Redirects guests/unauthenticated users away from protected pages.
 */
function checkAuth() {
    const protectedPages = ['summary.html', 'board.html', 'add-task.html', 'contacts.html'];
    const loginPages = ['index.html', 'signup.html', '/'];
    const path = window.location.pathname;
    const isProtectedPage = protectedPages.some(page => path.includes(page));
    const isLoginPage = loginPages.some(page => path.endsWith(page));

    firebase.auth().onAuthStateChanged(user => {
        if (user) {

            if (isLoginPage) {
                window.location.href = 'summary.html';
            }
            showSidebarMenu();
            updateHeaderVisibility(true);
        } else {

            if (isProtectedPage) {
                window.location.href = 'index.html';
            }
            hideSidebarMenu();
            updateHeaderVisibility(false); 
        }

        highlightActiveMenu();
        updateProfileMenu(user);
        updateUserInitials(user);
    });
}

/**
 * NEW: Immediately hides sensitive menu items on public pages based on URL,
 * before Firebase auth check completes. Prevents "flashing" of internal nav.
 */
function preventAuthFlash() {
    const path = window.location.pathname;
    const publicPages = ['help.html', 'privacy-policy.html', 'legal-notice.html'];
    const isPublicPage = publicPages.some(page => path.includes(page));
    const isLoginPage = ['index.html', 'signup.html', '/'].some(page => path.endsWith(page));

    if (isPublicPage || isLoginPage) {
        let sidebarNav = document.getElementById('sidebar-nav');
        if (sidebarNav) sidebarNav.classList.add('d-none');

        updateHeaderVisibility(false);
    }
}

/**
 * NEW: Toggles visibility of the Help and Profile icons in the header.
 * @param {boolean} visible - true to show icons, false to hide them.
 */
function updateHeaderVisibility(visible) {
    const helpIcon = document.querySelector('.help-icon');
    const profileIcon = document.querySelector('.profile-icon');

    if (visible) {
        if (helpIcon) helpIcon.classList.remove('d-none');
        if (profileIcon) profileIcon.classList.remove('d-none');
    } else {
        if (helpIcon) helpIcon.classList.add('d-none');
        if (profileIcon) profileIcon.classList.add('d-none');
    }
}

/**
 * Hides the main sidebar navigation and shows the guest menu.
 */
function hideSidebarMenu() {
    let sidebarNav = document.getElementById('sidebar-nav');
    let sidebarGuest = document.getElementById('sidebar-guest');

    if (sidebarNav) sidebarNav.classList.add('d-none');
    if (sidebarGuest) sidebarGuest.classList.remove('d-none');
}

/**
 * NEW: Shows the main sidebar navigation.
 * Used when we confirm the user is logged in.
 */
function showSidebarMenu() {
    let sidebarNav = document.getElementById('sidebar-nav');
    let sidebarGuest = document.getElementById('sidebar-guest');

    if (sidebarNav) sidebarNav.classList.remove('d-none');
    if (sidebarGuest) sidebarGuest.classList.add('d-none');
}

/**
 * Logs out the current user and redirects to the login page.
 */
async function logOut() {
    try {
        await firebase.auth().signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error("Logout failed", error);
    }
}

/**
 * Updates the profile dropdown menu based on user status.
 * Changes "Log out" to "Log in" for guests or unauthenticated users.
 */
function updateProfileMenu(user) {
    let dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.innerHTML = generateProfileMenuHTML(user);
    }
}

/**
 * Toggles the visibility of the profile dropdown menu.
 */
function toggleDropdown() {
    let dropdown = document.getElementById('profileDropdown');
    if (dropdown) {
        dropdown.classList.toggle('d-none');
    }
}

/**
 * Closes the profile dropdown when clicking outside of it.
 */
window.addEventListener('click', function (event) {
    if (!event.target.matches('.profile-icon') && !event.target.closest('.profile-dropdown')) {
        let dropdown = document.getElementById('profileDropdown');
        if (dropdown && !dropdown.classList.contains('d-none')) {
            dropdown.classList.add('d-none');
        }
    }
});

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

function declineCookies() {
    localStorage.setItem('cookieConsent', 'false');
    document.getElementById('cookie-banner').remove();
}

/**
 * Handles the intro animation on the login page.
 * Runs only once per session and ensures it doesn't run on signup.
 */
function handleLoginAnimation() {
    const path = window.location.pathname;
    const isSignup = path.includes('signup.html');
    const logo = document.querySelector('.logo');
    const loginCard = document.querySelector('.login-card');
    const signupBox = document.querySelector('.header-signup-box');
    const loginPage = document.querySelector('.login-page');

    if (!isSignup && logo && loginCard && signupBox && loginPage && !sessionStorage.getItem('introShown')) {
        logo.classList.add('animate');
        loginCard.classList.add('animate');
        signupBox.classList.add('animate');
        loginPage.classList.add('animate');
        sessionStorage.setItem('introShown', 'true');
    }
}

/**
 * Updates the header profile icon with user initials if logged in.
 */
function updateUserInitials(user) {
    let profileIcon = document.querySelector('.profile-icon');

    if (user && profileIcon && user.displayName && user.displayName !== 'Guest') {
        let initials = getInitials(user.displayName);

        let profileDiv = document.createElement('div');
        profileDiv.classList.add('profile-icon'); 
        profileDiv.classList.add('profile-initials');
        profileDiv.innerHTML = initials;
        profileDiv.onclick = toggleDropdown;
        
        profileIcon.parentNode.replaceChild(profileDiv, profileIcon);
    }
}

/**
 * Generates initials from a name.
 * @param {string} name - The full name.
 * @returns {string} The initials (max 2 chars).
 */
function getInitials(name) {
    if (!name) return '';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
}

/**
 * Checks URL parameters for signup success message and displays a toast.
 */
function checkSignupSuccess() {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('msg') === 'signup_success') {
        const msgDiv = document.createElement('div');
        msgDiv.innerText = 'You Signed Up successfully';
        msgDiv.style.cssText = "position: fixed; bottom: 50%; left: 50%; transform: translate(-50%, 50%); background: #2A3647; color: white; padding: 20px; border-radius: 20px; z-index: 999; box-shadow: 0 4px 8px rgba(0,0,0,0.2); animation: slideInAndOut 3s ease-in-out forwards;";
        
        if (!document.getElementById('keyframes-slideInAndOut')) {
            const style = document.createElement('style');
            style.id = 'keyframes-slideInAndOut';
            style.innerHTML = `
                @keyframes slideInAndOut {
                    0% { opacity: 0; transform: translate(-50%, 100px); }
                    10% { opacity: 1; transform: translate(-50%, 50%); }
                    90% { opacity: 1; transform: translate(-50%, 50%); }
                    100% { opacity: 0; transform: translate(-50%, 100px); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(msgDiv);
        
        setTimeout(() => {
            msgDiv.remove();
            window.history.replaceState({}, document.title, window.location.pathname);
        }, 3000);
    }
}

/**
 * Creates the initial set of dummy tasks and contacts for a new user in Firestore.
 * This function is placed here to be globally accessible.
 * @param {string} userId - The UID of the new user.
 * @param {string} name - The name of the user.
 * @param {string} email - The email of the user.
 */
async function seedInitialDataForUser(userId, name, email) {
    const batch = db.batch();
    const dummyTasks = getDummyTasks();
    const dummyContacts = getDummyContacts();

    const userRef = db.collection('users').doc(userId);
    batch.set(userRef, {
        name: name,
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    dummyTasks.forEach(task => {
        const taskRef = db.collection('users').doc(userId).collection('tasks').doc();
        batch.set(taskRef, task);
    });

    dummyContacts.forEach(contact => {
        const contactRef = db.collection('users').doc(userId).collection('contacts').doc();
        batch.set(contactRef, contact);
    });

    await batch.commit();
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
