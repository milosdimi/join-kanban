﻿/**
 * Initializes the main application logic.
 * Includes HTML templates, checks authentication, and highlights the active menu.
 */
async function init() {
    await includeHTML();
    checkAuth();
    checkAndLoadDummyData();
    checkCookieConsent(); 
    highlightActiveMenu();
    updateProfileMenu(); 
    updateUserInitials();
    handleLoginAnimation();
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
    let user = localStorage.getItem('currentUser');
    let path = window.location.pathname;

    let loginPages = ['index.html', 'signup.html', '/'];
    let publicPages = ['privacy-policy.html', 'legal-notice.html', 'help.html'];
    // Checks
    let isLoginPage = loginPages.some(page => path.endsWith(page));
    let isPublicPage = publicPages.some(page => path.includes(page));

    if (user && isLoginPage) {
        window.location.href = 'summary.html';
        return;
    }

    if (!user) {

        if (!isLoginPage && !isPublicPage) {
            window.location.href = 'index.html';
        }

        else if (isPublicPage) {
            hideSidebarMenu();
        }
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
 * Logs out the current user and redirects to the login page.
 */
function logOut() {
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

/**
 * Updates the profile dropdown menu based on user status.
 * Changes "Log out" to "Log in" for guests or unauthenticated users.
 */
function updateProfileMenu() {
    let user = localStorage.getItem('currentUser');
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
function updateUserInitials() {
    let user = localStorage.getItem('currentUser');
    let profileIcon = document.querySelector('.profile-icon');

    if (user && profileIcon && user !== 'guest') {
        let initials = getInitials(user);
        
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
