/**
 * Logs in the user as a guest using Firebase Anonymous Auth.
 */
async function guestLogin() {
    try {
        await auth.signInAnonymously();
        window.location.href = 'summary.html';
    } catch (error) {
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
    setupValidationListeners();
}

/**
 * Initializes the signup page.
 */
function initSignup() {
    setupValidationListeners();
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
        if (icon.src.includes('lock_icon.png')) icon.src = 'assets/img/invisible.png';
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
    const inputs = getSignupInputs();
    resetValidationErrors(Object.values(inputs));
    if (!validateSignupForm(inputs)) return;
    showSpinner();
    try {
        await executeRegistration(inputs);
    } catch (error) {
        handleRegistrationError(error);
    }
}

/**
 * Retrieves the signup form inputs.
 * @returns {object} The input elements.
 */
function getSignupInputs() {
    return {
        name: document.getElementById('name'),
        email: document.getElementById('email'),
        password: document.getElementById('password'),
        confirm: document.getElementById('confirmPassword'),
        privacy: document.getElementById('privacyPolicy')
    };
}

/**
 * Validates the entire signup form.
 * @param {object} inputs - The input elements.
 * @returns {boolean} True if valid.
 */
function validateSignupForm(inputs) {
    let isValid = true;
    if (!validateInput(inputs.name)) isValid = false;
    if (!validateInput(inputs.email)) isValid = false;
    if (!validateInput(inputs.password)) isValid = false;
    if (!validateInput(inputs.confirm)) isValid = false;
    if (!inputs.privacy.checked) isValid = false;
    return isValid;
}

/**
 * Executes the user registration process.
 * @param {object} inputs - The input elements.
 */
async function executeRegistration(inputs) {
    const { email, password, name } = inputs;
    const userCredential = await auth.createUserWithEmailAndPassword(email.value, password.value);
    await userCredential.user.updateProfile({ displayName: name.value });
    await seedInitialDataForUser(userCredential.user.uid, name.value, email.value);
    await auth.signOut();
    window.location.href = 'index.html?msg=signup_success';
}

/**
 * Handles errors during the registration process.
 * @param {Error} error - The error object.
 */
function handleRegistrationError(error) {
    hideSpinner();
    if (error.code == 'auth/email-already-in-use') {
        showInputError('email', 'Email already in use');
    } else if (error.code == 'auth/weak-password') {
        showInputError('password', 'At least 6 characters');
    } else {
        alert('Registration failed. Please try again.');
    }
}

/**
 * Shows a validation error message for a specific input field.
 * @param {string} inputId - The ID of the input field.
 * @param {string} msg - The error message to display.
 */
function showInputError(inputId, msg) {
    const input = document.getElementById(inputId);
    const msgElement = document.getElementById(`msg-${inputId}`);
    if (input && msgElement) {
        input.closest('.input-container').classList.add('error-border');
        msgElement.innerText = msg;
        msgElement.classList.remove('d-none');
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

    let isValid = validateInput(emailInput) && validateInput(passwordInput);
    if (!isValid) return;

    await executeLogin(emailInput, passwordInput);
}

/**
 * Executes the login authentication request.
 * @param {HTMLElement} emailInput - The email input element.
 * @param {HTMLElement} passwordInput - The password input element.
 */
async function executeLogin(emailInput, passwordInput) {
    showSpinner();
    try {
        const userCredential = await auth.signInWithEmailAndPassword(emailInput.value, passwordInput.value);
        handleRememberMe(emailInput.value);
        window.location.href = 'summary.html';
    } catch (error) {
        hideSpinner();
        showLoginError();
    }
}

/**
 * Stores or removes the remembered email based on the checkbox.
 * @param {string} email - The email to remember.
 */
function handleRememberMe(email) {
    const rememberMe = document.getElementById('rememberMe');
    if (rememberMe && rememberMe.checked) {
        localStorage.setItem('rememberedEmail', email);
    } else {
        localStorage.removeItem('rememberedEmail');
    }
}

/**
 * Sends a password reset email to the user.
 */
async function resetPassword() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value;
    if (!email) {
        showResetEmailError(emailInput);
        return;
    }
    await executePasswordReset(email);
}

/**
 * Displays an error if the reset email input is empty.
 * @param {HTMLElement} emailInput - The email input element.
 */
function showResetEmailError(emailInput) {
    const container = emailInput.closest('.input-container');
    const msgElement = document.getElementById('msg-email');
    if (container) container.classList.add('error-border');
    else emailInput.classList.add('error-border');
    if (msgElement) {
        msgElement.innerText = 'Please enter your email';
        msgElement.classList.remove('d-none');
    }
}

/**
 * Executes the Firebase password reset request.
 * @param {string} email - The email address.
 */
async function executePasswordReset(email) {
    showSpinner();
    try {
        await auth.sendPasswordResetEmail(email);
        showAuthToast('Email sent');
    } catch (error) {
        if (error.code === 'auth/user-not-found') showAuthToast('Email not found');
        else showAuthToast('Something went wrong');
    } finally {
        hideSpinner();
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
 * Sets up event listeners to clear validation errors when the user types.
 */
function setupValidationListeners() {
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('input', function () {
            clearInputErrorState(this);
        });
    });
}

/**
 * Resets validation errors for a list of inputs.
 * @param {HTMLElement[]} inputs - Array of input elements.
 */
function resetValidationErrors(inputs) {
    inputs.forEach(input => {
        clearInputErrorState(input);
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
    if (!input.value.trim()) return setInputErrorState(input, 'This field is required');
    if (input.type === 'email' && !isValidEmail(input.value)) {
        return setInputErrorState(input, 'Please enter a valid email');
    }
    if (isPasswordField(input) && input.value.length < 6) {
        return setInputErrorState(input, 'At least 6 characters');
    }
    return clearInputErrorState(input);
}

/**
 * Checks if a string is a valid email format.
 * @param {string} email - The email string.
 * @returns {boolean} True if valid.
 */
function isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
}

/**
 * Checks if an input element is a password field.
 * @param {HTMLElement} input - The input element.
 * @returns {boolean} True if it is a password field.
 */
function isPasswordField(input) {
    return input.type === 'password' || input.id === 'password' || input.id === 'confirmPassword';
}

/**
 * Sets the error styling and message for an input field.
 * @param {HTMLElement} input - The input element.
 * @param {string} message - The error message.
 * @returns {boolean} Always false.
 */
function setInputErrorState(input, message) {
    const container = input.closest('.input-container');
    if (container) container.classList.remove('error-border');
    const msgElement = document.getElementById('msg-' + input.id);
    if (container) container.classList.add('error-border');
    else input.classList.add('error-border');
    if (msgElement) {
        msgElement.innerText = message;
        msgElement.classList.remove('d-none');
    }
    return false;
}

/**
 * Clears the error styling and message for an input field.
 * @param {HTMLElement} input - The input element.
 * @returns {boolean} Always true.
 */
function clearInputErrorState(input) {
    const container = input.closest('.input-container');
    const msgElement = document.getElementById('msg-' + input.id);
    if (container) container.classList.remove('error-border');
    else input.classList.remove('error-border');
    if (msgElement) msgElement.classList.add('d-none');
    return true;
}