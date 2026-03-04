let users = [];

/**
 * Loads users from local storage into the users array.
 */
async function loadUsers() {
    try {
        users = JSON.parse(localStorage.getItem('users')) || [];
    } catch (e) {
        console.error('Could not load users', e);
    }
}

/**
 * Logs in the user as a guest and redirects to the summary page.
 */
function guestLogin() {
    localStorage.setItem('currentUser', 'guest');
    window.location.href = 'summary.html';
}

/**
 * Initializes the signup page.
 */
function initSignup() {
    // Clean Code: No dummy data in production
}

/**
 * Toggles the signup button state based on form validity.
 */
function toggleSignupBtn() {
    const canSignup = checkSignupValidity();
    document.getElementById('signupBtn').disabled = !canSignup;
}

/**
 * Checks if all signup requirements are met.
 * @returns {boolean} True if valid, false otherwise.
 */
function checkSignupValidity() {
    const privacyCheckbox = document.getElementById('privacyPolicy');
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    return privacyCheckbox.checked && password.length > 0 && password === confirmPassword;
}

/**
 * Validates if the password and confirm password fields match.
 * Updates the UI accordingly.
 */
function validatePassword() {
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const msgBox = document.getElementById('msgBox');
    const confirmInput = document.getElementById('confirmPassword');

    if (password !== confirmPassword && confirmPassword.length > 0) {
        showPasswordError(msgBox, confirmInput);
    } else {
        hidePasswordError(msgBox, confirmInput);
    }
    toggleSignupBtn();
}

/**
 * Shows the password mismatch error.
 * @param {HTMLElement} msgBox - The error message element.
 * @param {HTMLElement} input - The input element to style.
 */
function showPasswordError(msgBox, input) {
    msgBox.classList.add('visible');
    input.style.borderColor = '#FF8190';
}

/**
 * Hides the password mismatch error.
 * @param {HTMLElement} msgBox - The error message element.
 * @param {HTMLElement} input - The input element to style.
 */
function hidePasswordError(msgBox, input) {
    msgBox.classList.remove('visible');
    input.style.borderColor = '#D1D1D1';
}

/**
 * Updates the password input icon based on input content.
 * @param {string} inputId - The ID of the input field.
 */
function updatePasswordIcon(inputId) {
    const input = document.getElementById(inputId);
    const icon = input.nextElementSibling;

    if (input.value.length === 0) {
        icon.src = 'assets/img/lock_icon.png';
        input.type = 'password';
    } else {

        if (icon.src.includes('lock_icon.png')) {
            icon.src = 'assets/img/invisible.png';
        }
    }
}

/**
 * Toggles the visibility of the password input.
 * @param {string} inputId - The ID of the input field.
 * @param {HTMLElement} icon - The icon element to update.
 */
function togglePasswordVisibility(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.value.length === 0) return;

    const type = input.type === 'password' ? 'text' : 'password';
    input.type = type;
    icon.src = type === 'password' ? 'assets/img/invisible.png' : 'assets/img/visible.png';
}

/**
 * Registers a new user if they don't exist yet.
 */
async function register() {
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmInput = document.getElementById('confirmPassword');
    const privacyCheckbox = document.getElementById('privacyPolicy');

    // Reset errors
    resetValidationErrors([nameInput, emailInput, passwordInput, confirmInput]);

    // Validate
    let isValid = true;
    if (!validateInput(nameInput)) isValid = false;
    if (!validateInput(emailInput)) isValid = false;
    if (!validateInput(passwordInput)) isValid = false;
    if (!validateInput(confirmInput)) isValid = false;
    if (!privacyCheckbox.checked) isValid = false;

    if (!isValid) return;

    await loadUsers();

    const email = emailInput.value;

    if (isUserExisting(email)) {
        alert('User already exists!');
        return;
    }

    await createAndLoginUser(nameInput.value, email, passwordInput.value);
}

/**
 * Checks if a user with the given email already exists.
 * @param {string} email - The email to check.
 * @returns {boolean} True if user exists.
 */
function isUserExisting(email) {
    return users.some(u => u.email === email);
}

/**
 * Creates a new user, saves to storage, and logs them in.
 * @param {string} name - User name.
 * @param {string} email - User email.
 * @param {string} password - User password.
 */
async function createAndLoginUser(name, email, password) {
    users.push({ name: name, email: email, password: password });
    await localStorage.setItem('users', JSON.stringify(users));
    window.location.href = 'index.html?msg=signup_success';
}

/**
 * Handles the login process.
 */
async function login() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const msgBox = document.getElementById('msgBox');

    resetValidationErrors([emailInput, passwordInput]);
    if (msgBox) msgBox.classList.remove('visible');

    let isValid = true;
    if (!validateInput(emailInput)) isValid = false;
    if (!validateInput(passwordInput)) isValid = false;

    if (!isValid) return;

    await loadUsers();
    const user = users.find(u => u.email === emailInput.value && u.password === passwordInput.value);

    if (user) {
        loginSuccess(user.name);
    } else {
        showLoginError();
    }
}

/**
 * Validates a single input field.
 * @param {HTMLElement} input - The input element.
 * @returns {boolean} True if valid.
 */
function validateInput(input) {
    const container = input.closest('.input-container');
    const msgId = 'msg-' + input.id;
    const msgElement = document.getElementById(msgId);
    
    // 1. Check if empty
    if (!input.value.trim()) {
        if (container) {
            container.classList.add('error-border');
            if(msgElement) { msgElement.innerText = 'This field is required'; msgElement.classList.remove('d-none'); }
        } else {
            input.classList.add('error-border');
        }
        return false;
    }

    // 2. Check Email format if it is an email field
    if (input.type === 'email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(input.value)) {
            if (container) container.classList.add('error-border');
            else input.classList.add('error-border');
            if(msgElement) { msgElement.innerText = 'Please enter a valid email'; msgElement.classList.remove('d-none'); }
            return false;
        }
    }

    // Remove error if valid
    if (container) {
        container.classList.remove('error-border');
    } else {
        input.classList.remove('error-border');
    }
    if(msgElement) { msgElement.classList.add('d-none'); }
    return true;
}

/**
 * Resets validation errors for a list of inputs.
 * @param {HTMLElement[]} inputs - Array of input elements.
 */
function resetValidationErrors(inputs) {
    inputs.forEach(input => {
        const container = input.closest('.input-container');
        const msgId = 'msg-' + input.id;
        const msgElement = document.getElementById(msgId);
        
        if (container) container.classList.remove('error-border');
        input.classList.remove('error-border');
        if(msgElement) msgElement.classList.add('d-none');
    });
}

/**
 * Sets the current user and redirects to summary.
 * @param {string} name - The user's name.
 */
function loginSuccess(name) {
    localStorage.setItem('currentUser', name);
    window.location.href = 'summary.html';
}

/**
 * Displays the login error message.
 */
function showLoginError() {
    const msgBox = document.getElementById('msgBox');
    if (msgBox) msgBox.classList.add('visible');
}