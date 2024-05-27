/**
 * Script for sign-up page that checks and enforces that the password and confirm password fields are the same.
 */

const pwd1 = document.getElementById('new-password');
const pwd2 = document.getElementById('confirmPassword');
const mismatchAlert = document.getElementById('passwordMismatchAlert');
const submit = document.getElementById('submit');
const countryMenu = document.getElementById('country')

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


/**
 * Sets user's country selection based on their IP.
 * @param {Integer} i The index of the selected country, optional.
 * @returns undefined
 */
function setCountry(i = 0) {
    if (i !== 0) { 
        countryMenu.selectedIndex = i
        return
    }

    fetch('https://get.geojs.io/v1/ip/country.json')
    .then(res => res.json())
    .then((countryData) => {
        let i = Array.from(countryMenu.children).findIndex(opt => opt.value === countryData.country)
        if (i > -1) countryMenu.selectedIndex = i
    })
}

setCountry();
configPasswordConf();
