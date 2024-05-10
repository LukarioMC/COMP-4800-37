const fs = require('fs');

function readCountryData(callback) {
    fs.readFile('./app/data/country-names.json', 'utf-8', (err, data) => {
        if (err) {
            console.error('Error reading country data file: ', err);
            return callback(err);
        }

        // parses json
        const countries = Object.entries(JSON.parse(data))
            // maps data to array
            .map(([code, name]) => ({ code, name }))
            // alphabetizes
            .sort((a, b) => a.name.localeCompare(b.name));

        callback(null, countries);
    });
}

module.exports = {
    readCountryData: readCountryData,
};