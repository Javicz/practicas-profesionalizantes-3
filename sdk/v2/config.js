const fs = require('fs');
const path = require('path');

function loadConfig() {
    const configPath = path.join(__dirname, 'config.json');
    
    if (!fs.existsSync(configPath)) {
        console.error(`❌ ERROR: No se encuentra config.json en: ${configPath}`);
        process.exit(1);
    }
    
    try {
        const raw = fs.readFileSync(configPath, 'utf-8');
        return JSON.parse(raw);
    } catch (error) {
        console.error(`❌ ERROR al parsear config.json: ${error.message}`);
        process.exit(1);
    }
}

module.exports = { loadConfig };