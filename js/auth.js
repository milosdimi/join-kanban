/**
 * Logs in the user as a guest using Firebase Anonymous Auth.
 */
async function guestLogin() {
    try {
        await auth.signInAnonymously();
        window.location.href = 'summary.html';
    } catch (error) {
        console.error("Guest login failed:", error);
        alert("Guest login failed. Please try again.");
    }
}

/**
 * Initializes the login page.
 * Checks if "Remember Me" was used and pre-fills the email.
 */
function initLogin() {
    const email = localStorage.getItem('rememberedEmail');
    if (email) {
        const emailInput = document.getElementById('email');
        const rememberMe = document.getElementById('rememberMe');
        if (emailInput) emailInput.value = email;
        if (rememberMe) rememberMe.checked = true;
    }
}

/**
 * Initializes the signup page.
 */
function initSignup() {

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

    const name = nameInput.value;
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        const userCredential = await auth.createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;

        await user.updateProfile({
            displayName: name
        });

        await seedInitialDataForUser(user.uid, name, email);

        window.location.href = 'index.html?msg=signup_success';
    } catch (error) {
        console.error("Registration failed:", error);
        if (error.code == 'auth/email-already-in-use') {
            alert('An account with this email address already exists.');
        } else if (error.code == 'auth/weak-password') {
            alert('Password should be at least 6 characters.');
        } else {
            alert('Registration failed. Please try again.');
        }
    }
}

/**
 * Handles the login process using Firebase Authentication.
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

    try {
        const userCredential = await auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value);
        const user = userCredential.user;

        const rememberMe = document.getElementById('rememberMe');
        if (rememberMe && rememberMe.checked) {
            localStorage.setItem('rememberedEmail', emailInput.value);
        } else {
            localStorage.removeItem('rememberedEmail');
        }

        window.location.href = 'summary.html';
    } catch (error) {
        
        if (error.code === 'auth/invalid-login-credentials' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {

        } else {
            console.error("Login failed:", error);
        }

        showLoginError();
    }
}

/**
 * Sends a password reset email to the user.
 */
async function resetPassword() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value;

    if (!email) {
        const msgElement = document.getElementById('msg-email');
        emailInput.classList.add('error-border');
        if (msgElement) {
            msgElement.innerText = 'Please enter your email to reset password';
            msgElement.classList.remove('d-none');
        }
        return;
    }

    try {
        await auth.sendPasswordResetEmail(email);
        showAuthToast('Email sent');
    } catch (error) {
        console.error("Reset password failed:", error);
        if (error.code === 'auth/user-not-found') {
            showAuthToast('Email not found');
        } else {
            showAuthToast('Something went wrong');
        }
    }
}

/**
 * Shows a toast message for authentication feedback.
 * @param {string} message - The message to display.
 */
function showAuthToast(message) {
    const msgContainer = document.createElement('div');
    msgContainer.innerHTML = generateAuthToastHTML(message);
    document.body.appendChild(msgContainer);
    setTimeout(() => msgContainer.remove(), 3000);
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
        if (msgElement) msgElement.classList.add('d-none');
    });
}

/**
 * Displays the login error message.
 */
function showLoginError() {
    const msgBox = document.getElementById('msgBox');
    if (msgBox) msgBox.classList.add('visible');
}

/**
 * Validates a single input field for login/signup forms.
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
            if (msgElement) { msgElement.innerText = 'This field is required'; msgElement.classList.remove('d-none'); }
        } else {
            input.classList.add('error-border');
        }
        return false;
    }

    // 2. Check Email format if it is an email field
    if (input.type === 'email') {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
        if (!emailPattern.test(input.value)) {
            if (container) container.classList.add('error-border');
            else input.classList.add('error-border');
            if (msgElement) { msgElement.innerText = 'Please enter a valid email'; msgElement.classList.remove('d-none'); }
            return false;
        }
    }

    // 3. Check Password length
    if (input.type === 'password') {
        if (input.value.length < 6) {
            if (container) container.classList.add('error-border');
            else input.classList.add('error-border');
            if (msgElement) { msgElement.innerText = 'Password must be at least 6 characters.'; msgElement.classList.remove('d-none'); }
            return false;
        }
    }

    // Remove error if valid
    if (container) container.classList.remove('error-border');
    else input.classList.remove('error-border');
    if (msgElement) msgElement.classList.add('d-none');
    return true;
}