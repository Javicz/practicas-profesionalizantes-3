const fs = require('fs');
const path = require('path');

function loadConfig() {
    const configPath = path.join(__dirname, 'config.json');
    const raw = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(raw);
}

module.exports = { loadConfig };