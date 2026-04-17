/* ============================================================
   TOURISTA ADMIN PANEL — admin.js
   Full-featured admin panel with all 10 management sections
   ============================================================ */

'use strict';

// ==========================================
// CONSTANTS & STATE
// ==========================================
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: '123'
};

const API_BASE = 'http://localhost:3000/api';

// In-memory data stores (simulated for demo; connect to real API/DB as needed)
let adminState = {
    places: [
        { id: 1, name: 'Sabarmati Riverfront', city: 'Ahmedabad', category: 'attraction', rating: 4.8, lat: 23.0606, lng: 72.5737, image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Sabarmati_riverfront.jpg/1200px-Sabarmati_riverfront.jpg', description: 'Beautiful riverfront promenade' },
        { id: 2, name: 'Calico Museum', city: 'Ahmedabad', category: 'museum', rating: 4.6, lat: 23.0520, lng: 72.5639, image: '', description: 'Historic textile museum' },
        { id: 3, name: 'Adalaj Stepwell', city: 'Ahmedabad', category: 'historical', rating: 4.7, lat: 23.1655, lng: 72.5797, image: '', description: 'Intricate 15th-century stepwell' },
        { id: 4, name: 'Indroda Nature Park', city: 'Gandhinagar', category: 'garden', rating: 4.3, lat: 23.1861, lng: 72.6540, image: '', description: 'Botanical garden and zoo' },
        { id: 5, name: 'ABC Cafe', city: 'Ahmedabad', category: 'cafe', rating: 4.5, lat: 23.0300, lng: 72.5800, image: '', description: 'Cozy specialty coffee shop' },
    ],
    users: [
        { id: 1, name: 'Naisarg Patel', email: 'naisarg@example.com', role: 'Admin', joined: '2024-01-15', trips: 12, status: 'active', avatar: 'https://i.pravatar.cc/100?img=12' },
        { id: 2, name: 'Priya Shah', email: 'priya@example.com', role: 'User', joined: '2024-02-20', trips: 5, status: 'active', avatar: 'https://i.pravatar.cc/100?img=45' },
        { id: 3, name: 'Ravi Kumar', email: 'ravi@example.com', role: 'User', joined: '2024-03-01', trips: 3, status: 'blocked', avatar: 'https://i.pravatar.cc/100?img=33' },
        { id: 4, name: 'Anjali Mehta', email: 'anjali@example.com', role: 'User', joined: '2024-03-10', trips: 8, status: 'active', avatar: 'https://i.pravatar.cc/100?img=47' },
    ],
    categories: [
        { id: 1, name: 'Attraction', icon: '🏛️', count: 24 },
        { id: 2, name: 'Restaurant', icon: '🍽️', count: 43 },
        { id: 3, name: 'Hotel', icon: '🏨', count: 18 },
        { id: 4, name: 'Cafe', icon: '☕', count: 31 },
        { id: 5, name: 'Temple', icon: '🛕', count: 15 },
        { id: 6, name: 'Mall', icon: '🏬', count: 9 },
        { id: 7, name: 'Garden', icon: '🌿', count: 12 },
        { id: 8, name: 'Museum', icon: '🗿', count: 7 },
        { id: 9, name: 'Lake', icon: '🏞️', count: 5 },
        { id: 10, name: 'Historical', icon: '🏰', count: 20 },
    ],
    reviews: [
        { id: 1, user: 'Priya Shah', avatar: 'https://i.pravatar.cc/60?img=45', place: 'Sabarmati Riverfront', rating: 5, text: 'Absolutely stunning view at night! The lights reflecting on the water are magical. A must-visit for everyone.', flagged: false, highlighted: true, date: '2 hours ago' },
        { id: 2, user: 'Anon User', avatar: 'https://i.pravatar.cc/60?img=9', place: 'ABC Cafe', rating: 1, text: 'WORST PLACE EVER!!! SCAM SCAM SCAM! Do not go here!!! They charged me 3x the price!!!', flagged: true, highlighted: false, date: '5 hours ago' },
        { id: 3, user: 'Ravi Kumar', avatar: 'https://i.pravatar.cc/60?img=33', place: 'Adalaj Stepwell', rating: 4, text: 'Great historical site. The architecture is breathtaking. Bit crowded on weekends though.', flagged: false, highlighted: false, date: '1 day ago' },
        { id: 4, user: 'Anjali Mehta', avatar: 'https://i.pravatar.cc/60?img=47', place: 'Indroda Nature Park', rating: 5, text: 'Perfect for a family outing. Kids loved the dinosaur park section. Very well maintained.', flagged: false, highlighted: true, date: '2 days ago' },
    ],
    reports: [
        { id: 1, type: 'Fake Review', title: 'Spam review on ABC Cafe', reporter: 'Priya Shah', target: 'Review #2', detail: 'This review appears to be fake with inflammatory language and provides no useful information.', status: 'open', date: '5 hours ago' },
        { id: 2, type: 'Wrong Information', title: 'Incorrect location for Calico Museum', reporter: 'Ravi Kumar', target: 'Place #2', detail: 'The pinned location on the map is wrong. The museum entrance is 200m east of the marked location.', status: 'open', date: '1 day ago' },
        { id: 3, type: 'Inappropriate Content', title: 'Offensive images uploaded', reporter: 'Anjali Mehta', target: 'Content Upload', detail: 'A user uploaded inappropriate images in the media section. Needs immediate removal.', status: 'open', date: '2 days ago' },
        { id: 4, type: 'Duplicate Place', title: 'Duplicate entry for Riverfront', reporter: 'Naisarg Patel', target: 'Place #6', detail: 'There is a duplicate place entry for Sabarmati Riverfront. The older entry should be deleted.', status: 'resolved', date: '3 days ago' },
    ],
    media: [
        { id: 1, url: 'https://images.unsplash.com/photo-1587424016739-bdabf49a8d9d?w=300&auto=format&fit=crop', name: 'ahmedabad.jpg' },
        { id: 2, url: 'https://images.unsplash.com/photo-1598460670397-2b7e91d84814?w=300&auto=format&fit=crop', name: 'gandhinagar.jpg' },
        { id: 3, url: 'https://images.unsplash.com/photo-1627806509653-f728dc763071?w=300&auto=format&fit=crop', name: 'mehsana.jpg' },
        { id: 4, url: 'https://images.unsplash.com/photo-1517760444937-f6397edcbbcd?w=300&auto=format&fit=crop', name: 'riverfront.jpg' },
        { id: 5, url: 'https://images.unsplash.com/photo-1524230572899-a752b3835840?w=300&auto=format&fit=crop', name: 'stepwell.jpg' },
        { id: 6, url: 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=300&auto=format&fit=crop', name: 'nature_park.jpg' },
    ],
    apiKeys: [
        { id: 1, name: 'Overpass API', key: 'ovp_k7x2m9q...4wR2', active: true },
        { id: 2, name: 'OSRM Routing', key: 'osrm_prod_8...kL9', active: true },
        { id: 3, name: 'Nominatim Geo', key: 'nom_free_tier', active: true },
    ],
    mapSettings: { lat: 23.0225, lng: 72.5714, zoom: 12, city: 'Ahmedabad, India' },
    specialMarkers: [],
    nextPlaceId: 6,
    nextUserId: 5,
    nextCatId: 11,
    adminPassword: 'tourista@2024',
    roles: [
        { name: 'Super Admin', desc: 'Full system access', icon: '🛡️', count: 1 },
        { name: 'Moderator', desc: 'Review & content management', icon: '⚖️', count: 2 },
        { name: 'Editor', desc: 'Add/edit places and content', icon: '✏️', count: 3 },
        { name: 'Viewer', desc: 'Read-only analytics access', icon: '👁️', count: 5 },
    ],
    activityLog: [
        { type: 'success', msg: 'Admin logged in', time: 'Now' },
        { type: 'warning', msg: 'Report flagged - Fake Review', time: '5h ago' },
        { type: 'success', msg: 'New place added: ABC Cafe', time: '1d ago' },
        { type: 'danger', msg: 'User blocked: Ravi Kumar', time: '2d ago' },
        { type: 'success', msg: 'Password changed successfully', time: '5d ago' },
    ]
};

let adminMap = null;
let reviewFilter = 'all';
let confirmCallback = null;

// ==========================================
// UTILITIES
// ==========================================
function showToast(msg, type = 'success') {
    const toast = document.getElementById('admin-toast');
    const icons = { success: '✅', error: '❌', warning: '⚠️' };
    toast.innerHTML = `<span>${icons[type] || '✅'}</span> ${msg}`;
    toast.className = `admin-toast ${type !== 'success' ? type : ''}`;
    toast.style.display = 'flex';
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 3500);
}

function openPopupModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
}
function closePopupModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
}

function confirmAction(title, msg, cb) {
    document.getElementById('confirm-title').textContent = title;
    document.getElementById('confirm-msg').textContent = msg;
    confirmCallback = cb;
    openPopupModal('confirm-modal');
}

function renderStars(rating) {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5 ? '½' : '';
    return '★'.repeat(full) + half + '☆'.repeat(5 - Math.ceil(rating));
}

function formatDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

// ==========================================
// AUTH — LOGIN GATE
// ==========================================
function checkAuth() {
    return sessionStorage.getItem('tourista-admin-auth') === 'true';
}

function doLogin() {
    const un = document.getElementById('admin-username').value.trim();
    const pw = document.getElementById('admin-password').value;
    const errDiv = document.getElementById('login-error');
    const errMsg = document.getElementById('login-error-msg');

    // Support updated password
    const storedPw = localStorage.getItem('tourista-admin-password') || ADMIN_CREDENTIALS.password;

    if (un === ADMIN_CREDENTIALS.username && pw === storedPw) {
        sessionStorage.setItem('tourista-admin-auth', 'true');
        document.getElementById('admin-login-screen').style.display = 'none';
        document.getElementById('admin-app').style.display = 'flex';
        errDiv.style.display = 'none';
        logActivity('success', 'Admin logged in successfully');
        onAuthReady();
    } else {
        errMsg.textContent = 'Incorrect username or password.';
        errDiv.style.display = 'flex';
        document.getElementById('admin-password').value = '';
    }
}

function doLogout() {
    if (!confirm('Sign out of Admin Panel?')) return;
    sessionStorage.removeItem('tourista-admin-auth');
    window.location.reload();
}

// ==========================================
// APP INIT (after auth)
// ==========================================
function onAuthReady() {
    loadTheme();
    renderDashboard();
    renderPlaces();
    renderCategories();
    renderMedia();
    renderUsers();
    renderReviews();
    renderReports();
    renderSecurity();
    renderAPISettings();
    setupMapControl();
    setupCharts();
}

function loadTheme() {
    const t = localStorage.getItem('tourista-theme');
    if (t === 'light') document.body.classList.add('light-theme');
}

// ==========================================
// NAVIGATION
// ==========================================
function switchPanel(panelId) {
    document.querySelectorAll('.admin-nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.admin-panel').forEach(el => el.classList.remove('active'));

    const navEl = document.querySelector(`.admin-nav-item[data-panel="${panelId}"]`);
    const panelEl = document.getElementById(`panel-${panelId}`);

    if (navEl) navEl.classList.add('active');
    if (panelEl) panelEl.classList.add('active');

    const labels = {
        dashboard: '📊 Dashboard', places: '🧾 Manage Places', categories: '🏷️ Categories',
        content: '🖼️ Content / Media', users: '👥 User Management', reviews: '⭐ Reviews',
        reports: '🚨 Reports', mapcontrol: '📍 Map Control', security: '🔐 Security',
        settings: '⚙️ API & Settings'
    };
    document.getElementById('admin-breadcrumb-text').textContent = labels[panelId] || panelId;

    // Lazy init map
    if (panelId === 'mapcontrol' && !adminMap) {
        setTimeout(initAdminMap, 200);
    }

    // Close mobile sidebar
    document.getElementById('admin-sidebar').classList.remove('open');
}

// ==========================================
// DASHBOARD — Charts & Stats
// ==========================================
function renderDashboard() {
    document.getElementById('stat-users').textContent = adminState.users.filter(u => u.status === 'active').length.toLocaleString();
    document.getElementById('stat-places').textContent = adminState.places.length.toLocaleString();
    document.getElementById('stat-reviews').textContent = adminState.reviews.length.toLocaleString() + '+';
    document.getElementById('stat-reports').textContent = adminState.reports.filter(r => r.status === 'open').length;
}

function setupCharts() {
    // User Growth Chart
    const ugCtx = document.getElementById('userGrowthChart');
    if (!ugCtx) return;
    new Chart(ugCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'New Users',
                data: [12, 19, 15, 25, 22, 31, 28],
                borderColor: '#6366f1',
                backgroundColor: 'rgba(99,102,241,0.12)',
                borderWidth: 2.5,
                pointBackgroundColor: '#6366f1',
                pointRadius: 4,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
                y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } }
            }
        }
    });

    // Most Viewed Places Chart
    const pvCtx = document.getElementById('placesChart');
    if (!pvCtx) return;
    new Chart(pvCtx, {
        type: 'bar',
        data: {
            labels: ['Riverfront', 'Adalaj Well', 'ABC Cafe', 'Calico Museum', 'Indroda Park'],
            datasets: [{
                label: 'Views',
                data: [1240, 980, 870, 740, 620],
                backgroundColor: ['#6366f1','#a855f7','#ec4899','#f59e0b','#10b981'],
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#64748b', font: { size: 11 } } },
                y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b', font: { size: 11 } } }
            }
        }
    });
}

// ==========================================
// PLACES MANAGEMENT
// ==========================================
function renderPlaces(filter = '') {
    const tbody = document.getElementById('places-tbody');
    const catF = document.getElementById('places-cat-filter')?.value || '';
    let places = adminState.places;
    if (filter) places = places.filter(p => p.name.toLowerCase().includes(filter.toLowerCase()) || p.city.toLowerCase().includes(filter.toLowerCase()));
    if (catF) places = places.filter(p => p.category === catF);

    tbody.innerHTML = places.map((p, i) => `
        <tr>
            <td>${i + 1}</td>
            <td><strong>${p.name}</strong></td>
            <td>${p.city}</td>
            <td><span class="status-pill active" style="background:rgba(99,102,241,0.12);color:var(--accent-primary);">${p.category}</span></td>
            <td><span class="rating-stars">${renderStars(p.rating)}</span> <span style="color:var(--text-muted); font-size:0.8rem;">${p.rating}</span></td>
            <td style="font-size:0.8rem; color:var(--text-muted);">${p.lat?.toFixed(4)}, ${p.lng?.toFixed(4)}</td>
            <td>
                <div style="display:flex; gap:0.4rem;">
                    <button class="rev-btn resolve edit-place-btn" data-id="${p.id}" title="Edit">
                        <i class="ph ph-pencil-simple"></i> Edit
                    </button>
                    <button class="rev-btn delete delete-place-btn" data-id="${p.id}" title="Delete">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('') || `<tr><td colspan="7" style="text-align:center; color:var(--text-muted); padding:2rem;">No places found.</td></tr>`;
}

function openAddPlaceModal(editId = null) {
    const form = document.getElementById('place-form');
    form.reset();
    document.getElementById('pf-edit-id').value = editId || '';
    document.getElementById('pf-image-filename').textContent = 'No file chosen';
    document.getElementById('place-modal-title').innerHTML = editId
        ? '<i class="ph ph-pencil-simple"></i> Edit Place'
        : '<i class="ph ph-map-pin"></i> Add New Place';

    if (editId) {
        const p = adminState.places.find(x => x.id === editId);
        if (p) {
            document.getElementById('pf-name').value = p.name;
            document.getElementById('pf-city').value = p.city;
            document.getElementById('pf-category').value = p.category;
            document.getElementById('pf-rating').value = p.rating;
            document.getElementById('pf-lat').value = p.lat;
            document.getElementById('pf-lng').value = p.lng;
            document.getElementById('pf-image').value = p.image || '';
            document.getElementById('pf-desc').value = p.description || '';
        }
    }
    openPopupModal('place-modal');
}

function savePlaceForm(e) {
    e.preventDefault();
    const editId = parseInt(document.getElementById('pf-edit-id').value);
    const data = {
        name: document.getElementById('pf-name').value.trim(),
        city: document.getElementById('pf-city').value.trim(),
        category: document.getElementById('pf-category').value,
        rating: parseFloat(document.getElementById('pf-rating').value) || 0,
        lat: parseFloat(document.getElementById('pf-lat').value),
        lng: parseFloat(document.getElementById('pf-lng').value),
        image: document.getElementById('pf-image').value.trim(),
        description: document.getElementById('pf-desc').value.trim(),
    };

    if (editId) {
        const idx = adminState.places.findIndex(p => p.id === editId);
        if (idx !== -1) adminState.places[idx] = { ...adminState.places[idx], ...data };
        logActivity('success', `Place edited: ${data.name}`);
        showToast(`✏️ "${data.name}" updated successfully!`);
    } else {
        adminState.places.push({ id: adminState.nextPlaceId++, ...data });
        logActivity('success', `New place added: ${data.name}`);
        showToast(`➕ "${data.name}" added to places!`);
    }

    closePopupModal('place-modal');
    renderPlaces();
    renderDashboard();
}

// ==========================================
// CATEGORIES
// ==========================================
function renderCategories() {
    const grid = document.getElementById('categories-grid');
    grid.innerHTML = adminState.categories.map(c => `
        <div class="cat-card" id="cat-card-${c.id}">
            <div class="cat-card-icon">${c.icon}</div>
            <h4>${c.name}</h4>
            <p>${c.count} places</p>
            <div class="cat-card-actions">
                <button class="cat-action-btn edit" data-cat-id="${c.id}"><i class="ph ph-pencil-simple"></i> Edit</button>
                <button class="cat-action-btn del" data-cat-del-id="${c.id}"><i class="ph ph-trash"></i></button>
            </div>
        </div>
    `).join('');
}

// ==========================================
// CONTENT / MEDIA
// ==========================================
function renderMedia() {
    const grid = document.getElementById('media-grid');
    grid.innerHTML = adminState.media.map(m => `
        <div class="media-item" id="media-${m.id}">
            <img src="${m.url}" alt="${m.name}" loading="lazy">
            <div class="media-item-overlay">
                <button class="rev-btn resolve" onclick="replaceMedia(${m.id})" title="Replace"><i class="ph ph-arrows-clockwise"></i></button>
                <button class="rev-btn delete" onclick="deleteMedia(${m.id})" title="Remove"><i class="ph ph-trash"></i></button>
            </div>
            <div class="media-item-label">${m.name}</div>
        </div>
    `).join('');
}

window.replaceMedia = function (id) {
    showToast('📷 Replace image clicked. Connect file upload to real storage.', 'warning');
};
window.deleteMedia = function (id) {
    confirmAction('Remove Image', 'Are you sure you want to remove this image?', () => {
        adminState.media = adminState.media.filter(m => m.id !== id);
        renderMedia();
        showToast('🗑️ Image removed.', 'warning');
    });
};

// ==========================================
// USERS
// ==========================================
function renderUsers(filter = '') {
    const tbody = document.getElementById('users-tbody');
    const statusFilter = document.getElementById('user-status-filter')?.value || '';
    let users = adminState.users;
    if (filter) users = users.filter(u => u.name.toLowerCase().includes(filter.toLowerCase()) || u.email.toLowerCase().includes(filter.toLowerCase()));
    if (statusFilter) users = users.filter(u => u.status === statusFilter);

    tbody.innerHTML = users.map((u, i) => `
        <tr>
            <td>${i + 1}</td>
            <td>
                <div style="display:flex; align-items:center; gap:0.65rem;">
                    <img src="${u.avatar}" width="34" height="34" style="border-radius:50%; object-fit:cover; flex-shrink:0;" alt="${u.name}">
                    <strong>${u.name}</strong>
                </div>
            </td>
            <td style="color:var(--text-muted);">${u.email}</td>
            <td><span class="status-pill ${u.role === 'Admin' ? '' : 'pending'}" style="${u.role === 'Admin' ? 'background:rgba(99,102,241,0.15);color:var(--accent-primary);' : ''}">${u.role}</span></td>
            <td style="font-size:0.82rem; color:var(--text-muted);">${formatDate(u.joined)}</td>
            <td style="text-align:center;">${u.trips}</td>
            <td><span class="status-pill ${u.status}">${u.status === 'active' ? '● Active' : '⛔ Blocked'}</span></td>
            <td>
                <div style="display:flex; gap:0.4rem; flex-wrap:wrap;">
                    <button class="rev-btn ${u.status === 'active' ? 'delete' : 'resolve'} toggle-user-btn" data-uid="${u.id}" title="${u.status === 'active' ? 'Block' : 'Unblock'}">
                        <i class="ph ph-${u.status === 'active' ? 'prohibit' : 'check-circle'}"></i> ${u.status === 'active' ? 'Block' : 'Unblock'}
                    </button>
                    <button class="rev-btn delete delete-user-btn" data-uid="${u.id}" title="Delete User">
                        <i class="ph ph-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('') || `<tr><td colspan="8" style="text-align:center; color:var(--text-muted); padding:2rem;">No users found.</td></tr>`;
}

// ==========================================
// REVIEWS
// ==========================================
function renderReviews() {
    const list = document.getElementById('reviews-list');
    let reviews = adminState.reviews;

    if (reviewFilter === 'flagged') reviews = reviews.filter(r => r.flagged);
    else if (reviewFilter === 'top') reviews = reviews.filter(r => r.highlighted || r.rating >= 4);
    else if (reviewFilter === 'low') reviews = reviews.filter(r => r.rating <= 2);

    list.innerHTML = reviews.map(r => `
        <div class="review-card ${r.flagged ? 'flagged' : ''} ${r.highlighted ? 'top' : ''}" id="rev-card-${r.id}">
            <img class="review-avatar" src="${r.avatar}" alt="${r.user}">
            <div class="review-body">
                <div class="review-header">
                    <span class="review-name">${r.user}</span>
                    <span class="rating-stars" style="font-size:0.85rem;">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</span>
                    <span class="review-place">@ ${r.place}</span>
                    <span style="color:var(--text-muted); font-size:0.78rem; margin-left:auto;">${r.date}</span>
                    ${r.flagged ? '<span class="status-pill blocked">🚩 Flagged</span>' : ''}
                    ${r.highlighted ? '<span class="status-pill active">🌟 Highlighted</span>' : ''}
                </div>
                <p class="review-text">"${r.text}"</p>
                <div class="review-actions">
                    <button class="rev-btn highlight highlight-rev-btn" data-rid="${r.id}">
                        <i class="ph ph-star"></i> ${r.highlighted ? 'Remove Highlight' : 'Highlight'}
                    </button>
                    <button class="rev-btn delete delete-rev-btn" data-rid="${r.id}">
                        <i class="ph ph-trash"></i> Delete Review
                    </button>
                </div>
            </div>
        </div>
    `).join('') || `<div style="text-align:center; padding:3rem; color:var(--text-muted);">No reviews match this filter.</div>`;
}

// ==========================================
// REPORTS
// ==========================================
function renderReports() {
    const list = document.getElementById('reports-list');
    list.innerHTML = adminState.reports.map(r => `
        <div class="report-card ${r.status === 'resolved' ? 'resolved-card' : ''}" id="rep-${r.id}">
            <div class="report-icon"><i class="ph ph-${r.status === 'resolved' ? 'check-circle' : 'warning-octagon'}"></i></div>
            <div class="report-body">
                <div class="report-type">${r.type}</div>
                <div class="report-title">${r.title}</div>
                <div class="report-meta">Reported by <strong>${r.reporter}</strong> · Target: ${r.target} · ${r.date}</div>
                <p style="color:var(--text-secondary); font-size:0.87rem; margin-bottom:0.75rem;">${r.detail}</p>
                <div class="report-actions">
                    ${r.status === 'open' ? `
                        <button class="rev-btn resolve resolve-report-btn" data-rid="${r.id}"><i class="ph ph-check"></i> Resolve</button>
                        <button class="rev-btn delete dismiss-report-btn" data-rid="${r.id}"><i class="ph ph-x"></i> Dismiss</button>
                    ` : `<span class="status-pill active">✅ Resolved</span>`}
                </div>
            </div>
        </div>
    `).join('');

    // Update badge
    const openCount = adminState.reports.filter(r => r.status === 'open').length;
    const badge = document.getElementById('reports-badge');
    if (badge) badge.textContent = openCount > 0 ? openCount : '';
    if (badge) badge.style.display = openCount > 0 ? '' : 'none';
}

// ==========================================
// MAP CONTROL
// ==========================================
function initAdminMap() {
    const container = document.getElementById('admin-map-container');
    if (!container || adminMap) return;
    container.innerHTML = '';
    const { lat, lng, zoom } = adminState.mapSettings;
    adminMap = L.map(container).setView([lat, lng], zoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' }).addTo(adminMap);

    // Add existing places as markers
    adminState.places.forEach(p => {
        if (p.lat && p.lng) {
            const icon = L.divIcon({
                html: `<div style="background:#6366f1;color:white;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);">${p.id}</div>`,
                className: '', iconSize: [24, 24], iconAnchor: [12, 12]
            });
            L.marker([p.lat, p.lng], { icon }).addTo(adminMap)
                .bindPopup(`<b>${p.name}</b><br>${p.category} — ${p.city}`);
        }
    });

    // Add special markers
    adminState.specialMarkers.forEach(sm => {
        const icon = L.divIcon({
            html: `<div style="background:#f59e0b;color:white;padding:3px 6px;border-radius:6px;font-size:10px;white-space:nowrap;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);">📍 ${sm.label}</div>`,
            className: ''
        });
        L.marker([sm.lat, sm.lng], { icon }).addTo(adminMap).bindPopup(`<b>${sm.label}</b>`);
    });
}

function setupMapControl() {
    const zoomSlider = document.getElementById('map-zoom-slider');
    const zoomVal = document.getElementById('map-zoom-val');
    if (zoomSlider) {
        zoomSlider.addEventListener('input', () => {
            zoomVal.textContent = zoomSlider.value;
        });
    }

    document.getElementById('apply-map-settings-btn')?.addEventListener('click', () => {
        const lat = parseFloat(document.getElementById('map-def-lat').value);
        const lng = parseFloat(document.getElementById('map-def-lng').value);
        const zoom = parseInt(document.getElementById('map-zoom-slider').value);
        const city = document.getElementById('map-default-city').value.trim();
        adminState.mapSettings = { lat, lng, zoom, city };
        if (adminMap) adminMap.setView([lat, lng], zoom);
        showToast('🗺️ Map settings applied!');
    });

    document.getElementById('add-marker-btn')?.addEventListener('click', () => {
        const label = document.getElementById('marker-label').value.trim();
        const lat = parseFloat(document.getElementById('marker-lat').value);
        const lng = parseFloat(document.getElementById('marker-lng').value);
        if (!label || isNaN(lat) || isNaN(lng)) {
            showToast('Please fill in label, lat, and lng fields.', 'error');
            return;
        }
        adminState.specialMarkers.push({ label, lat, lng });
        if (adminMap) {
            const icon = L.divIcon({
                html: `<div style="background:#f59e0b;color:white;padding:3px 6px;border-radius:6px;font-size:10px;white-space:nowrap;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);">📍 ${label}</div>`,
                className: ''
            });
            L.marker([lat, lng], { icon }).addTo(adminMap).bindPopup(`<b>${label}</b>`);
            adminMap.setView([lat, lng], 14, { animate: true });
        }
        document.getElementById('marker-label').value = '';
        document.getElementById('marker-lat').value = '';
        document.getElementById('marker-lng').value = '';
        showToast(`📍 Special marker "${label}" added!`);
    });
}

// ==========================================
// SECURITY
// ==========================================
function renderSecurity() {
    // Roles
    const rolesList = document.getElementById('roles-list');
    if (rolesList) {
        rolesList.innerHTML = adminState.roles.map(r => `
            <div class="role-item">
                <div class="role-icon">${r.icon}</div>
                <div class="role-info">
                    <div class="role-name">${r.name}</div>
                    <div class="role-desc">${r.desc}</div>
                </div>
                <span class="role-badge">${r.count}</span>
            </div>
        `).join('');
    }

    // Activity Log
    const logEl = document.getElementById('activity-log');
    if (logEl) {
        logEl.innerHTML = adminState.activityLog.map(a => `
            <li>
                <div class="act-dot ${a.type}"></div>
                <div>${a.msg}</div>
                <span class="act-time">${a.time}</span>
            </li>
        `).join('');
    }

    // Password strength
    const newPwInput = document.getElementById('new-pw');
    if (newPwInput) {
        newPwInput.addEventListener('input', () => {
            const pw = newPwInput.value;
            const strengthDiv = document.getElementById('pass-strength');
            const bar = document.getElementById('pass-strength-bar');
            const label = document.getElementById('pass-strength-label');
            if (!pw) { strengthDiv.style.display = 'none'; return; }
            strengthDiv.style.display = 'flex';
            let score = 0;
            if (pw.length >= 8) score++;
            if (/[A-Z]/.test(pw)) score++;
            if (/[0-9]/.test(pw)) score++;
            if (/[^A-Za-z0-9]/.test(pw)) score++;
            const levels = [
                { w: '20%', c: '#ef4444', l: 'Very Weak' },
                { w: '40%', c: '#f97316', l: 'Weak' },
                { w: '60%', c: '#f59e0b', l: 'Fair' },
                { w: '80%', c: '#84cc16', l: 'Strong' },
                { w: '100%', c: '#10b981', l: 'Very Strong' },
            ];
            const lv = levels[score] || levels[0];
            bar.style.setProperty('--strength-w', lv.w);
            bar.style.setProperty('--strength-color', lv.c);
            label.textContent = lv.l;
            label.style.color = lv.c;
        });
    }

    document.getElementById('change-pw-btn')?.addEventListener('click', () => {
        const curr = document.getElementById('curr-pw').value;
        const newPw = document.getElementById('new-pw').value;
        const confirmPw = document.getElementById('confirm-pw').value;
        const storedPw = localStorage.getItem('tourista-admin-password') || ADMIN_CREDENTIALS.password;

        if (curr !== storedPw) { showToast('Current password is incorrect.', 'error'); return; }
        if (newPw.length < 8) { showToast('New password must be at least 8 characters.', 'error'); return; }
        if (newPw !== confirmPw) { showToast('Passwords do not match.', 'error'); return; }

        localStorage.setItem('tourista-admin-password', newPw);
        adminState.adminPassword = newPw;
        document.getElementById('curr-pw').value = '';
        document.getElementById('new-pw').value = '';
        document.getElementById('confirm-pw').value = '';
        document.getElementById('pass-strength').style.display = 'none';
        logActivity('success', 'Admin password changed');
        showToast('🔐 Password updated successfully!');
    });

    document.getElementById('add-role-btn')?.addEventListener('click', () => {
        const name = prompt('Enter new role name:');
        if (!name) return;
        const desc = prompt('Role description:') || 'Custom role';
        const icon = prompt('Role emoji icon (e.g. 🧑):') || '👤';
        adminState.roles.push({ name, desc, icon, count: 0 });
        renderSecurity();
        showToast(`✅ Role "${name}" added.`);
    });
}

function logActivity(type, msg) {
    const now = new Date();
    const time = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    adminState.activityLog.unshift({ type, msg, time });
    if (adminState.activityLog.length > 20) adminState.activityLog.pop();
    const logEl = document.getElementById('activity-log');
    if (logEl) {
        const li = document.createElement('li');
        li.innerHTML = `<div class="act-dot ${type}"></div><div>${msg}</div><span class="act-time">${time}</span>`;
        logEl.prepend(li);
    }
}

// ==========================================
// API & SETTINGS
// ==========================================
function renderAPISettings() {
    const keysList = document.getElementById('api-keys-list');
    if (keysList) {
        keysList.innerHTML = adminState.apiKeys.map(k => `
            <div class="api-key-item" id="apikey-${k.id}">
                <span class="api-key-name">${k.name}</span>
                <span class="api-key-val">${k.key}</span>
                <button class="api-key-copy" onclick="copyApiKey('${k.key}', ${k.id})"><i class="ph ph-copy"></i></button>
                <button class="api-key-revoke" onclick="revokeApiKey(${k.id})"><i class="ph ph-trash"></i></button>
            </div>
        `).join('');
    }

    // Range inputs
    const rateApi = document.getElementById('rate-api');
    const rateApiVal = document.getElementById('rate-api-val');
    const rateAi = document.getElementById('rate-ai');
    const rateAiVal = document.getElementById('rate-ai-val');
    const rateTrips = document.getElementById('rate-trips');
    const rateTripsVal = document.getElementById('rate-trips-val');

    if (rateApi) rateApi.addEventListener('input', () => rateApiVal.textContent = parseInt(rateApi.value).toLocaleString());
    if (rateAi) rateAi.addEventListener('input', () => rateAiVal.textContent = rateAi.value);
    if (rateTrips) rateTrips.addEventListener('input', () => rateTripsVal.textContent = rateTrips.value);

    document.getElementById('save-limits-btn')?.addEventListener('click', () => {
        showToast('⚡ Usage limits saved!');
        logActivity('success', 'API usage limits updated');
    });

    document.getElementById('gen-key-btn')?.addEventListener('click', () => {
        const name = prompt('API Key label (e.g. Gemini, Maps):');
        if (!name) return;
        const newKey = name.toLowerCase().replace(/\s/g, '_') + '_' + Math.random().toString(36).substr(2, 8) + '...';
        const newId = Date.now();
        adminState.apiKeys.push({ id: newId, name, key: newKey, active: true });
        renderAPISettings();
        showToast(`🔑 API key "${name}" generated!`);
    });
}

window.copyApiKey = function (key, id) {
    navigator.clipboard.writeText(key).then(() => showToast('📋 API key copied to clipboard!')).catch(() => showToast('Copy failed', 'error'));
};
window.revokeApiKey = function (id) {
    confirmAction('Revoke API Key', 'This will invalidate the API key immediately. Continue?', () => {
        adminState.apiKeys = adminState.apiKeys.filter(k => k.id !== id);
        renderAPISettings();
        showToast('🗑️ API key revoked.', 'warning');
    });
};

// ==========================================
// EVENT DELEGATION — Click handler
// ==========================================
document.addEventListener('click', function (e) {
    // Navigation
    const navItem = e.target.closest('.admin-nav-item');
    if (navItem) { switchPanel(navItem.getAttribute('data-panel')); return; }

    // Close modals by [data-close]
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) { closePopupModal(closeBtn.getAttribute('data-close')); return; }

    // Close modal by clicking backdrop
    const overlay = e.target;
    if (overlay.classList && overlay.classList.contains('modal-overlay') && overlay.classList.contains('active')) {
        overlay.classList.remove('active'); return;
    }

    // Add place button
    if (e.target.closest('#open-add-place-modal')) { openAddPlaceModal(); return; }

    // Edit place
    const editPlaceBtn = e.target.closest('.edit-place-btn');
    if (editPlaceBtn) { openAddPlaceModal(parseInt(editPlaceBtn.getAttribute('data-id'))); return; }

    // Delete place
    const delPlaceBtn = e.target.closest('.delete-place-btn');
    if (delPlaceBtn) {
        const id = parseInt(delPlaceBtn.getAttribute('data-id'));
        const p = adminState.places.find(x => x.id === id);
        confirmAction('Delete Place', `Delete "${p?.name}"? This cannot be undone.`, () => {
            adminState.places = adminState.places.filter(x => x.id !== id);
            renderPlaces();
            renderDashboard();
            logActivity('warning', `Place deleted: ${p?.name}`);
            showToast(`🗑️ Place "${p?.name}" deleted.`, 'warning');
        });
        return;
    }

    // Edit category
    const editCatBtn = e.target.closest('[data-cat-id]');
    if (editCatBtn) {
        const id = parseInt(editCatBtn.getAttribute('data-cat-id'));
        const cat = adminState.categories.find(c => c.id === id);
        const newName = prompt('Edit category name:', cat?.name);
        if (newName && newName.trim()) {
            cat.name = newName.trim();
            renderCategories();
            showToast(`✏️ Category renamed to "${newName}".`);
        }
        return;
    }

    // Delete category
    const delCatBtn = e.target.closest('[data-cat-del-id]');
    if (delCatBtn) {
        const id = parseInt(delCatBtn.getAttribute('data-cat-del-id'));
        const cat = adminState.categories.find(c => c.id === id);
        confirmAction('Delete Category', `Remove category "${cat?.name}"?`, () => {
            adminState.categories = adminState.categories.filter(c => c.id !== id);
            renderCategories();
            showToast(`🗑️ Category "${cat?.name}" removed.`, 'warning');
        });
        return;
    }

    // Add category
    if (e.target.closest('#add-cat-btn')) {
        const name = prompt('New category name:');
        if (!name) return;
        const icon = prompt('Category emoji icon:', '📍');
        adminState.categories.push({ id: adminState.nextCatId++, name: name.trim(), icon: icon || '📍', count: 0 });
        renderCategories();
        showToast(`✅ Category "${name}" added.`);
        return;
    }

    // Toggle user block
    const toggleUserBtn = e.target.closest('.toggle-user-btn');
    if (toggleUserBtn) {
        const uid = parseInt(toggleUserBtn.getAttribute('data-uid'));
        const user = adminState.users.find(u => u.id === uid);
        if (user) {
            const action = user.status === 'active' ? 'block' : 'unblock';
            confirmAction(`${action.charAt(0).toUpperCase() + action.slice(1)} User`, `Are you sure you want to ${action} ${user.name}?`, () => {
                user.status = user.status === 'active' ? 'blocked' : 'active';
                renderUsers();
                logActivity(user.status === 'blocked' ? 'warning' : 'success', `User ${action}ed: ${user.name}`);
                showToast(`${user.status === 'blocked' ? '⛔' : '✅'} ${user.name} ${user.status === 'blocked' ? 'blocked' : 'unblocked'}.`, user.status === 'blocked' ? 'warning' : 'success');
            });
        }
        return;
    }

    // Delete user
    const delUserBtn = e.target.closest('.delete-user-btn');
    if (delUserBtn) {
        const uid = parseInt(delUserBtn.getAttribute('data-uid'));
        const user = adminState.users.find(u => u.id === uid);
        confirmAction('Delete User', `Permanently delete account for "${user?.name}"? Cannot be undone.`, () => {
            adminState.users = adminState.users.filter(u => u.id !== uid);
            renderUsers();
            renderDashboard();
            logActivity('danger', `User account deleted: ${user?.name}`);
            showToast(`🗑️ User "${user?.name}" deleted.`, 'warning');
        });
        return;
    }

    // Highlight review
    const hlRevBtn = e.target.closest('.highlight-rev-btn');
    if (hlRevBtn) {
        const rid = parseInt(hlRevBtn.getAttribute('data-rid'));
        const rev = adminState.reviews.find(r => r.id === rid);
        if (rev) {
            rev.highlighted = !rev.highlighted;
            renderReviews();
            showToast(rev.highlighted ? '🌟 Review highlighted!' : 'Highlight removed.');
        }
        return;
    }

    // Delete review
    const delRevBtn = e.target.closest('.delete-rev-btn');
    if (delRevBtn) {
        const rid = parseInt(delRevBtn.getAttribute('data-rid'));
        const rev = adminState.reviews.find(r => r.id === rid);
        confirmAction('Delete Review', 'Remove this review permanently?', () => {
            adminState.reviews = adminState.reviews.filter(r => r.id !== rid);
            renderReviews();
            renderDashboard();
            logActivity('warning', `Review deleted from ${rev?.place}`);
            showToast('🗑️ Review deleted.', 'warning');
        });
        return;
    }

    // Review filter tabs
    const rfilterTab = e.target.closest('[data-rfilter]');
    if (rfilterTab) {
        document.querySelectorAll('[data-rfilter]').forEach(t => { t.classList.remove('active'); t.style.background = ''; t.style.color = ''; });
        rfilterTab.classList.add('active');
        rfilterTab.style.background = 'var(--accent-primary)';
        rfilterTab.style.color = '#fff';
        reviewFilter = rfilterTab.getAttribute('data-rfilter');
        renderReviews();
        return;
    }

    // Resolve report
    const resolveRepBtn = e.target.closest('.resolve-report-btn');
    if (resolveRepBtn) {
        const rid = parseInt(resolveRepBtn.getAttribute('data-rid'));
        const rep = adminState.reports.find(r => r.id === rid);
        if (rep) {
            rep.status = 'resolved';
            renderReports();
            renderDashboard();
            logActivity('success', `Report resolved: "${rep.title}"`);
            showToast('✅ Report marked as resolved.');
        }
        return;
    }

    // Dismiss report
    const dismissRepBtn = e.target.closest('.dismiss-report-btn');
    if (dismissRepBtn) {
        const rid = parseInt(dismissRepBtn.getAttribute('data-rid'));
        confirmAction('Dismiss Report', 'Remove this report without taking action?', () => {
            adminState.reports = adminState.reports.filter(r => r.id !== rid);
            renderReports();
            showToast('Report dismissed.', 'warning');
        });
        return;
    }

    // Confirm modal — OK
    if (e.target.closest('#confirm-ok-btn')) {
        closePopupModal('confirm-modal');
        if (typeof confirmCallback === 'function') confirmCallback();
        confirmCallback = null;
        return;
    }
    // Confirm modal — Cancel
    if (e.target.closest('#confirm-cancel-btn')) {
        closePopupModal('confirm-modal');
        confirmCallback = null;
        return;
    }

    // Mobile sidebar
    if (e.target.closest('#admin-mobile-menu')) {
        document.getElementById('admin-sidebar').classList.add('open'); return;
    }
    if (e.target.closest('#admin-mobile-close')) {
        document.getElementById('admin-sidebar').classList.remove('open'); return;
    }

    // Logout
    if (e.target.closest('#admin-logout-btn')) { doLogout(); return; }

    // Browse files for content upload
    if (e.target.closest('#browse-media-btn')) {
        document.getElementById('media-upload-input').click(); return;
    }

    // Place form: image file button
    if (e.target.closest('#pf-image-file-btn')) {
        document.getElementById('pf-image-file').click(); return;
    }

    // Toggle password visibility
    if (e.target.closest('#toggle-pw-btn')) {
        const pwInput = document.getElementById('admin-password');
        const icon = document.getElementById('pw-eye-icon');
        if (pwInput.type === 'password') {
            pwInput.type = 'text';
            icon.className = 'ph ph-eye-slash';
        } else {
            pwInput.type = 'password';
            icon.className = 'ph ph-eye';
        }
        return;
    }
});

// ==========================================
// FORM EVENTS
// ==========================================
document.getElementById('admin-login-btn')?.addEventListener('click', doLogin);
document.getElementById('admin-username')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
document.getElementById('admin-password')?.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });

document.getElementById('place-form')?.addEventListener('submit', savePlaceForm);

// Places search & filter
document.getElementById('places-search')?.addEventListener('input', e => renderPlaces(e.target.value));
document.getElementById('places-cat-filter')?.addEventListener('change', () => renderPlaces(document.getElementById('places-search').value));

// User search & filter
document.getElementById('user-search')?.addEventListener('input', e => renderUsers(e.target.value));
document.getElementById('user-status-filter')?.addEventListener('change', () => renderUsers(document.getElementById('user-search').value));

// Media file upload
document.getElementById('media-upload-input')?.addEventListener('change', function (e) {
    const files = Array.from(e.target.files);
    files.forEach(file => {
        const reader = new FileReader();
        reader.onload = ev => {
            const newId = Date.now() + Math.random();
            adminState.media.push({ id: newId, url: ev.target.result, name: file.name });
            renderMedia();
        };
        reader.readAsDataURL(file);
    });
    showToast(`✅ ${files.length} file(s) uploaded!`);
});

// Place form: image file preview
document.getElementById('pf-image-file')?.addEventListener('change', function (e) {
    const file = e.target.files[0];
    if (!file) return;
    document.getElementById('pf-image-filename').textContent = file.name;
    const reader = new FileReader();
    reader.onload = ev => { document.getElementById('pf-image').value = ev.target.result; };
    reader.readAsDataURL(file);
});

// Drag & Drop for media upload zone
const dropZone = document.getElementById('content-drop-zone');
if (dropZone) {
    dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (files.length === 0) { showToast('Only image files are supported.', 'warning'); return; }
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = ev => {
                adminState.media.push({ id: Date.now() + Math.random(), url: ev.target.result, name: file.name });
                renderMedia();
            };
            reader.readAsDataURL(file);
        });
        showToast(`✅ ${files.length} image(s) added!`);
        switchPanel('content');
    });
}

// ==========================================
// INIT
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    // Apply saved theme
    const theme = localStorage.getItem('tourista-theme');
    if (theme === 'light') document.body.classList.add('light-theme');

    if (checkAuth()) {
        document.getElementById('admin-login-screen').style.display = 'none';
        document.getElementById('admin-app').style.display = 'flex';
        onAuthReady();
    }
    // Default: show login
});
