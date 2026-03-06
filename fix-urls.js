const fs = require('fs');
const path = require('path');

const dirs = [
    'admin/src/redux/api',
    'client/src/redux/api'
];

const helperImport = 'import { getViteServerUrl } from "../../utils/url";\n';

dirs.forEach(dir => {
    const fullDir = path.join(__dirname, dir);
    if (!fs.existsSync(fullDir)) return;

    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.api.ts'));

    files.forEach(file => {
        const filePath = path.join(fullDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Add import if missing
        if (!content.includes('getViteServerUrl')) {
            content = helperImport + content;
        }

        // Replace baseUrl block
        // Matches: baseUrl: import.meta.env.VITE_SERVER_URL ? `${import.meta.env.VITE_SERVER_URL}/path` : `/path`,
        const baseUrlRegex = /baseUrl:\s*import\.meta\.env\.VITE_SERVER_URL\s*\?\s*[`'"]\${import\.meta\.env\.VITE_SERVER_URL}(\/.*)[`'"]\s*:\s*[`'"]\/.*[`'"],/g;

        content = content.replace(baseUrlRegex, (match, pathSuffix) => {
            return `baseUrl: \`\${getViteServerUrl(import.meta.env.VITE_SERVER_URL)}${pathSuffix}\`,`;
        });

        fs.writeFileSync(filePath, content);
        console.log(`Updated ${dir}/${file}`);
    });
});
