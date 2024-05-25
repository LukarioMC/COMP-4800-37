const fs = require('fs');

/**
 * Reads country file for country data and returns an Array of country shortcodes & their full name
 * @returns Alphabetized array of country objects (contains code & name)
 */
function readCountryData() {
    try {
        const data = fs.readFileSync('./app/modules/country-names.json', 'utf-8');
        const pairs = Object.entries(JSON.parse(data)); // Get Array of key, value entries
        const countries = pairs.map(([code, name]) => ({ code, name }))
            .sort((a, b) => a.name.localeCompare(b.name));
        return countries;
    } catch (err) {
        console.log(err);
        return [];
    }
}

/**
 * Reads country file for country data and returns an Array of country shortcodes
 * @returns Array of country codes
 */
function getCountryCodes() {
    try {
        const data = fs.readFileSync('./app/modules/country-names.json', 'utf-8');
        const pairs = Object.entries(JSON.parse(data)); // Get Array of key, value entries
        return pairs.map(([code, _]) => (code));
    } catch (err) {
        console.log(err);
        return [];
    }
}

module.exports = {
    readCountryData,
    getCountryCodes
};
