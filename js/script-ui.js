/**
 * Checks if the user is logged in and redirects accordingly.
 */
function checkAuth() {
    if (typeof firebase === 'undefined') return setGuestState();
    firebase.auth().onAuthStateChanged(user => processAuthState(user));
}


/**
 * Sets the application to guest mode if Firebase is unavailable.
 */
function setGuestState() {
    hideSidebarMenu();
    updateHeaderVisibility(false);
    updateProfileMenu(null);
}


/**
 * Processes the current authentication state and handles redirects.
 * @param {object|null} user - The authenticated user or null.
 */
function processAuthState(user) {
    const path = window.location.pathname;
    const isProtected = ['summary.html', 'board.html', 'add-task.html', 'contacts.html'].some(p => path.includes(p));
    const isLogin = ['index.html', 'signup.html', '/'].some(p => path.endsWith(p));

    if (user) handleLoggedInUser(isLogin);
    else handleLoggedOutUser(isProtected);

    highlightActiveMenu();
    updateProfileMenu(user);
    updateUserInitials(user);
}


/**
 * Handles UI and redirects for a logged-in user.
 * @param {boolean} isLogin - Whether the user is on a login page.
 */
function handleLoggedInUser(isLogin) {
    if (isLogin) window.location.href = 'summary.html';
    showSidebarMenu();
    updateHeaderVisibility(true);
}


/**
 * Handles UI and redirects for a logged-out user.
 * @param {boolean} isProtected - Whether the user is on a protected page.
 */
function handleLoggedOutUser(isProtected) {
    if (isProtected) window.location.href = 'index.html';
    hideSidebarMenu();
    updateHeaderVisibility(false);
}


/**
 * Immediately hides sensitive menu items on public pages before Firebase auth check completes.
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
 * Toggles visibility of the Help and Profile icons in the header.
 * @param {boolean} visible - True to show icons, false to hide them.
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

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.add('guest-mode');
}


/**
 * Shows the main sidebar navigation.
 */
function showSidebarMenu() {
    let sidebarNav = document.getElementById('sidebar-nav');
    let sidebarGuest = document.getElementById('sidebar-guest');

    if (sidebarNav) sidebarNav.classList.remove('d-none');
    if (sidebarGuest) sidebarGuest.classList.add('d-none');

    const sidebar = document.querySelector('.sidebar');
    if (sidebar) sidebar.classList.remove('guest-mode');
}


/**
 * Logs out the current user and redirects to the login page.
 */
async function logOut() {
    try {
        await firebase.auth().signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Logout failed:', error);
    }
}


/**
 * Updates the profile dropdown menu based on user status.
 * @param {object|null} user - The authenticated user or null.
 */
function updateProfileMenu(user) {
    let dropdown = document.getElementById('profileDropdown');
    if (dropdown) dropdown.innerHTML = generateProfileMenuHTML(user);
}


/**
 * Toggles the visibility of the profile dropdown menu.
 */
function toggleDropdown() {
    let dropdown = document.getElementById('profileDropdown');
    if (dropdown) dropdown.classList.toggle('d-none');
}


window.addEventListener('click', closeProfileDropdownOnClickOutside);


/**
 * Closes the profile dropdown when clicking outside of it.
 * @param {Event} event - The click event.
 */
function closeProfileDropdownOnClickOutside(event) {
    if (!event.target.matches('.profile-icon') && !event.target.closest('.profile-dropdown')) {
        let dropdown = document.getElementById('profileDropdown');
        if (dropdown && !dropdown.classList.contains('d-none')) dropdown.classList.add('d-none');
    }
}


/**
 * Updates the header profile icon with user initials if logged in.
 * @param {object|null} user - The authenticated user.
 */
function updateUserInitials(user) {
    let profileIcon = document.querySelector('.profile-icon');
    if (user && profileIcon && user.displayName && user.displayName !== 'Guest') {
        let profileDiv = document.createElement('div');
        profileDiv.classList.add('profile-icon', 'profile-initials');
        profileDiv.innerHTML = getInitials(user.displayName);
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
