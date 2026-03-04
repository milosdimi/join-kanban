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

/**
 * Checks if local storage is empty and loads dummy data if needed.
 */
function checkAndLoadDummyData() {
    if (!localStorage.getItem('tasks') && !localStorage.getItem('contacts')) {
        const dummyContacts = [
            { name: "Walter White", email: "heisenberg@gmail.com", phone: "+1 505 555 0100", color: "#FF7A00" },
            { name: "Jesse Pinkman", email: "capncook@hotmail.com", phone: "+1 505 555 0101", color: "#FF5EB3" },
            { name: "Skyler White", email: "skyler.white@yahoo.com", phone: "+1 505 555 0102", color: "#6E52FF" },
            { name: "Hank Schrader", email: "asac.schrader@dea.gov", phone: "+1 505 555 0103", color: "#9327FF" },
            { name: "Saul Goodman", email: "bettercallsaul@gmail.com", phone: "+1 505 503 4455", color: "#00BEE8" },
            { name: "Mike Ehrmantraut", email: "mike.security@gmail.com", phone: "+1 505 555 0104", color: "#1FD7C1" },
            { name: "Gustavo Fring", email: "pollos@hermanos.com", phone: "+1 505 555 0105", color: "#FF745E" },
            { name: "Marie Schrader", email: "marie.purple@gmail.com", phone: "+1 505 555 0106", color: "#FFA35E" },
            { name: "Tuco Salamanca", email: "tuco@cartel.net", phone: "+1 505 555 0107", color: "#FC71FF" },
            { name: "Gale Boetticher", email: "gale.coffee@gmail.com", phone: "+1 505 555 0108", color: "#FFC701" }
        ];

        const dummyTasks = [
            { id: 1710000000001, title: "Cook Batch #42", description: "Prepare the new batch of Blue Sky. Purity must be 99.1%.", dueDate: "2024-12-31", category: "Technical Task", prio: "urgent", status: "todo", subtasks: [{ title: "Clean glassware", completed: false }, { title: "Check methylamine supply", completed: false }], assignedContacts: ["heisenberg@gmail.com", "capncook@hotmail.com"] },
            { id: 1710000000002, title: "Call Saul Goodman", description: "Discuss money laundering options for the car wash.", dueDate: "2024-11-15", category: "User Story", prio: "medium", status: "inprogress", subtasks: [], assignedContacts: ["skyler.white@yahoo.com", "bettercallsaul@gmail.com"] },
            { id: 1710000000003, title: "Find new RV", description: "The old Crystal Ship is compromised. We need a new mobile lab.", dueDate: "2024-10-20", category: "Technical Task", prio: "urgent", status: "awaitingfeedback", subtasks: [{ title: "Check classifieds", completed: true }], assignedContacts: ["capncook@hotmail.com", "mike.security@gmail.com"] },
            { id: 1710000000004, title: "Distribution Meeting", description: "Meeting with Gus Fring at Los Pollos Hermanos.", dueDate: "2024-12-01", category: "User Story", prio: "low", status: "done", subtasks: [], assignedContacts: ["pollos@hermanos.com", "heisenberg@gmail.com"] },
            { id: 1710000000005, title: "DEA Surveillance", description: "Check if Hank is onto the laundry facility.", dueDate: "2024-11-01", category: "Technical Task", prio: "medium", status: "todo", subtasks: [{ title: "Place bugs", completed: false }, { title: "Monitor radio frequencies", completed: false }], assignedContacts: ["mike.security@gmail.com"] }
        ];

        localStorage.setItem('contacts', JSON.stringify(dummyContacts));
        localStorage.setItem('tasks', JSON.stringify(dummyTasks));
    }
}
