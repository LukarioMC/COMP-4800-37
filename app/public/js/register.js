/**
 * Script for sign-up page that checks and enforces that the password and confirm password fields are the same.
 */

let pwd1 = document.getElementById('new-password');
let pwd2 = document.getElementById('confirmPassword');
let mismatchAlert = document.getElementById('passwordMismatchAlert');
let submit = document.getElementById('submit');

/**
 * Sets up key-up event handlers for the password inputs.
 */
function configPasswordConf() {
    pwd1.onkeyup = (e) => ensureMatchingPasswords();
    pwd2.onkeyup = (e) => ensureMatchingPasswords();
}

/**
 * Checks if passwords match and correspondingly adjusts warning display type and changes submit button availability.
 */
function ensureMatchingPasswords() {
    let match = pwd1.value === pwd2.value;
    submit.disabled = !match;
    mismatchAlert.style.display = match ? 'none' : 'inline';
}

configPasswordConf();
