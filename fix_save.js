const fs = require('fs');
let code = fs.readFileSync('script.js', 'utf8');

const regex2 = /localStorage\.setItem\('tourista-profile-(name|email|bio|location|avatar)', (name|email|bio|loc|dataUrl)\);/g;

code = code.replace(/localStorage\.setItem\('tourista-profile-name',\s*name\);/g, "localStorage.setItem(`tourista-profile-name-${window.currentProfileUserId}`, name);");
code = code.replace(/localStorage\.setItem\('tourista-profile-email',\s*email\);/g, "localStorage.setItem(`tourista-profile-email-${window.currentProfileUserId}`, email);");
code = code.replace(/localStorage\.setItem\('tourista-profile-bio',\s*bio\);/g, "localStorage.setItem(`tourista-profile-bio-${window.currentProfileUserId}`, bio);");
code = code.replace(/localStorage\.setItem\('tourista-profile-location',\s*loc\);/g, "localStorage.setItem(`tourista-profile-location-${window.currentProfileUserId}`, loc);");
code = code.replace(/localStorage\.setItem\('tourista-profile-avatar',\s*dataUrl\);/g, "localStorage.setItem(`tourista-profile-avatar-${window.currentProfileUserId}`, dataUrl);");

fs.writeFileSync('script.js', code, 'utf8');
console.log('Saved modified logic in script.js');
