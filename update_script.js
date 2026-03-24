const fs = require('fs');

let content = fs.readFileSync('script.js', 'utf8');

const apiBaseStr = "const API_BASE = 'http://localhost:3000/api';";
const apiFetchSnippet = `const API_BASE = 'http://localhost:3000/api';

    async function apiFetch(url, options = {}) {
        const token = localStorage.getItem('tourista-auth-token');
        const headers = { ...options.headers };
        if (token) {
            headers['Authorization'] = \`Bearer \${token}\`;
        }
        return fetch(url, { ...options, headers });
    }
`;

content = content.replace(apiBaseStr, apiFetchSnippet);
content = content.replace(/fetch\(`\$\{API_BASE\}/g, "apiFetch(`${API_BASE}");

fs.writeFileSync('script.js', content);
console.log('Script updated successfully!');
