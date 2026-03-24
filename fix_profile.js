const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const regex = /function loadSavedProfile\(\) \{[\s\S]*?\}\s*loadSavedProfile\(\);/;

const replacement = `    async function loadSavedProfile() {
        try {
            const res = await apiFetch(\`\${API_BASE}/users/profile\`);
            if (res.ok) {
                const data = await res.json();
                const user = data.data;

                const savedName = user.name;
                const savedEmail = user.email;
                window.currentProfileUserId = user.id;

                const savedAvatar = localStorage.getItem(\`tourista-profile-avatar-\${user.id}\`) || localStorage.getItem('tourista-profile-avatar');
                const savedBio = localStorage.getItem(\`tourista-profile-bio-\${user.id}\`) || localStorage.getItem('tourista-profile-bio');
                const savedLoc = localStorage.getItem(\`tourista-profile-location-\${user.id}\`) || localStorage.getItem('tourista-profile-location');

                if (savedName) {
                    const nameEl = document.getElementById('settings-name');
                    const nameDisp = document.getElementById('profile-display-name');
                    if (nameEl) nameEl.value = savedName;
                    if (nameDisp) nameDisp.textContent = savedName;
                    const sidebarName = document.getElementById('sidebar-user-name');
                    if (sidebarName) sidebarName.textContent = savedName;
                }
                if (savedEmail) {
                    const emailEl = document.getElementById('settings-email');
                    const emailDisp = document.getElementById('profile-display-email');
                    if (emailEl) emailEl.value = savedEmail;
                    if (emailDisp) emailDisp.innerHTML = \`<i class="ph ph-envelope"></i> \${savedEmail}\`;
                    const sidebarEmail = document.getElementById('sidebar-user-email');
                    if (sidebarEmail) sidebarEmail.textContent = savedEmail;
                }
                if (savedAvatar) {
                    const img = document.getElementById('profile-avatar-img');
                    const sidebarImg = document.getElementById('sidebar-avatar-img');
                    if (img) img.src = savedAvatar;
                    if (sidebarImg) sidebarImg.src = savedAvatar;
                }
                if (savedBio) { const b = document.getElementById('settings-bio'); if (b) b.value = savedBio; }
                if (savedLoc) { const l = document.getElementById('settings-location'); if (l) l.value = savedLoc; }

            } else {
                console.warn('Could not fetch user profile from API, fallback to localStorage maybe.');
            }
        } catch (err) {
            console.error('Error fetching profile', err);
        }
    }
    loadSavedProfile();`;

if (regex.test(code)) {
    code = code.replace(regex, replacement);
    fs.writeFileSync('script.js', code, 'utf8');
    console.log('Successfully replaced loadSavedProfile in script.js');
} else {
    console.log('Regex did not match function loadSavedProfile');
}
