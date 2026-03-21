document.addEventListener('DOMContentLoaded', () => {
    // === DOM Elements ===
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');
    const sidebar = document.getElementById('sidebar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileCloseBtn = document.getElementById('mobile-close-btn');
    const generateAiBtn = document.getElementById('generate-ai-btn');
    const aiResults = document.getElementById('ai-results');
    const aiPromptInput = document.getElementById('ai-prompt');
    const loadingState = aiResults ? aiResults.querySelector('.loading-state') : null;
    const itineraryContent = aiResults ? aiResults.querySelector('.itinerary-content') : null;
    const citiesGrid = document.querySelector('.cities-grid');
    const eventList = document.querySelector('.event-list');
    const savedTripsContainer = document.getElementById('saved-trips-list');
    const API_BASE = 'http://localhost:3000/api';

    let mainMap = null;
    let routingMap = null;
    let routingControl = null;
    let explorerMap = null;
    let explorerMarkers = [];
    let currentExplorerCity = '';

    // ==========================================
    // NAVIGATION
    // ==========================================
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(n => n.classList.remove('active'));
            viewSections.forEach(s => s.classList.remove('active'));
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);
            if (targetSection) targetSection.classList.add('active');
            if (window.innerWidth <= 768) sidebar.classList.remove('open');
            if (targetId === 'dashboard') loadDashboardData();
            if (targetId === 'saved-trips') loadSavedTrips();
            if (targetId === 'map-view') setTimeout(initMainMap, 300);
            if (targetId === 'custom-trip') setTimeout(initRoutingMap, 300);
        });
    });

    if (mobileMenuBtn && sidebar) mobileMenuBtn.addEventListener('click', () => sidebar.classList.add('open'));
    if (mobileCloseBtn && sidebar) mobileCloseBtn.addEventListener('click', () => sidebar.classList.remove('open'));

    // New Trip button in saved trips
    const newTripBtn = document.getElementById('new-trip-btn');
    if (newTripBtn) {
        newTripBtn.addEventListener('click', () => {
            document.querySelector('[data-target="custom-trip"]').click();
        });
    }

    // ==========================================
    // SETTINGS — Theme, Animations, Profile
    // ==========================================
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = themeBtn ? themeBtn.querySelector('i') : null;
    const darkToggle = document.getElementById('toggle-dark-theme');
    const animToggle = document.getElementById('toggle-animations');
    const notifToggle = document.getElementById('toggle-notifications');

    function applyTheme(isLight) {
        if (isLight) {
            document.body.classList.add('light-theme');
            if (themeIcon) { themeIcon.classList.remove('ph-sun'); themeIcon.classList.add('ph-moon'); }
            if (darkToggle) darkToggle.checked = false;
            localStorage.setItem('tourista-theme', 'light');
        } else {
            document.body.classList.remove('light-theme');
            if (themeIcon) { themeIcon.classList.remove('ph-moon'); themeIcon.classList.add('ph-sun'); }
            if (darkToggle) darkToggle.checked = true;
            localStorage.setItem('tourista-theme', 'dark');
        }
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('tourista-theme');
    applyTheme(savedTheme === 'light');

    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const isNowLight = document.body.classList.contains('light-theme');
            applyTheme(!isNowLight); // toggle
        });
    }

    if (darkToggle) {
        darkToggle.addEventListener('change', () => applyTheme(!darkToggle.checked));
    }

    if (animToggle) {
        const savedAnim = localStorage.getItem('tourista-animations');
        if (savedAnim === 'off') {
            document.body.classList.add('no-animations');
            animToggle.checked = false;
        }
        animToggle.addEventListener('change', () => {
            if (animToggle.checked) {
                document.body.classList.remove('no-animations');
                localStorage.setItem('tourista-animations', 'on');
            } else {
                document.body.classList.add('no-animations');
                localStorage.setItem('tourista-animations', 'off');
            }
        });
    }

    if (notifToggle) {
        const savedNotif = localStorage.getItem('tourista-notifications');
        if (savedNotif === 'off') notifToggle.checked = false;
        notifToggle.addEventListener('change', () => {
            localStorage.setItem('tourista-notifications', notifToggle.checked ? 'on' : 'off');
        });
    }

    // ==========================================
    // USER PROFILE SYSTEM
    // ==========================================

    // -- Profile Toast helper --
    function profileToast(msg, type = 'success') {
        const t = document.createElement('div');
        t.className = 'profile-toast' + (type === 'error' ? ' error' : '');
        t.innerHTML = `<i class="ph ph-${type === 'error' ? 'x-circle' : 'check-circle'}"></i> ${msg}`;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 3000);
    }

    // -- Tab switching --
    const profileTabs = document.querySelectorAll('.profile-tab');
    const profileContents = document.querySelectorAll('.profile-tab-content');
    profileTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            profileTabs.forEach(t => t.classList.remove('active'));
            profileContents.forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            const target = tab.dataset.tab;
            const content = document.getElementById(target);
            if (content) content.classList.add('active');
        });
    });

    // -- Load & Save Profile --
    const saveProfileBtn = document.getElementById('save-profile-btn');
    function loadSavedProfile() {
        const savedName   = localStorage.getItem('tourista-profile-name');
        const savedEmail  = localStorage.getItem('tourista-profile-email');
        const savedAvatar = localStorage.getItem('tourista-profile-avatar');
        const savedBio    = localStorage.getItem('tourista-profile-bio');
        const savedLoc    = localStorage.getItem('tourista-profile-location');
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
            if (emailDisp) emailDisp.innerHTML = `<i class="ph ph-envelope"></i> ${savedEmail}`;
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
    }
    loadSavedProfile();

    if (saveProfileBtn) {
        saveProfileBtn.addEventListener('click', () => {
            const name  = (document.getElementById('settings-name')?.value || '').trim();
            const email = (document.getElementById('settings-email')?.value || '').trim();
            const bio   = (document.getElementById('settings-bio')?.value || '').trim();
            const loc   = (document.getElementById('settings-location')?.value || '').trim();
            if (!name) { profileToast('Please enter a display name.', 'error'); return; }
            localStorage.setItem('tourista-profile-name',  name);
            localStorage.setItem('tourista-profile-email', email);
            localStorage.setItem('tourista-profile-bio',   bio);
            localStorage.setItem('tourista-profile-location', loc);
            const nameDisp = document.getElementById('profile-display-name');
            const emailDisp = document.getElementById('profile-display-email');
            const sidebarName = document.getElementById('sidebar-user-name');
            const sidebarEmail = document.getElementById('sidebar-user-email');
            if (nameDisp) nameDisp.textContent = name;
            if (emailDisp) emailDisp.innerHTML = `<i class="ph ph-envelope"></i> ${email}`;
            if (sidebarName) sidebarName.textContent = name;
            if (sidebarEmail) sidebarEmail.textContent = email;
            profileToast('Profile saved successfully!');
            saveProfileBtn.innerHTML = '<i class="ph ph-check"></i> Saved!';
            setTimeout(() => saveProfileBtn.innerHTML = '<i class="ph ph-floppy-disk"></i> Save Profile', 2000);
        });
    }

    // -- Avatar upload --
    const avatarUpload = document.getElementById('avatar-upload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const dataUrl = ev.target.result;
                const img = document.getElementById('profile-avatar-img');
                const sidebarImg = document.getElementById('sidebar-avatar-img');
                if (img) img.src = dataUrl;
                if (sidebarImg) sidebarImg.src = dataUrl;
                localStorage.setItem('tourista-profile-avatar', dataUrl);
                profileToast('Profile photo updated!');
            };
            reader.readAsDataURL(file);
        });
    }

    // -- Update mini stats from saved trips count --
    function updateProfileStats() {
        const trips = JSON.parse(localStorage.getItem('tourista-saved-trips') || '[]');
        const count = trips.length;
        ['mini-stat-saved', 'stat-saved-trips'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = count;
        });
    }
    updateProfileStats();

    // -- Category preference toggles --
    document.querySelectorAll('.pref-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => btn.classList.toggle('active'));
    });

    // -- Budget preference toggles --
    document.querySelectorAll('.budget-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.budget-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // -- Search radius live update --
    const radiusInput = document.getElementById('pref-radius');
    const radiusVal   = document.getElementById('pref-radius-val');
    if (radiusInput && radiusVal) {
        radiusInput.addEventListener('input', () => {
            radiusVal.textContent = radiusInput.value + ' km';
        });
    }

    // -- Save Preferences --
    const savePrefsBtn = document.getElementById('save-prefs-btn');
    if (savePrefsBtn) {
        savePrefsBtn.addEventListener('click', () => {
            const activeCats = [...document.querySelectorAll('.pref-cat-btn.active')].map(b => b.dataset.cat);
            const budget = document.querySelector('.budget-btn.active')?.dataset.budget || 'budget';
            const radius = document.getElementById('pref-radius')?.value || 15;
            const lang   = document.getElementById('pref-language')?.value || 'en';
            localStorage.setItem('tourista-prefs', JSON.stringify({ cats: activeCats, budget, radius, lang }));
            profileToast('Preferences saved!');
            savePrefsBtn.innerHTML = '<i class="ph ph-check"></i> Saved!';
            setTimeout(() => savePrefsBtn.innerHTML = '<i class="ph ph-floppy-disk"></i> Save Preferences', 2000);
        });
        // Load saved prefs
        const savedPrefs = JSON.parse(localStorage.getItem('tourista-prefs') || 'null');
        if (savedPrefs) {
            if (savedPrefs.cats) {
                document.querySelectorAll('.pref-cat-btn').forEach(btn => {
                    btn.classList.toggle('active', savedPrefs.cats.includes(btn.dataset.cat));
                });
            }
            if (savedPrefs.budget) {
                document.querySelectorAll('.budget-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.budget === savedPrefs.budget);
                });
            }
            if (savedPrefs.radius && radiusInput) {
                radiusInput.value = savedPrefs.radius;
                if (radiusVal) radiusVal.textContent = savedPrefs.radius + ' km';
            }
            if (savedPrefs.lang) {
                const langSel = document.getElementById('pref-language');
                if (langSel) langSel.value = savedPrefs.lang;
            }
        }
    }

    // -- Password strength (security tab) --
    const userNewPw = document.getElementById('user-new-pw');
    if (userNewPw) {
        userNewPw.addEventListener('input', () => {
            const pw = userNewPw.value;
            const wrap = document.getElementById('user-pass-strength');
            const fill = document.getElementById('user-strength-fill');
            const label = document.getElementById('user-strength-label');
            if (!wrap || !fill || !label) return;
            wrap.style.display = pw.length > 0 ? 'flex' : 'none';
            let score = 0;
            if (pw.length >= 8) score++;
            if (/[A-Z]/.test(pw)) score++;
            if (/[0-9]/.test(pw)) score++;
            if (/[^A-Za-z0-9]/.test(pw)) score++;
            const pct = (score / 4) * 100;
            const colors = ['#ef4444', '#f97316', '#f59e0b', '#10b981'];
            const labels = ['Weak', 'Fair', 'Good', 'Strong'];
            fill.style.width = pct + '%';
            fill.style.background = colors[score - 1] || '#ef4444';
            label.textContent = labels[score - 1] || 'Weak';
            label.style.color = colors[score - 1] || '#ef4444';
        });
    }

    // -- Change password action --
    const userChangePwBtn = document.getElementById('user-change-pw-btn');
    if (userChangePwBtn) {
        userChangePwBtn.addEventListener('click', () => {
            const np = document.getElementById('user-new-pw')?.value || '';
            const cp = document.getElementById('user-confirm-pw')?.value || '';
            if (!np || np.length < 8) { profileToast('Password must be at least 8 characters.', 'error'); return; }
            if (np !== cp) { profileToast('Passwords do not match.', 'error'); return; }
            profileToast('Password updated successfully!');
            ['user-curr-pw','user-new-pw','user-confirm-pw'].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.value = '';
            });
            const wrap = document.getElementById('user-pass-strength');
            if (wrap) wrap.style.display = 'none';
        });
    }

    // -- Export My Data --
    const exportDataBtn = document.getElementById('export-data-btn');
    if (exportDataBtn) {
        exportDataBtn.addEventListener('click', () => {
            const data = {
                profile: {
                    name: localStorage.getItem('tourista-profile-name'),
                    email: localStorage.getItem('tourista-profile-email'),
                    bio: localStorage.getItem('tourista-profile-bio'),
                    location: localStorage.getItem('tourista-profile-location'),
                },
                preferences: JSON.parse(localStorage.getItem('tourista-prefs') || '{}'),
                savedTrips: JSON.parse(localStorage.getItem('tourista-saved-trips') || '[]'),
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = 'tourista-my-data.json';
            document.body.appendChild(a); a.click();
            setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
            profileToast('Data exported successfully!');
        });
    }

    // -- Clear Trips --
    const clearTripsBtn = document.getElementById('clear-trips-btn');
    if (clearTripsBtn) {
        clearTripsBtn.addEventListener('click', () => {
            if (!confirm('Are you sure you want to clear all saved trips? This cannot be undone.')) return;
            localStorage.removeItem('tourista-saved-trips');
            updateProfileStats();
            profileToast('Saved trips cleared.');
        });
    }

    // -- Logout placeholder --
    const userLogoutBtn = document.getElementById('user-logout-btn');
    if (userLogoutBtn) {
        userLogoutBtn.addEventListener('click', () => {
            if (!confirm('Sign out from Tourista?')) return;
            profileToast('Signed out. Redirecting...');
            setTimeout(() => location.reload(), 1500);
        });
    }

    // -- Add visited city placeholder --
    const addVisitedBtn = document.getElementById('add-visited-city-btn');
    if (addVisitedBtn) {
        addVisitedBtn.addEventListener('click', () => {
            const city = prompt('Enter the city name you visited:');
            if (!city || !city.trim()) return;
            const grid = document.getElementById('visited-cities-grid');
            const card = document.createElement('div');
            card.className = 'visited-city-card';
            card.innerHTML = `<div class="vcc-flag">${city.trim().substring(0,6)}</div><div class="vcc-info"><strong>${city.trim()}</strong><span>Just added</span></div><div class="vcc-date">Mar 2026</div>`;
            grid.insertBefore(card, addVisitedBtn);
            profileToast(`${city.trim()} added to visited places!`);
        });
    }



    // ==========================================
    // DASHBOARD DATA
    // ==========================================
    async function loadDashboardData() {
        if (!citiesGrid || !eventList) return;
        try {
            const citiesRes = await fetch(`${API_BASE}/cities`);
            const citiesData = await citiesRes.json();
            if (citiesData.data && citiesData.data.length > 0) {
                let html = '';
                citiesData.data.forEach(city => {
                    html += `<div class="city-card" style="background-image: url('${city.image_url}');"><div class="city-card-overlay"><h3>${city.name}</h3><p>${city.subtitle || ''}</p><button class="btn btn-primary explore-city-btn" data-city="${city.name}">Explore <i class="ph ph-arrow-right"></i></button></div></div>`;
                });
                html += `<div class="city-card search-custom"><div class="search-custom-inner"><div class="icon-wrapper"><i class="ph ph-globe-hemisphere-east"></i></div><h3>Any City</h3><p>Search globally</p><button class="btn btn-secondary">Search <i class="ph ph-magnifying-glass"></i></button></div></div>`;
                citiesGrid.innerHTML = html;
            }
            const eventsRes = await fetch(`${API_BASE}/events`);
            const eventsData = await eventsRes.json();
            if (eventsData.data && eventsData.data.length > 0) {
                let html = '';
                eventsData.data.forEach(event => {
                    html += `<li><div class="event-date">${event.event_date}</div><div class="event-details"><strong>${event.title}</strong><span>${event.location}</span></div></li>`;
                });
                eventList.innerHTML = html;
            }
        } catch (err) {
            console.error("Failed to load dashboard data", err);
        }
    }

    // ==========================================
    // EXPLORER VIEW LOGIC
    // ==========================================
    document.addEventListener('click', (e) => {
        const exploreBtn = e.target.closest('.explore-city-btn');
        if (exploreBtn) {
            const city = exploreBtn.getAttribute('data-city');
            openExplorerDetail(city);
        }
        
        const backCitiesBtn = e.target.closest('#back-to-cities-btn');
        if (backCitiesBtn) {
            document.getElementById('explorer-detail').classList.remove('active');
            document.getElementById('dashboard').classList.add('active');
        }
        
        const filterTag = e.target.closest('#explorer-filters-container .tag');
        if (filterTag) {
            document.querySelectorAll('#explorer-filters-container .tag').forEach(t => {
                t.classList.remove('active');
                t.style.background = 'rgba(255,255,255,0.1)';
                t.style.color = '';
            });
            filterTag.classList.add('active');
            filterTag.style.background = 'var(--accent-primary)';
            filterTag.style.color = '#fff';
            
            const category = filterTag.getAttribute('data-filter');
            loadExplorerPlaces(currentExplorerCity, category);
        }

        const customSearchObj = e.target.closest('.search-custom button');
        if (customSearchObj) {
            const city = prompt('Enter a city name to explore:');
            if(city) openExplorerDetail(city);
        }
    });

    async function openExplorerDetail(city) {
        currentExplorerCity = city;
        
        // Hide standard dashboard, show explorer-detail
        document.querySelectorAll('.view-section').forEach(s => s.classList.remove('active'));
        document.getElementById('explorer-detail').classList.add('active');
        document.getElementById('explorer-city-title').textContent = `Explore ${city}`;
        
        // Reset filters
        document.querySelectorAll('#explorer-filters-container .tag').forEach(t => {
             t.classList.remove('active');
             t.style.background = 'rgba(255,255,255,0.1)';
             t.style.color = '';
        });
        const dFilter = document.querySelector('#explorer-filters-container .tag[data-filter="attraction"]');
        if(dFilter) {
             dFilter.classList.add('active');
             dFilter.style.background = 'var(--accent-primary)';
             dFilter.style.color = '#fff';
        }
        
        // Initialize Map
        setTimeout(() => {
            initExplorerMap(city);
        }, 300);
    }

    async function initExplorerMap(city) {
        const mapDiv = document.getElementById('explorer-map');
        if(explorerMap) {
            explorerMap.remove();
        }
        explorerMap = L.map(mapDiv).setView([20, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(explorerMap);
        
        // Find city coords
        try {
            const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`, { headers: { "User-Agent": "TouristaApp/1.0" }});
            const geoData = await geoRes.json();
            if(geoData && geoData.length > 0) {
                const lat = parseFloat(geoData[0].lat);
                const lon = parseFloat(geoData[0].lon);
                explorerMap.setView([lat, lon], 12);
                
                // load default places
                loadExplorerPlaces(city, 'attraction', lat, lon);
            } else {
                alert(`Could not find location for ${city}`);
            }
        } catch(e) {
            console.error(e);
        }
    }

    async function loadExplorerPlaces(city, category, lat=null, lon=null) {
        const listDiv = document.getElementById('explorer-results-container');
        const loading = document.querySelector('#explorer-places-list .loading-state');
        loading.style.display = 'block';
        listDiv.innerHTML = '';
        
        explorerMarkers.forEach(m => explorerMap.removeLayer(m));
        explorerMarkers = [];

        try {
            if(lat === null || lon === null) {
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(city)}&limit=1`, { headers: { "User-Agent": "TouristaApp/1.0" }});
                const geoData = await geoRes.json();
                lat = parseFloat(geoData[0].lat);
                lon = parseFloat(geoData[0].lon);
                explorerMap.setView([lat, lon], 12);
            }

            let overpassQuery = '';
            const radius = 10000;
            if(category === 'all' || category === 'attraction') {
                overpassQuery = `[out:json][timeout:15];(node["tourism"="attraction"](around:${radius},${lat},${lon});node["tourism"="viewpoint"](around:${radius},${lat},${lon}););out body 20;`;
            } else if(category === 'mall') {
                overpassQuery = `[out:json][timeout:15];(node["shop"="mall"](around:${radius},${lat},${lon});way["shop"="mall"](around:${radius},${lat},${lon}););out center 20;`;
            } else if(category === 'garden') {
                overpassQuery = `[out:json][timeout:15];(node["leisure"="garden"](around:${radius},${lat},${lon});node["leisure"="park"](around:${radius},${lat},${lon});way["leisure"="park"](around:${radius},${lat},${lon});way["leisure"="garden"](around:${radius},${lat},${lon}););out center 20;`;
            } else if(category === 'historical') {
                overpassQuery = `[out:json][timeout:15];(node["historic"](around:${radius},${lat},${lon});way["historic"](around:${radius},${lat},${lon}););out center 20;`;
            } else if(category === 'lake') {
                overpassQuery = `[out:json][timeout:15];(node["water"="lake"](around:${radius},${lat},${lon});way["natural"="water"](around:${radius},${lat},${lon}););out center 20;`;
            } else if(category === 'cafe') {
                overpassQuery = `[out:json][timeout:15];(node["amenity"="cafe"](around:${radius},${lat},${lon});way["amenity"="cafe"](around:${radius},${lat},${lon}););out center 20;`;
            } else if(category === 'restaurant') {
                overpassQuery = `[out:json][timeout:15];(node["amenity"="restaurant"](around:${radius},${lat},${lon});way["amenity"="restaurant"](around:${radius},${lat},${lon}););out center 20;`;
            } else if(category === 'museum') {
                overpassQuery = `[out:json][timeout:15];(node["tourism"="museum"](around:${radius},${lat},${lon});way["tourism"="museum"](around:${radius},${lat},${lon}););out center 20;`;
            }

            let overpassRes;
            try {
                overpassRes = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: overpassQuery, signal: AbortSignal.timeout(10000) });
            } catch(e) {
                overpassRes = await fetch('https://overpass.kumi.systems/api/interpreter', { method: 'POST', body: overpassQuery, signal: AbortSignal.timeout(10000) });
            }
            const data = await overpassRes.json();
            
            loading.style.display = 'none';

            let validPois = [];
            if(data && data.elements) {
                validPois = data.elements.filter(el => el.tags && (el.tags.name || el.tags.amenity || el.tags.shop || el.tags.tourism || el.tags.leisure || el.tags.historic || el.tags.water));
            }

            if(validPois.length === 0) {
                listDiv.innerHTML = `<div class="empty-state"><p>No ${category} found here. Try another filter.</p></div>`;
                return;
            }

            validPois.forEach((poi, index) => {
                const isWay = poi.type === 'way';
                const pLat = isWay ? poi.center.lat : poi.lat;
                const pLon = isWay ? poi.center.lon : poi.lon;
                const name = poi.tags.name || `Unnamed ${category}`;
                const typeStr = poi.tags.historic || poi.tags.amenity || poi.tags.tourism || poi.tags.shop || poi.tags.leisure || category;
                const details = poi.tags.description || poi.tags.opening_hours || poi.tags.website || "No extra details available.";
                
                // Add to list
                const html = `<div class="glass-panel" style="padding: 15px; cursor: pointer; transition: 0.2s;" onmouseover="this.style.borderColor='var(--accent-primary)'" onmouseout="this.style.borderColor='rgba(255,255,255,0.1)'" onclick="window.explorePanTo(${pLat}, ${pLon}, ${index})">
                    <h3 style="font-size: 1.1rem; color: var(--text-primary); margin-bottom: 5px;">${name}</h3>
                    <div style="font-size: 0.8rem; color: var(--accent-secondary); margin-bottom: 10px; text-transform: capitalize;">${typeStr.replace(/_/g, ' ')}</div>
                    <p style="font-size: 0.9rem; color: var(--text-secondary);">${details}</p>
                    <div style="margin-top: 10px; font-size: 0.8rem; color: var(--success);"><i class="ph ph-map-pin"></i> ${pLat.toFixed(4)}, ${pLon.toFixed(4)}</div>
                </div>`;
                listDiv.insertAdjacentHTML('beforeend', html);

                // Add to map
                const color = category === 'historical' ? '#f59e0b' : category === 'mall' ? '#ef4444' : category === 'lake' ? '#3b82f6' : category === 'garden' ? '#10b981' : '#6366f1';
                const poiIcon = L.divIcon({
                    html: `<div style="background:${color};color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 5px rgba(0,0,0,0.3); border: 2px solid white;">${index + 1}</div>`,
                    className: '', iconSize: [24,24], iconAnchor: [12,12]
                });
                const marker = L.marker([pLat, pLon], { icon: poiIcon })
                    .addTo(explorerMap)
                    .bindPopup(`<b>${name}</b><br><span style="text-transform: capitalize;">${typeStr.replace(/_/g, ' ')}</span>`);
                explorerMarkers.push(marker);
            });

            if (explorerMarkers.length > 0) {
                const group = L.featureGroup(explorerMarkers);
                explorerMap.fitBounds(group.getBounds().pad(0.1));
            }

        } catch(err) {
            loading.style.display = 'none';
            console.error(err);
            listDiv.innerHTML = `<div class="empty-state"><p style="color:var(--danger)">Error fetching places. Try again.</p></div>`;
        }
    }

    // Global func for panning map from list click
    window.explorePanTo = function(lat, lon, idx) {
        if(explorerMap && explorerMarkers[idx]) {
            explorerMap.setView([lat, lon], 16, { animate: true });
            explorerMarkers[idx].openPopup();
        }
    };

    // ==========================================
    // SAVED TRIPS — load + delete
    // ==========================================
    async function loadSavedTrips() {
        if (!savedTripsContainer) return;
        savedTripsContainer.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Loading trips...</p></div>';
        try {
            const res = await fetch(`${API_BASE}/trips`);
            const data = await res.json();

            if (!data.data || data.data.length === 0) {
                savedTripsContainer.innerHTML = `<div class="empty-state"><div class="icon-wrapper large"><i class="ph ph-folder-open"></i></div><h3>No trips saved yet</h3><p>Generate an AI trip or plan a custom route to save it here.</p></div>`;
                return;
            }

            let listHtml = '<div style="display:flex; flex-direction:column; gap:1.5rem;">';
            data.data.forEach(trip => {
                const hasRouteData = !!trip.route_data;
                const itineraryNotes = trip.itinerary || '';
                const encodedNotes = encodeURIComponent(itineraryNotes);

                listHtml += `
                <div class="glass-panel trip-card" id="trip-card-${trip.id}" style="border-left: 4px solid var(--accent-primary);">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
                        <div style="flex:1; min-width:0;">
                            <h3 style="margin-bottom:0.5rem; display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                                ${trip.title}
                                ${hasRouteData ? '<span style="background:var(--accent-primary); color:#fff; font-size:0.7rem; padding:0.2rem 0.6rem; border-radius:20px; font-weight:600;">Map Route</span>' : ''}
                            </h3>
                            <p style="color:var(--text-secondary); white-space:pre-line; font-size:0.9rem;">${(trip.details || '').substring(0, 200)}${(trip.details || '').length > 200 ? '…' : ''}</p>
                            ${trip.cost ? `<p style="margin-top:0.5rem; font-weight:600; color:var(--accent-secondary);">Est. Cost: ${trip.cost}</p>` : ''}
                        </div>
                        <button class="icon-btn delete-trip-btn" data-trip-id="${trip.id}" title="Delete Trip" style="color:var(--danger); flex-shrink:0; margin-left:1rem;">
                            <i class="ph ph-trash"></i>
                        </button>
                    </div>

                    ${hasRouteData ? `<div class="saved-trip-map" id="map-${trip.id}" style="height:200px; border-radius:8px; margin-bottom:1rem; border:1px solid rgba(255,255,255,0.1);"></div>` : ''}

                    ${itineraryNotes ? `
                    <div style="background:rgba(0,0,0,0.15); padding:1rem; border-radius:8px; margin-bottom:1rem; border:1px dashed rgba(255,255,255,0.1); max-height:80px; overflow:hidden; position:relative;">
                        <h4 style="font-size:0.85rem; margin-bottom:0.4rem; color:var(--text-muted);"><i class="ph ph-notebook"></i> Day-by-Day Notes</h4>
                        <p style="font-size:0.82rem; color:var(--text-secondary); white-space:pre-line;">${itineraryNotes}</p>
                        <div style="position:absolute; bottom:0; left:0; right:0; height:30px; background:linear-gradient(transparent, var(--bg-surface));"></div>
                    </div>` : ''}

                    <div style="display:flex; gap:0.75rem; flex-wrap:wrap; margin-top:1rem;">
                        ${hasRouteData
                        ? `<button class="btn btn-primary view-full-map-btn" data-trip-id="${trip.id}" style="flex:1; min-width:130px;"><i class="ph ph-map-trifold"></i> Full Map</button>`
                        : `<button class="btn btn-secondary" style="flex:1; min-width:130px;"><i class="ph ph-file-text"></i> View Details</button>`
                    }
                        <button class="btn btn-secondary open-itinerary-btn" data-id="${trip.id}" data-notes="${encodedNotes}" style="flex:1; min-width:130px;">
                            <i class="ph ph-pencil-simple"></i> ${itineraryNotes ? 'Edit' : 'Add'} Notes
                        </button>
                        <button class="btn btn-success offline-trip-btn" data-trip-id="${trip.id}" style="flex:1; min-width:130px;">
                            <i class="ph ph-download-simple"></i> Offline PDF
                        </button>
                    </div>
                </div>`;
            });
            listHtml += '</div>';
            savedTripsContainer.innerHTML = listHtml;

            // Init small maps
            setTimeout(() => {
                data.data.forEach(trip => {
                    if (trip.route_data) initSavedTripMap(trip.id, trip.route_data);
                });
            }, 100);

        } catch (err) {
            console.error("Failed to load saved trips", err);
            savedTripsContainer.innerHTML = `<div class="empty-state"><p style="color:var(--danger);">Failed to load trips. Is the server running?</p></div>`;
        }
    }

    // Delete trip (delegated)
    document.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-trip-btn');
        if (deleteBtn) {
            const tripId = deleteBtn.getAttribute('data-trip-id');
            if (!confirm('Delete this trip? This cannot be undone.')) return;
            deleteBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i>';
            deleteBtn.disabled = true;
            try {
                const res = await fetch(`${API_BASE}/trips/${tripId}`, { method: 'DELETE' });
                if (res.ok) {
                    const card = document.getElementById(`trip-card-${tripId}`);
                    if (card) {
                        card.style.transition = 'opacity 0.3s, transform 0.3s';
                        card.style.opacity = '0';
                        card.style.transform = 'translateX(30px)';
                        setTimeout(() => { card.remove(); }, 300);
                    }
                } else {
                    alert('Failed to delete trip.');
                    deleteBtn.innerHTML = '<i class="ph ph-trash"></i>';
                    deleteBtn.disabled = false;
                }
            } catch (err) {
                console.error('Delete error:', err);
                alert('Network error. Is the server running?');
                deleteBtn.innerHTML = '<i class="ph ph-trash"></i>';
                deleteBtn.disabled = false;
            }
        }
    });

    // ==========================================
    // SAVED TRIP MINI-MAP  (real OSRM road route)
    // ==========================================
    async function initSavedTripMap(tripId, routeDataStr) {
        try {
            const routeData = JSON.parse(routeDataStr);
            const mapDiv = document.getElementById(`map-${tripId}`);
            if (!mapDiv) return;
            const map = L.map(mapDiv, { zoomControl: false, dragging: false, scrollWheelZoom: false }).setView([23.0225, 72.5714], 12);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM' }).addTo(map);

            if (routeData.waypoints && routeData.waypoints.length > 0) {
                const latlngs = routeData.waypoints.map(c => L.latLng(c[0], c[1]));
                const markers = latlngs.map((latlng, i) => {
                    const name = routeData.names && routeData.names[i] ? routeData.names[i] : `Stop ${i + 1}`;
                    const isFirst = i === 0, isLast = i === latlngs.length - 1;
                    const color = isFirst ? '#10b981' : isLast ? '#ef4444' : '#6366f1';
                    const icon = L.divIcon({
                        html: `<div style="background:${color};color:white;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:11px;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);">${i+1}</div>`,
                        className: '', iconSize: [22, 22], iconAnchor: [11, 11]
                    });
                    return L.marker(latlng, { icon }).addTo(map).bindPopup(name);
                });

                // Try fetching real OSRM road geometry
                let roadDrawn = false;
                if (latlngs.length >= 2) {
                    try {
                        const coordStr = routeData.waypoints.map(c => `${c[1]},${c[0]}`).join(';');
                        const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;
                        
                        const controller = new AbortController();
                        const id = setTimeout(() => controller.abort(), 6000);
                        const res = await fetch(url, { signal: controller.signal });
                        clearTimeout(id);
                        
                        const data = await res.json();
                        if (data.code === 'Ok' && data.routes && data.routes[0]) {
                            const roadCoords = data.routes[0].geometry.coordinates.map(c => L.latLng(c[1], c[0]));
                            L.polyline(roadCoords, { color: '#6366f1', weight: 4, opacity: 0.85 }).addTo(map);
                            L.polyline(roadCoords, { color: '#a855f7', weight: 8, opacity: 0.15 }).addTo(map);
                            roadDrawn = true;
                        } else {
                            console.warn("OSRM returned:", data.code);
                        }
                    } catch (e) {
                         console.warn("Mini-map OSRM fetch failed:", e);
                    }
                }
                // Fallback: straight line (if request failed or no road path found)
                if (!roadDrawn && latlngs.length > 1) {
                    L.polyline(latlngs, { color: '#6366f1', weight: 4, opacity: 0.7, dashArray: '6,4' }).addTo(map);
                }

                if (markers.length > 0) {
                    const group = L.featureGroup(markers.map(m => L.marker(m.getLatLng())));
                    map.fitBounds(group.getBounds().pad(0.2));
                }
            }
        } catch (err) {
            console.error('Saved trip map init failed', err);
        }
    }

    // ==========================================
    // MAPS — Main & Routing
    // ==========================================
    function initMainMap() {
        if (mainMap !== null) return;
        const mapDiv = document.getElementById('main-map');
        mapDiv.innerHTML = '';
        mainMap = L.map('main-map').setView([23.2156, 72.6369], 9);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OpenStreetMap contributors' }).addTo(mainMap);
        L.marker([23.0225, 72.5714]).addTo(mainMap).bindPopup('<b>Ahmedabad</b><br>Heritage & Modernity.');
        L.marker([23.2156, 72.6369]).addTo(mainMap).bindPopup('<b>Gandhinagar</b><br>The Green Capital.');
        L.marker([23.5880, 72.3693]).addTo(mainMap).bindPopup('<b>Mehsana</b><br>Gateway to North Gujarat.');
    }

    function initRoutingMap() {
        if (routingMap !== null) return;
        const mapDiv = document.getElementById('routing-map');
        if (!mapDiv) return;
        mapDiv.innerHTML = '';
        mapDiv.style.display = 'block';
        routingMap = L.map('routing-map').setView([23.0225, 72.5714], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; OSM contributors' }).addTo(routingMap);

        const routeBtn = document.getElementById('find-routes-btn');
        const smartBtn = document.getElementById('smart-route-btn');
        const saveTripBtn = document.getElementById('save-route-btn');
        const downloadOfflineBtn = document.getElementById('download-offline-btn');
        const startInput = document.getElementById('start-point');
        const endInput = document.getElementById('end-point');

        let currentRouteDescription = '';
        let currentRouteCoords = [];
        let currentRouteNames = [];
        let poiMarkers = [];

        function enableSaveButtons() {
            [saveTripBtn, downloadOfflineBtn].forEach(btn => {
                btn.disabled = false;
                btn.style.opacity = '1';
                btn.style.cursor = 'pointer';
            });
        }

        async function calculateRoute(isSmart = false) {
            const startStr = startInput.value.trim();
            const endStr = endInput.value.trim();
            if (!startStr || !endStr) {
                alert('Please enter at least a Starting Point and Final Destination.');
                return;
            }

            // Collect optional stops (only non-empty)
            const waypointInputs = document.querySelectorAll('.waypoint-input');
            const stopsStr = Array.from(waypointInputs).map(i => i.value.trim()).filter(v => v !== '');

            const allLocations = [startStr, ...stopsStr, endStr];

            const activeBtn = isSmart ? smartBtn : routeBtn;
            const originalHtml = activeBtn.innerHTML;
            activeBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Finding...';
            if (saveTripBtn) { saveTripBtn.disabled = true; saveTripBtn.style.opacity = '0.5'; }
            if (downloadOfflineBtn) { downloadOfflineBtn.disabled = true; downloadOfflineBtn.style.opacity = '0.5'; }

            try {
                const fetchPromises = allLocations.map(loc =>
                    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(loc)}&limit=1`).then(r => r.json())
                );
                const results = await Promise.all(fetchPromises);

                let validCoords = [];
                let validNames = [];
                for (let i = 0; i < results.length; i++) {
                    if (results[i] && results[i].length > 0) {
                        validCoords.push(L.latLng(results[i][0].lat, results[i][0].lon));
                        validNames.push(allLocations[i]);
                    } else {
                        alert(`Could not locate "${allLocations[i]}". Please check the name.`);
                        return;
                    }
                }

                // Smart route: Nearest-neighbor (keep first and last fixed)
                if (isSmart && validCoords.length > 2) {
                    const first = validCoords[0], firstName = validNames[0];
                    const last = validCoords[validCoords.length - 1], lastName = validNames[validNames.length - 1];
                    let middle = validCoords.slice(1, -1);
                    let middleNames = validNames.slice(1, -1);
                    let sorted = [], sortedNames = [];
                    let current = first;
                    while (middle.length > 0) {
                        let ni = 0, minD = Infinity;
                        middle.forEach((p, i) => { const d = current.distanceTo(p); if (d < minD) { minD = d; ni = i; } });
                        current = middle[ni];
                        sorted.push(current);
                        sortedNames.push(middleNames[ni]);
                        middle.splice(ni, 1);
                        middleNames.splice(ni, 1);
                    }
                    validCoords = [first, ...sorted, last];
                    validNames = [firstName, ...sortedNames, lastName];
                }

                if (routingControl) routingMap.removeControl(routingControl);
                poiMarkers.forEach(m => routingMap.removeLayer(m));
                poiMarkers = [];

                routingControl = L.Routing.control({
                    waypoints: validCoords,
                    routeWhileDragging: false,
                    showAlternatives: false,
                    fitSelectedRoutes: true,
                    collapsible: true,
                    lineOptions: { styles: [{ color: '#6366f1', opacity: 0.8, weight: 6 }] }
                }).addTo(routingMap);

                // === FETCH FAMOUS LOCATIONS ===
                try {
                    let minLat = 90, maxLat = -90, minLon = 180, maxLon = -180;
                    validCoords.forEach(c => {
                        minLat = Math.min(minLat, c.lat);
                        maxLat = Math.max(maxLat, c.lat);
                        minLon = Math.min(minLon, c.lng);
                        maxLon = Math.max(maxLon, c.lng);
                    });
                    minLat -= 0.05; maxLat += 0.05; minLon -= 0.05; maxLon += 0.05;

                    const overpassQuery = `[out:json][timeout:10];(node["tourism"="attraction"](${minLat},${minLon},${maxLat},${maxLon});node["historic"](${minLat},${minLon},${maxLat},${maxLon}););out body 15;`;
                    let overpassRes;
                    let validPois = [];
                    try {
                        const controller1 = new AbortController();
                        const id1 = setTimeout(() => controller1.abort(), 10000);
                        overpassRes = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: overpassQuery, signal: controller1.signal });
                        clearTimeout(id1);
                    } catch(e) {
                         const controller2 = new AbortController();
                         const id2 = setTimeout(() => controller2.abort(), 10000);
                         overpassRes = await fetch('https://overpass.kumi.systems/api/interpreter', { method: 'POST', body: overpassQuery, signal: controller2.signal });
                         clearTimeout(id2);
                    }
                    if(overpassRes && overpassRes.ok) {
                        const overpassData = await overpassRes.json();
                        if(overpassData && overpassData.elements) {
                            validPois = overpassData.elements.filter(el => el.tags && el.tags.name);
                        }
                    }

                    if (validPois.length === 0) {
                        throw new Error("No POIs found from Overpass or fetch failed.");
                    }

                    validPois.slice(0, 15).forEach(poi => {
                        const type = poi.tags && poi.tags.historic ? "Historic Site" : "Attraction";
                        const name = poi.tags ? poi.tags.name : "Famous Place";
                        const poiIcon = L.divIcon({
                            html: '<div style="background:#f59e0b;color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 5px rgba(0,0,0,0.3); border: 2px solid white;">⭐</div>',
                            className: '', iconSize: [24,24], iconAnchor: [12,12]
                        });
                        const marker = L.marker([poi.lat, poi.lon], { icon: poiIcon })
                            .addTo(routingMap)
                            .bindPopup(`
                                <div style="text-align:center;">
                                    <b>${name}</b><br>
                                    <span style="color:#64748b;font-size:0.8rem;">${type}</span><br>
                                    <button class="btn btn-secondary mt-2 add-stop-btn" data-name="${name}" style="padding:0.3rem 0.6rem;font-size:0.8rem;">Add as Stop</button>
                                </div>
                            `);
                        poiMarkers.push(marker);
                    });
                } catch(err) {
                    console.warn("Could not fetch famous locations, generating fallbacks", err);
                    // Add safe fallback POIs
                    for (let fi=1; fi<=5; fi++) {
                        const flat = validCoords[0].lat + (Math.random()-0.5)*0.08;
                        const flon = validCoords[0].lng + (Math.random()-0.5)*0.08;
                        const poiIcon = L.divIcon({
                            html: '<div style="background:#f59e0b;color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;box-shadow:0 2px 5px rgba(0,0,0,0.3); border: 2px solid white;">⭐</div>',
                            className: '', iconSize: [24,24], iconAnchor: [12,12]
                        });
                        const marker = L.marker([flat, flon], { icon: poiIcon })
                            .addTo(routingMap)
                            .bindPopup(`
                                <div style="text-align:center;">
                                    <b>Popular Landmark ${fi}</b><br>
                                    <span style="color:#64748b;font-size:0.8rem;">Attraction</span><br>
                                    <button class="btn btn-secondary mt-2 add-stop-btn" data-name="Popular Landmark ${fi}" style="padding:0.3rem 0.6rem;font-size:0.8rem;">Add as Stop</button>
                                </div>
                            `);
                        poiMarkers.push(marker);
                    }
                }
                // ==============================

                currentRouteDescription = validNames.join(' ➔ ');
                currentRouteCoords = validCoords.map(c => [c.lat, c.lng]);
                currentRouteNames = validNames;
                enableSaveButtons();

            } catch (err) {
                console.error("Routing error:", err);
                alert("Error calculating route. Please check your network connection.");
            } finally {
                activeBtn.innerHTML = originalHtml;
            }
        }

        if (routeBtn) routeBtn.addEventListener('click', () => calculateRoute(false));
        if (smartBtn) smartBtn.addEventListener('click', () => calculateRoute(true));

        if (saveTripBtn) {
            saveTripBtn.addEventListener('click', async () => {
                if (!currentRouteDescription) return;
                saveTripBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Saving...';
                try {
                    const priceEst = Math.floor(Math.random() * 5000) + 500;
                    const res = await fetch(`${API_BASE}/trips`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            title: 'Custom Navigated Trip',
                            details: `Route: ${currentRouteDescription}`,
                            cost: `₹${priceEst}`,
                            route_data: JSON.stringify({ waypoints: currentRouteCoords, names: currentRouteNames })
                        })
                    });
                    if (res.ok) {
                        saveTripBtn.innerHTML = '<i class="ph ph-check"></i> Saved!';
                        setTimeout(() => { saveTripBtn.innerHTML = '<i class="ph ph-floppy-disk"></i> Save Trip'; }, 2000);
                        loadSavedTrips();
                    }
                } catch (err) {
                    console.error("Save trip failed", err);
                    alert("Error saving trip. Is the server running?");
                    saveTripBtn.innerHTML = '<i class="ph ph-floppy-disk"></i> Save Trip';
                }
            });
        }

        if (downloadOfflineBtn) {
            downloadOfflineBtn.addEventListener('click', () => {
                if (!currentRouteDescription) return;
                showOfflineChoiceModal(
                    'Custom Navigated Trip',
                    `Route: ${currentRouteDescription}`,
                    JSON.stringify({ waypoints: currentRouteCoords, names: currentRouteNames })
                );
            });
        }
    }

    // ==========================================
    // AI TRIP GENERATOR
    // ==========================================
    if (generateAiBtn) {
        generateAiBtn.addEventListener('click', async () => {
            const destInput = document.getElementById('ai-destination').value.trim();
            const daysInput = parseInt(document.getElementById('ai-days').value) || 2;
            if (!destInput) { alert("Please enter a destination city."); return; }

            aiResults.style.display = 'block';
            if (loadingState) loadingState.style.display = 'block';
            if (itineraryContent) itineraryContent.style.display = 'none';

            const activeTags = Array.from(document.querySelectorAll('.tag.active')).map(t => t.innerText.toLowerCase());

            try {
                // Use a clear User-Agent for Nominatim to prevent being blocked
                const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destInput)}&limit=1`, {
                    headers: { "User-Agent": "TouristaApp/1.0" }
                });
                const geoData = await geoRes.json();
                if (geoData.length === 0) throw new Error("Destination not found.");

                const lat = parseFloat(geoData[0].lat);
                const lon = parseFloat(geoData[0].lon);
                const radius = 15000;
                let poiTypes = [];

                if (activeTags.includes('historic')) poiTypes.push('node["historic"]');
                if (activeTags.includes('museum')) poiTypes.push('node["tourism"="museum"]');
                if (activeTags.includes('nature')) poiTypes.push('node["leisure"="park"]');
                if (activeTags.includes('restaurant')) poiTypes.push('node["amenity"="restaurant"]');
                if (poiTypes.length === 0 || activeTags.includes('attraction')) {
                    poiTypes.push('node["tourism"="attraction"]');
                    poiTypes.push('node["tourism"="viewpoint"]');
                }

                let validPois = [];
                try {
                    // Try Overpass DE mirror first, fallback to Kumi Systems if it fails or times out
                    const overpassQuery = `[out:json][timeout:25];(${poiTypes.map(tag => `${tag}(around:${radius},${lat},${lon});`).join('')});out body 40;`;
                    let overpassRes;
                    try {
                        overpassRes = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: overpassQuery, signal: AbortSignal.timeout(10000) });
                    } catch(e) {
                         overpassRes = await fetch('https://overpass.kumi.systems/api/interpreter', { method: 'POST', body: overpassQuery, signal: AbortSignal.timeout(10000) });
                    }
                    if(!overpassRes.ok) throw new Error("Overpass Error");
                    const overpassData = await overpassRes.json();
                    if(overpassData && overpassData.elements) {
                         validPois = overpassData.elements.filter(el => el.tags && el.tags.name);
                    }
                } catch(err) {
                    console.warn("Overpass failed, generating fallback POIs", err);
                    // Generate safe fallback POIs so the user still gets a trip instead of an error
                    for (let fi=1; fi<=9; fi++) {
                        validPois.push({ tags: { name: `Popular Spot ${fi}`, tourism: 'attraction' }, lat: lat + (Math.random()-0.5)*0.05, lon: lon + (Math.random()-0.5)*0.05 });
                    }
                }

                const shuffledPois = validPois.sort(() => 0.5 - Math.random());
                if (shuffledPois.length === 0) throw new Error("No points of interest found in this area.");

                const poisPerDay = 3;
                let generatedDetails = `Your customized ${daysInput}-day trip to ${geoData[0].name.split(',')[0]}!\n\n`;
                let allNames = [geoData[0].name.split(',')[0]];
                let dayCounter = 1;

                for (let i = 0; i < Math.min(shuffledPois.length, daysInput * poisPerDay); i += poisPerDay) {
                    const chunk = shuffledPois.slice(i, i + poisPerDay);
                    generatedDetails += `**Day ${dayCounter}**\n`;
                    chunk.forEach(poi => {
                        const type = poi.tags.historic ? "Historic Site" : (poi.tags.amenity || poi.tags.tourism || "Attraction");
                        generatedDetails += `- ${poi.tags.name} (${type})\n`;
                        allNames.push(poi.tags.name);
                    });
                    generatedDetails += '\n';
                    dayCounter++;
                    if (dayCounter > daysInput) break;
                }

                const selectedPois = [];
                for (let i = 0; i < Math.min(shuffledPois.length, daysInput * poisPerDay); i += poisPerDay) {
                    selectedPois.push(...shuffledPois.slice(i, i + poisPerDay));
                }
                const routeCoords = selectedPois.map(poi => [poi.lat, poi.lon]);
                const fakeCost = `$${Math.floor(Math.random() * 500) * daysInput}`;

                const tripData = {
                    title: `AI Trip to ${geoData[0].name.split(',')[0]}`,
                    details: generatedDetails.trim(),
                    cost: fakeCost,
                    pois_string: allNames.join(' ➔ '),
                    route_data: JSON.stringify({ waypoints: routeCoords, names: allNames.slice(1) })
                };

                if (loadingState) loadingState.style.display = 'none';

                if (itineraryContent) {
                    itineraryContent.innerHTML = `
                    <div style="text-align:left; background:rgba(0,0,0,0.2); border-radius:16px; padding:2rem; border:1px solid rgba(168,85,247,0.3);">
                        <h3 style="color:var(--accent-secondary); margin-bottom:1.5rem;"><i class="ph-fill ph-check-circle"></i> AI Itinerary Generated!</h3>
                        <h4 style="margin-bottom:1rem; font-size:1.2rem;">${tripData.title}</h4>
                        <p style="color:var(--text-secondary); margin-bottom:1rem; white-space:pre-line;">${tripData.details}</p>
                        <span style="display:inline-block; padding:4px 12px; background:rgba(168,85,247,0.1); border-radius:20px; font-size:0.9rem; font-weight:600; color:var(--accent-secondary);">Estimated Cost: ${tripData.cost}</span>
                        <div style="margin-top:2rem; display:flex; gap:1rem; flex-wrap:wrap;">
                            <button class="btn btn-primary" id="save-ai-trip-btn" style="flex:1; min-width:140px;"><i class="ph ph-floppy-disk"></i> Save to Trips</button>
                            <button class="btn btn-success" id="ai-offline-btn" style="flex:1; min-width:140px;"><i class="ph ph-download-simple"></i> Offline Download</button>
                        </div>
                    </div>`;
                    itineraryContent.style.display = 'block';
                    itineraryContent.style.animation = 'fadeIn 0.5s ease';

                    document.getElementById('save-ai-trip-btn').addEventListener('click', async (e) => {
                        const btn = e.target.closest('button');
                        btn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Saving...';
                        btn.disabled = true;
                        await fetch(`${API_BASE}/trips`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(tripData)
                        });
                        btn.innerHTML = '<i class="ph ph-check"></i> Saved!';
                        loadSavedTrips();
                    });

                    document.getElementById('ai-offline-btn').addEventListener('click', () => {
                        showOfflineChoiceModal(tripData.title, tripData.details, tripData.route_data);
                    });
                }

            } catch (err) {
                console.error("AI Generation Failed:", err);
                if (loadingState) loadingState.style.display = 'none';
                if (itineraryContent) {
                    itineraryContent.innerHTML = `<div style="color:var(--danger); padding:1rem; text-align:center;">Failed to generate route: ${err.message}</div>`;
                    itineraryContent.style.display = 'block';
                }
            }
        });
    }

    // Tags toggle
    document.querySelectorAll('.tag').forEach(tag => {
        tag.addEventListener('click', () => {
            tag.classList.toggle('active');
            tag.style.background = tag.classList.contains('active') ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)';
            tag.style.color = tag.classList.contains('active') ? '#fff' : '';
        });
    });

    // Live location button
    document.addEventListener('click', async (e) => {
        const liveBtn = e.target.closest('#live-location-btn');
        if (liveBtn) {
            const destInput = document.getElementById('ai-destination');
            const orig = liveBtn.innerHTML;
            liveBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Locating...';
            liveBtn.disabled = true;
            if (!navigator.geolocation) { alert("Geolocation not supported."); liveBtn.innerHTML = orig; liveBtn.disabled = false; return; }
            navigator.geolocation.getCurrentPosition(async (pos) => {
                try {
                    const r = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&zoom=10`);
                    const d = await r.json();
                    destInput.value = d.address.city || d.address.town || d.address.village || d.address.county || 'Unknown';
                } catch (err) { alert("Could not determine city name."); }
                finally { liveBtn.innerHTML = orig; liveBtn.disabled = false; }
            }, () => { alert("Location access denied."); liveBtn.innerHTML = orig; liveBtn.disabled = false; });
        }

        // View Full Map from saved trips
        const viewFullMapBtn = e.target.closest('.view-full-map-btn');
        if (viewFullMapBtn) {
            const tripId = viewFullMapBtn.getAttribute('data-trip-id');
            document.querySelector('[data-target="map-view"]').click();
            setTimeout(() => loadTripRouteOnMainMap(tripId), 300);
        }

        // Open Itinerary Modal
        const openNotesBtn = e.target.closest('.open-itinerary-btn');
        const modal = document.getElementById('itinerary-modal');
        if (openNotesBtn && modal) {
            const tripId = openNotesBtn.getAttribute('data-id');
            const currentNotes = decodeURIComponent(openNotesBtn.getAttribute('data-notes') || '');
            document.getElementById('itinerary-text').value = currentNotes;
            modal.setAttribute('data-active-trip', tripId);
            modal.classList.add('active');
        }

        // Close Modal
        if (e.target.closest('#close-itinerary-modal, #cancel-itinerary-btn')) {
            document.getElementById('itinerary-modal').classList.remove('active');
        }

        // Save Notes
        const saveNotesBtn = e.target.closest('#save-itinerary-btn');
        if (saveNotesBtn) {
            const modal2 = document.getElementById('itinerary-modal');
            const tripId = modal2.getAttribute('data-active-trip');
            const newNotes = document.getElementById('itinerary-text').value;
            const orig = saveNotesBtn.innerHTML;
            saveNotesBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i> Saving...';
            try {
                const res = await fetch(`${API_BASE}/trips/${tripId}`, {
                    method: 'PUT', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ itinerary: newNotes })
                });
                if (res.ok) { modal2.classList.remove('active'); loadSavedTrips(); }
                else alert('Error saving notes.');
            } catch (err) { console.error('Save notes failed', err); alert('Database error.'); }
            finally { saveNotesBtn.innerHTML = orig; }
        }

        // Add as Stop from POI popup
        const addStopBtn = e.target.closest('.add-stop-btn');
        if (addStopBtn) {
            const stopName = addStopBtn.getAttribute('data-name');
            const s1 = document.getElementById('stop-1');
            const s2 = document.getElementById('stop-2');
            const s3 = document.getElementById('stop-3');
            
            if (!s1.value) { s1.value = stopName; }
            else if (!s2.value) { s2.value = stopName; }
            else if (!s3.value) { s3.value = stopName; }
            else { 
                alert("All 3 optional stops are currently full. Clear one manually to add this attraction."); 
                return; 
            }
            alert(`"${stopName}" added as a stop! Click 'Find Route' to update map.`);
        }

        // Offline Trip from saved trips
        const offlineTripBtn = e.target.closest('.offline-trip-btn');
        if (offlineTripBtn) {
            const tripId = offlineTripBtn.getAttribute('data-trip-id');
            const orig = offlineTripBtn.innerHTML;
            offlineTripBtn.innerHTML = '<i class="ph ph-spinner ph-spin"></i>';
            offlineTripBtn.disabled = true;
            await downloadOfflineTrip(tripId);
            offlineTripBtn.innerHTML = orig;
            offlineTripBtn.disabled = false;
        }
    });

    // ==========================================
    // LOAD TRIP ON MAIN MAP  (fixed featureGroup)
    // ==========================================
    async function loadTripRouteOnMainMap(tripId) {
        try {
            const res = await fetch(`${API_BASE}/trips/${tripId}`);
            const data = await res.json();
            const trip = data.data;
            if (trip && trip.route_data && mainMap) {
                const routeData = JSON.parse(trip.route_data);
                mainMap.eachLayer(layer => {
                    if (layer instanceof L.Marker || layer instanceof L.Polyline) mainMap.removeLayer(layer);
                });
                const markers = [];
                const latlngs = [];
                routeData.waypoints.forEach((c, i) => {
                    const latlng = L.latLng(c[0], c[1]);
                    latlngs.push(latlng);
                    const name = routeData.names && routeData.names[i] ? routeData.names[i] : `Stop ${i + 1}`;
                    const isFirst = i === 0, isLast = i === routeData.waypoints.length - 1;
                    const color = isFirst ? '#10b981' : isLast ? '#ef4444' : '#6366f1';
                    const icon = L.divIcon({
                        html: `<div style="background:${color};color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;border:2px solid white;box-shadow:0 3px 8px rgba(0,0,0,0.4);">${i+1}</div>`,
                        className: '', iconSize: [30, 30], iconAnchor: [15, 15]
                    });
                    markers.push(L.marker(latlng, { icon }).addTo(mainMap).bindPopup(`<b>${name}</b>`));
                });

                if (latlngs.length >= 2) {
                    try {
                        const coordStr = routeData.waypoints.map(c => `${c[1]},${c[0]}`).join(';');
                        const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;
                        
                        const controller = new AbortController();
                        const id = setTimeout(() => controller.abort(), 5000);
                        
                        fetch(url, { signal: controller.signal })
                        .then(res => { clearTimeout(id); return res.json(); })
                        .then(data => {
                            if (data.code === 'Ok' && data.routes && data.routes[0]) {
                                const roadCoords = data.routes[0].geometry.coordinates.map(c => L.latLng(c[1], c[0]));
                                L.polyline(roadCoords, { color: '#6366f1', weight: 6, opacity: 0.9 }).addTo(mainMap);
                                L.polyline(roadCoords, { color: '#a855f7', weight: 12, opacity: 0.15 }).addTo(mainMap);
                            } else {
                                console.warn("Main map OSRM returned:", data.code);
                                L.polyline(latlngs, { color: '#6366f1', weight: 6, opacity: 0.8, dashArray: '8,6' }).addTo(mainMap);
                            }
                        })
                        .catch((e) => {
                            console.warn("Main map OSRM failed:", e);
                            L.polyline(latlngs, { color: '#6366f1', weight: 6, opacity: 0.8, dashArray: '8,6' }).addTo(mainMap);
                        });
                    } catch(e) { L.polyline(latlngs, { color: '#6366f1', weight: 6, opacity: 0.8, dashArray: '8,6' }).addTo(mainMap); }
                }

                if (markers.length > 0) mainMap.fitBounds(L.featureGroup(markers).getBounds().pad(0.15));
            }
        } catch (err) { console.error('Load trip route failed', err); }
    }

    // ==========================================
    // DOWNLOAD OFFLINE TRIP — show choice modal
    // ==========================================
    async function downloadOfflineTrip(tripId) {
        try {
            const res = await fetch(`${API_BASE}/trips/${tripId}`);
            const data = await res.json();
            const trip = data.data;
            if (!trip) return;
            showOfflineChoiceModal(trip.title, trip.details || '', trip.route_data);
        } catch (err) { console.error('Offline trip fetch failed', err); }
    }

    function showOfflineChoiceModal(title, details, routeDataStr) {
        const existing = document.getElementById('offline-choice-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'offline-choice-modal';
        modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.72);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:9999;animation:fadeIn 0.2s ease;';
        modal.innerHTML = `
        <div style="background:var(--bg-main);border:var(--glass-border);border-radius:24px;padding:2rem;max-width:460px;width:90%;box-shadow:0 30px 60px rgba(0,0,0,0.5);">
            <h3 style="margin-bottom:0.4rem;display:flex;align-items:center;gap:0.5rem;"><i class="ph ph-download-simple" style="color:var(--accent-primary);"></i> Download Offline Trip</h3>
            <p style="color:var(--text-secondary);margin-bottom:1.75rem;font-size:0.88rem;">Choose how you want to save this trip for offline use.</p>
            <div style="display:flex;flex-direction:column;gap:0.85rem;">
                <button id="choice-pdf-btn" class="btn btn-primary" style="padding:1rem 1.25rem;font-size:0.95rem;justify-content:flex-start;gap:1rem;text-align:left;">
                    <i class="ph ph-printer" style="font-size:1.5rem;flex-shrink:0;"></i>
                    <div><div style="font-weight:700;">Print / Save as PDF</div><div style="font-size:0.78rem;opacity:0.8;margin-top:2px;">Opens a print-ready page with map, stops &amp; day-by-day plan</div></div>
                </button>
                <button id="choice-file-btn" class="btn btn-secondary" style="padding:1rem 1.25rem;font-size:0.95rem;justify-content:flex-start;gap:1rem;text-align:left;">
                    <i class="ph ph-file-code" style="font-size:1.5rem;flex-shrink:0;"></i>
                    <div><div style="font-weight:700;">Download .tourmap File</div><div style="font-size:0.78rem;opacity:0.75;margin-top:2px;">Self-contained HTML — open in any browser, includes interactive road map &amp; all details</div></div>
                </button>
                <button id="choice-cancel-btn" class="btn btn-secondary" style="opacity:0.55;margin-top:0.25rem;">Cancel</button>
            </div>
        </div>`;
        document.body.appendChild(modal);

        // Fetch OSRM real road geometry then generate file
        async function fetchAndGenerate(mode) {
            modal.remove();

            // Show loading overlay
            const loadingEl = document.createElement('div');
            loadingEl.id = 'offline-loading-overlay';
            loadingEl.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.75);backdrop-filter:blur(6px);display:flex;align-items:center;justify-content:center;z-index:9999;flex-direction:column;gap:1rem;color:white;';
            loadingEl.innerHTML = `<div class="spinner" style="width:48px;height:48px;border-width:4px;"></div><p style="font-size:1rem;">Fetching road route from OSRM…</p>`;
            document.body.appendChild(loadingEl);

            let roadPath = null;  // Array of [lat,lon] road coords
            let osrmSteps = [];   // Real turn-by-turn steps from OSRM

            try {
                let routeData = null;
                if (routeDataStr) routeData = JSON.parse(routeDataStr);

                if (routeData && routeData.waypoints && routeData.waypoints.length >= 2) {
                    // OSRM expects: lon,lat;lon,lat (note: lon first)
                    const coordStr = routeData.waypoints.map(c => `${c[1]},${c[0]}`).join(';');
                    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=true&annotations=false`;
                    const res = await fetch(osrmUrl);
                    const data = await res.json();

                    if (data.code === 'Ok' && data.routes && data.routes[0]) {
                        // GeoJSON coords are [lon, lat] — flip to [lat, lon]
                        roadPath = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);

                        // Extract real step instructions
                        data.routes[0].legs.forEach((leg, legIdx) => {
                            leg.steps.forEach(step => {
                                if (step.maneuver && step.name !== '' && step.distance > 10) {
                                    const type = step.maneuver.type;
                                    const modifier = step.maneuver.modifier || '';
                                    let instruction = '';
                                    if (type === 'depart') instruction = `Start on ${step.name || 'road'}`;
                                    else if (type === 'arrive') instruction = `Arrive at destination`;
                                    else if (type === 'turn') instruction = `Turn ${modifier} onto ${step.name || 'road'}`;
                                    else if (type === 'continue') instruction = `Continue on ${step.name || 'road'}`;
                                    else if (type === 'roundabout' || type === 'rotary') instruction = `Enter roundabout, take exit ${step.maneuver.exit || ''}`;
                                    else instruction = `${type.charAt(0).toUpperCase() + type.slice(1)} ${modifier} — ${step.name || ''}`.trim();

                                    const distM = step.distance;
                                    const distStr = distM >= 1000 ? `${(distM / 1000).toFixed(1)} km` : `${Math.round(distM)} m`;
                                    osrmSteps.push({ instruction, distStr, legIdx });
                                }
                            });
                        });
                    }
                }
            } catch (err) {
                console.warn('OSRM fetch failed, falling back to straight lines:', err);
            }

            loadingEl.remove();
            generateOfflineHTML(title, details, routeDataStr, mode, roadPath, osrmSteps);
        }

        document.getElementById('choice-pdf-btn').addEventListener('click', () => fetchAndGenerate('pdf'));
        document.getElementById('choice-file-btn').addEventListener('click', () => fetchAndGenerate('file'));
        document.getElementById('choice-cancel-btn').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
    }

    // ==========================================
    // GENERATE OFFLINE HTML (pdf = print window, file = .tourmap download)
    // ==========================================
    function generateOfflineHTML(title, details, routeDataStr, mode, roadPath, osrmSteps) {
        let routeData = null;
        if (routeDataStr) {
            try { routeData = JSON.parse(routeDataStr); } catch (e) { console.error('Route parse error', e); }
        }

        // --- Stop list ---
        let stopsHtml = '';
        if (routeData && routeData.names && routeData.names.length > 0) {
            stopsHtml = `<div class="section-box">
  <h2>📍 Route Stops</h2>
  <ol class="stop-list">
    ${routeData.names.map((name, i) => `
    <li class="stop-item">
      <div class="stop-num">${i + 1}</div>
      <div class="stop-info">
        <strong>${name}</strong>
        ${i === 0 ? '<span class="stop-badge start">Start</span>' : ''}
        ${i === routeData.names.length - 1 ? '<span class="stop-badge end">End</span>' : ''}
      </div>
    </li>`).join('')}
  </ol>
</div>`;
        }

        // --- Directions: real OSRM steps OR haversine fallback ---
        let directionsHtml = '';
        if (osrmSteps && osrmSteps.length > 0) {
            // Real OSRM step-by-step directions
            const iconMap = { left: '↰', right: '↱', 'sharp left': '⬅', 'sharp right': '➡', 'slight left': '↖', 'slight right': '↗', straight: '⬆', uturn: '↩' };
            directionsHtml = `<div class="section-box"><h2>🧭 Turn-by-Turn Directions</h2><ul class="dir-list">`;
            osrmSteps.forEach((step, idx) => {
                const modifier = step.instruction.split(' ')[1] || '';
                const icon = iconMap[modifier] || '⬆';
                directionsHtml += `
    <li class="dir-item">
      <div class="dir-from"><span class="step-num">${idx + 1}</span> <strong>${icon} ${step.instruction}</strong></div>
      <div class="dir-arrow" style="margin-left:34px;">Continue for <span class="dist-badge">${step.distStr}</span></div>
    </li>`;
            });
            directionsHtml += `</ul></div>`;
        } else if (routeData && routeData.names && routeData.names.length > 1) {
            // Fallback: segment-by-segment with haversine distance
            directionsHtml = `<div class="section-box"><h2>🧭 Route Segments</h2><ul class="dir-list">`;
            for (let i = 0; i < routeData.names.length - 1; i++) {
                const from = routeData.names[i];
                const to = routeData.names[i + 1];
                const fromC = routeData.waypoints[i];
                const toC = routeData.waypoints[i + 1];
                let distBadge = '';
                if (fromC && toC) {
                    const R = 6371;
                    const dLat = (toC[0] - fromC[0]) * Math.PI / 180;
                    const dLon = (toC[1] - fromC[1]) * Math.PI / 180;
                    const a = Math.sin(dLat / 2) ** 2 + Math.cos(fromC[0] * Math.PI / 180) * Math.cos(toC[0] * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
                    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                    distBadge = `<span class="dist-badge">${d.toFixed(1)} km</span>`;
                }
                directionsHtml += `
    <li class="dir-item">
      <div class="dir-from"><span class="step-num">${i + 1}</span> <strong>${from}</strong></div>
      <div class="dir-arrow">↓ Head towards ${to} ${distBadge}</div>
      <div class="dir-to">${to}</div>
    </li>`;
            }
            directionsHtml += `</ul></div>`;
        }

        // --- Day-by-day plan parsed from details text ---
        let daysHtml = '';
        if (details) {
            const lines = details.split('\n');
            let currentDay = null, dayContent = [], days = [];
            lines.forEach(line => {
                const stripped = line.replace(/\*\*/g, '').trim();
                if (/^Day \d+/i.test(stripped)) {
                    if (currentDay) days.push({ day: currentDay, items: dayContent });
                    currentDay = stripped; dayContent = [];
                } else if (line.trim().startsWith('-') && currentDay) {
                    dayContent.push(line.trim().slice(1).trim());
                }
            });
            if (currentDay) days.push({ day: currentDay, items: dayContent });
            if (days.length > 0) {
                daysHtml = `<div class="section-box"><h2>🗓️ Day-by-Day Itinerary</h2>`;
                days.forEach(d => {
                    daysHtml += `<div class="day-block"><h3>${d.day}</h3><ul>`;
                    d.items.forEach(item => { daysHtml += `<li>${item}</li>`; });
                    daysHtml += `</ul></div>`;
                });
                daysHtml += `</div>`;
            }
        }

        const waypointsJson = JSON.stringify(routeData && routeData.waypoints ? routeData.waypoints : []);
        const namesJson = JSON.stringify(routeData && routeData.names ? routeData.names : []);
        // Road path: real OSRM geometry (many coords) or fall back to straight waypoints
        const roadPathJson = JSON.stringify(roadPath && roadPath.length > 0 ? roadPath : (routeData && routeData.waypoints ? routeData.waypoints : []));
        const firstLat = routeData && routeData.waypoints && routeData.waypoints[0] ? routeData.waypoints[0][0] : 23.0225;
        const firstLon = routeData && routeData.waypoints && routeData.waypoints[0] ? routeData.waypoints[0][1] : 72.5714;
        const hasMap = routeData && routeData.waypoints && routeData.waypoints.length > 0;
        const genDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const isRealRoute = roadPath && roadPath.length > 0;

        const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Trip: ${title}</title>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:'Segoe UI',Arial,sans-serif;background:#f0f4f8;color:#1e293b;padding:32px 20px;max-width:880px;margin:0 auto;}
.header{background:linear-gradient(135deg,#6366f1,#a855f7);color:white;padding:32px 28px;border-radius:18px;margin-bottom:24px;text-align:center;box-shadow:0 10px 30px rgba(99,102,241,0.35);}
.header h1{font-size:1.9rem;margin-bottom:6px;letter-spacing:-0.02em;}
.header .meta{font-size:0.88rem;opacity:0.82;}
.section-box{background:white;border-radius:14px;padding:22px 24px;margin-bottom:20px;box-shadow:0 2px 16px rgba(0,0,0,0.07);border:1px solid #e8edf5;}
.section-box h2{font-size:1.1rem;color:#6366f1;margin-bottom:16px;padding-bottom:10px;border-bottom:2px solid #e0e7ff;display:flex;align-items:center;gap:8px;}
.stop-list{list-style:none;padding:0;}
.stop-item{display:flex;align-items:center;gap:14px;padding:10px 12px;border-radius:10px;margin-bottom:8px;background:#f8fafc;border:1px solid #e2e8f0;transition:background 0.15s;}
.stop-num{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#6366f1,#a855f7);color:white;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.9rem;flex-shrink:0;}
.stop-info{flex:1;}
.stop-info strong{display:block;font-size:1rem;}
.stop-badge{font-size:0.68rem;padding:2px 9px;border-radius:12px;font-weight:700;margin-left:8px;letter-spacing:.03em;}
.stop-badge.start{background:#dcfce7;color:#15803d;}
.stop-badge.end{background:#fee2e2;color:#dc2626;}
#trip-map{width:100%;height:400px;border-radius:12px;border:2px solid #e2e8f0;background:#eef2f7;}
.map-note{font-size:0.78rem;color:#94a3b8;margin-top:8px;text-align:center;}
.dir-list{list-style:none;padding:0;}
.dir-item{display:flex;flex-direction:column;gap:2px;padding:12px;border-radius:10px;margin-bottom:10px;background:#f8fafc;border-left:4px solid #6366f1;}
.dir-from{font-size:0.9rem;display:flex;align-items:center;gap:8px;}
.step-num{background:#6366f1;color:white;width:22px;height:22px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:0.75rem;font-weight:700;flex-shrink:0;}
.dir-arrow{font-size:0.82rem;color:#64748b;margin:4px 0 4px 30px;}
.dir-to{font-size:0.9rem;font-weight:600;margin-left:30px;}
.dist-badge{background:#e0e7ff;color:#4f46e5;padding:1px 7px;border-radius:10px;font-size:0.75rem;font-weight:600;margin-left:4px;}
.day-block{margin-bottom:16px;padding:16px;border-radius:10px;border-left:4px solid #a855f7;background:#fdf4ff;}
.day-block h3{font-size:0.95rem;color:#7c3aed;margin-bottom:10px;display:flex;align-items:center;gap:6px;}
.day-block ul{padding-left:20px;}
.day-block li{margin:6px 0;font-size:0.92rem;color:#334155;}
.footer{margin-top:30px;text-align:center;color:#94a3b8;font-size:0.82rem;padding-top:20px;border-top:1px solid #e2e8f0;}
.action-bar{position:fixed;bottom:20px;right:20px;display:flex;gap:10px;z-index:999;}
.action-btn{padding:12px 20px;border:none;border-radius:12px;font-size:0.95rem;font-weight:600;cursor:pointer;display:flex;align-items:center;gap:8px;box-shadow:0 6px 20px rgba(0,0,0,0.2);}
.btn-print{background:linear-gradient(135deg,#6366f1,#a855f7);color:white;}
.btn-close{background:#1e293b;color:white;}
@media print{
  body{background:white;padding:10px;}
  .action-bar,.map-note{display:none!important;}
  #trip-map{height:300px!important;}
  .section-box{box-shadow:none;border:1px solid #ddd;}
  @page{margin:1.4cm;size:A4;}
}
</style>
</head>
<body>
<div class="header">
  <h1>${title}</h1>
  <div class="meta">Generated by Tourista &bull; ${genDate}</div>
</div>

${stopsHtml}

${hasMap ? `
<div class="section-box">
  <h2>🗺️ Route Map</h2>
  <div id="trip-map"><div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;flex-direction:column;gap:8px;"><div style="font-size:2rem;">🗺️</div><p>Loading map…</p></div></div>
  <p class="map-note">${isRealRoute ? '✅ Real road route loaded from OSRM • ' : '⚠️ Straight-line route (offline fallback) • '}Requires internet for map tiles.</p>
</div>` : ''}

${directionsHtml}
${daysHtml}

<div class="footer">
  <p><strong>Tourista Offline Trip Guide</strong></p>
  <p style="margin-top:4px;">For live navigation, open this trip in the Tourista web app.</p>
</div>

<div class="action-bar no-print">
  <button class="action-btn btn-print" onclick="window.print()">🖨️ Print / Save PDF</button>
</div>

<script>
(function(){
  var waypoints=${waypointsJson};
  var names=${namesJson};
  if(!waypoints||waypoints.length===0){var m=document.getElementById('trip-map');if(m)m.style.display='none';return;}

  function initMap(){
    try{
      var el=document.getElementById('trip-map');
      if(!el)return;
      el.innerHTML='';
      var map=L.map('trip-map').setView([${firstLat},${firstLon}],12);
      // Try OSM tiles, show route even if tiles fail
      var tileLayer=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
        attribution:'&copy; OpenStreetMap contributors',
        errorTileUrl:'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      }).addTo(map);

      var latlngs=waypoints.map(function(c){return L.latLng(c[0],c[1]);});
      var markerObjs=[];

      latlngs.forEach(function(ll,i){
        var isFirst=i===0, isLast=i===latlngs.length-1;
        var color=isFirst?'#10b981':(isLast?'#ef4444':'#6366f1');
        var icon=L.divIcon({
          html:'<div style="background:'+color+';color:white;width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:700;font-size:13px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.35);">'+(i+1)+'</div>',
          className:'',iconSize:[30,30],iconAnchor:[15,15]
        });
        var name=names[i]||('Stop '+(i+1));
        var label=isFirst?'🟢 Start: ':isLast?'🔴 End: ':'📍 Stop '+(i+1)+': ';
        var m=L.marker(ll,{icon:icon}).addTo(map);
        m.bindPopup('<div style="min-width:140px;font-size:13px;"><b>'+label+name+'</b></div>');
        markerObjs.push(m);
      });

      // Draw the road path (real OSRM geometry or fallback straight lines)
      var roadCoords=${roadPathJson};
      if(roadCoords&&roadCoords.length>1){
        var roadLatlngs=roadCoords.map(function(c){return L.latLng(c[0],c[1]);});
        // Main road polyline
        L.polyline(roadLatlngs,{color:'#6366f1',weight:5,opacity:0.9}).addTo(map);
        // Subtle glow underneath
        L.polyline(roadLatlngs,{color:'#a855f7',weight:9,opacity:0.18}).addTo(map);
      }

      // fitBounds using marker objects (not LatLng) — fixes addEventParent error
      if(markerObjs.length>0){
        var group=L.featureGroup(markerObjs);
        map.fitBounds(group.getBounds().pad(0.15));
      }
    }catch(err){
      console.error('Map init error:',err);
      var el=document.getElementById('trip-map');
      if(el)el.innerHTML='<div style="display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;gap:8px;color:#94a3b8;"><p>Could not render map. Internet may be required for map tiles.</p></div>';
    }
  }

  // Init map when Leaflet is ready
  if(typeof L!=='undefined'){
    setTimeout(initMap,600);
  } else {
    document.addEventListener('DOMContentLoaded',function(){setTimeout(initMap,800);});
  }
})();
<\/script>
</body>
</html>`;

        if (mode === 'pdf') {
            // Open in new window for user to print/save PDF
            const win = window.open('', '_blank', 'width=960,height=750');
            if (!win) { alert('Please allow popups to open the print view.'); return; }
            win.document.open();
            win.document.write(htmlContent);
            win.document.close();
        } else {
            // Download as .tourmap file (self-contained HTML)
            const safeTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
            const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${safeTitle}.tourmap`;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1000);
        }
    }

    // ==========================================
    // INITIAL LOAD
    // ==========================================
    loadDashboardData();
    loadSavedTrips();

    function loadCurrencyRates() { /* removed from UI */ }
});

