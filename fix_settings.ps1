$file = 'd:\1project\index.html'
$content = Get-Content $file -Raw -Encoding UTF8

$newSection = @'
                <!-- Settings / Profile View -->
                <section class="view-section" id="settings">

                    <!-- Profile Tab Nav -->
                    <div class="profile-tab-nav">
                        <button class="profile-tab active" data-tab="tab-profile"><i class="ph ph-user-circle"></i> Profile</button>
                        <button class="profile-tab" data-tab="tab-stats"><i class="ph ph-chart-bar"></i> My Stats</button>
                        <button class="profile-tab" data-tab="tab-reviews"><i class="ph ph-star"></i> My Reviews</button>
                        <button class="profile-tab" data-tab="tab-visited"><i class="ph ph-map-pin"></i> Visited</button>
                        <button class="profile-tab" data-tab="tab-prefs"><i class="ph ph-sliders"></i> Preferences</button>
                        <button class="profile-tab" data-tab="tab-recommend"><i class="ph ph-magic-wand"></i> For You</button>
                        <button class="profile-tab" data-tab="tab-security"><i class="ph ph-lock"></i> Security</button>
                    </div>

                    <!-- TAB: PROFILE -->
                    <div class="profile-tab-content active" id="tab-profile">
                        <div class="profile-hero-card glass-panel">
                            <div class="profile-hero-left">
                                <div class="profile-avatar-wrap">
                                    <img src="https://i.pravatar.cc/150?img=68" alt="Profile Avatar" id="profile-avatar-img">
                                    <label for="avatar-upload" class="avatar-edit-btn" title="Change photo"><i class="ph ph-camera"></i></label>
                                    <input type="file" id="avatar-upload" accept="image/*" style="display:none;">
                                </div>
                                <div class="profile-hero-info">
                                    <h2 id="profile-display-name">Tourist User</h2>
                                    <p id="profile-display-email"><i class="ph ph-envelope"></i> tourist@example.com</p>
                                    <span class="profile-badge"><i class="ph ph-medal"></i> Explorer</span>
                                </div>
                            </div>
                            <div class="profile-hero-right">
                                <div class="profile-mini-stat"><span id="mini-stat-saved">0</span><label>Saved Trips</label></div>
                                <div class="profile-mini-stat"><span id="mini-stat-reviews">3</span><label>Reviews</label></div>
                                <div class="profile-mini-stat"><span id="mini-stat-visited">5</span><label>Visited</label></div>
                            </div>
                        </div>
                        <div class="profile-form-grid">
                            <div class="glass-panel">
                                <h4 class="panel-section-title"><i class="ph ph-pencil-simple" style="color:var(--accent-primary)"></i> Edit Profile</h4>
                                <div class="form-group">
                                    <label>Display Name</label>
                                    <input type="text" id="settings-name" class="settings-input" placeholder="Your name" value="Tourist User">
                                </div>
                                <div class="form-group">
                                    <label>Email Address</label>
                                    <input type="email" id="settings-email" class="settings-input" placeholder="your@email.com" value="tourist@example.com">
                                </div>
                                <div class="form-group">
                                    <label>Bio <span class="optional-tag">Optional</span></label>
                                    <textarea id="settings-bio" class="settings-input" rows="3" placeholder="Tell us about yourself..." style="resize:vertical;"></textarea>
                                </div>
                                <div class="form-group">
                                    <label>Location</label>
                                    <input type="text" id="settings-location" class="settings-input" placeholder="e.g. Ahmedabad, Gujarat">
                                </div>
                                <button class="btn btn-primary w-100" id="save-profile-btn"><i class="ph ph-floppy-disk"></i> Save Profile</button>
                            </div>
                            <div class="glass-panel">
                                <h4 class="panel-section-title"><i class="ph ph-palette" style="color:var(--accent-secondary)"></i> Appearance</h4>
                                <div class="toggle-row">
                                    <div><span class="toggle-label">Dark Theme</span><p class="toggle-desc">Use dark background</p></div>
                                    <label class="switch"><input type="checkbox" id="toggle-dark-theme" checked><span class="slider round"></span></label>
                                </div>
                                <div class="toggle-row">
                                    <div><span class="toggle-label">Animations</span><p class="toggle-desc">Smooth UI transitions</p></div>
                                    <label class="switch"><input type="checkbox" id="toggle-animations" checked><span class="slider round"></span></label>
                                </div>
                                <div class="toggle-row">
                                    <div><span class="toggle-label">Offline Maps</span><p class="toggle-desc">Download for offline use</p></div>
                                    <label class="switch"><input type="checkbox" id="toggle-offline"><span class="slider round"></span></label>
                                </div>
                                <div class="toggle-row">
                                    <div><span class="toggle-label">Push Notifications</span><p class="toggle-desc">Event &amp; trip reminders</p></div>
                                    <label class="switch"><input type="checkbox" id="toggle-notifications" checked><span class="slider round"></span></label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- TAB: MY STATS -->
                    <div class="profile-tab-content" id="tab-stats">
                        <div class="section-header"><h2>My Activity Stats</h2><p>Your Tourista journey at a glance.</p></div>
                        <div class="user-stats-grid">
                            <div class="user-stat-card usc-blue"><div class="usc-icon"><i class="ph ph-bookmarks"></i></div><div class="usc-body"><h3 id="stat-saved-trips">0</h3><p>Trips Saved</p></div></div>
                            <div class="user-stat-card usc-purple"><div class="usc-icon"><i class="ph ph-star"></i></div><div class="usc-body"><h3 id="stat-user-reviews">3</h3><p>Reviews Given</p></div></div>
                            <div class="user-stat-card usc-pink"><div class="usc-icon"><i class="ph ph-map-pin"></i></div><div class="usc-body"><h3 id="stat-places-visited">5</h3><p>Places Visited</p></div></div>
                            <div class="user-stat-card usc-orange"><div class="usc-icon"><i class="ph ph-path"></i></div><div class="usc-body"><h3 id="stat-km-explored">248</h3><p>km Explored</p></div></div>
                        </div>
                        <div class="glass-panel mt-3">
                            <h4 class="panel-section-title"><i class="ph ph-clock-countdown" style="color:var(--accent-primary)"></i> Recent Activity</h4>
                            <ul class="user-activity-timeline">
                                <li class="uat-item"><div class="uat-dot success"></div><div class="uat-body"><strong>Reviewed Sabarmati Riverfront</strong><span>5 stars - "Absolutely stunning at night!"</span></div><span class="uat-time">2 days ago</span></li>
                                <li class="uat-item"><div class="uat-dot primary"></div><div class="uat-body"><strong>Saved trip: Ahmedabad to Gandhinagar</strong><span>Custom route with 2 stops</span></div><span class="uat-time">5 days ago</span></li>
                                <li class="uat-item"><div class="uat-dot warning"></div><div class="uat-body"><strong>Explored Mehsana</strong><span>Discovered 8 attractions via City Explorer</span></div><span class="uat-time">1 week ago</span></li>
                                <li class="uat-item"><div class="uat-dot success"></div><div class="uat-body"><strong>AI Trip Generated to Surat</strong><span>3-day itinerary with 9 places</span></div><span class="uat-time">2 weeks ago</span></li>
                            </ul>
                        </div>
                        <div class="glass-panel mt-3">
                            <h4 class="panel-section-title"><i class="ph ph-star" style="color:#f59e0b"></i> My Rating Distribution</h4>
                            <div class="rating-dist-list">
                                <div class="rating-dist-row"><span>5 stars</span><div class="rdist-bar"><div class="rdist-fill" style="width:60%; background:#f59e0b;"></div></div><span>60%</span></div>
                                <div class="rating-dist-row"><span>4 stars</span><div class="rdist-bar"><div class="rdist-fill" style="width:25%; background:#84cc16;"></div></div><span>25%</span></div>
                                <div class="rating-dist-row"><span>3 stars</span><div class="rdist-bar"><div class="rdist-fill" style="width:10%; background:#22d3ee;"></div></div><span>10%</span></div>
                                <div class="rating-dist-row"><span>2 stars</span><div class="rdist-bar"><div class="rdist-fill" style="width:5%; background:#f97316;"></div></div><span>5%</span></div>
                                <div class="rating-dist-row"><span>1 star</span><div class="rdist-bar"><div class="rdist-fill" style="width:0%; background:#ef4444;"></div></div><span>0%</span></div>
                            </div>
                        </div>
                    </div>

                    <!-- TAB: MY REVIEWS -->
                    <div class="profile-tab-content" id="tab-reviews">
                        <div class="section-header"><h2>My Reviews</h2><p>Places you have rated and commented on.</p></div>
                        <div class="user-reviews-list" id="user-reviews-list">
                            <div class="user-review-card glass-panel">
                                <div class="urev-header">
                                    <div class="urev-place"><i class="ph ph-map-pin" style="color:var(--accent-primary)"></i><div><strong>Sabarmati Riverfront</strong><span>Attraction - Ahmedabad</span></div></div>
                                    <div class="urev-stars">5.0 / 5</div>
                                </div>
                                <p class="urev-text">"Absolutely stunning view at night! The lights reflecting on the water are magical. A must-visit for everyone."</p>
                                <div class="urev-footer"><span><i class="ph ph-clock"></i> 2 days ago</span><button class="btn-link-sm"><i class="ph ph-pencil-simple"></i> Edit</button><button class="btn-link-sm danger"><i class="ph ph-trash"></i> Delete</button></div>
                            </div>
                            <div class="user-review-card glass-panel">
                                <div class="urev-header">
                                    <div class="urev-place"><i class="ph ph-map-pin" style="color:var(--accent-secondary)"></i><div><strong>Adalaj Stepwell</strong><span>Historical - Gandhinagar</span></div></div>
                                    <div class="urev-stars">4.0 / 5</div>
                                </div>
                                <p class="urev-text">"Incredible 15th-century architecture. Very well maintained. Best visited in the morning to avoid crowds."</p>
                                <div class="urev-footer"><span><i class="ph ph-clock"></i> 1 week ago</span><button class="btn-link-sm"><i class="ph ph-pencil-simple"></i> Edit</button><button class="btn-link-sm danger"><i class="ph ph-trash"></i> Delete</button></div>
                            </div>
                            <div class="user-review-card glass-panel">
                                <div class="urev-header">
                                    <div class="urev-place"><i class="ph ph-map-pin" style="color:var(--success)"></i><div><strong>Indroda Nature Park</strong><span>Garden - Gandhinagar</span></div></div>
                                    <div class="urev-stars">5.0 / 5</div>
                                </div>
                                <p class="urev-text">"Perfect for families! The dinosaur fossils section is super educational. Very peaceful environment."</p>
                                <div class="urev-footer"><span><i class="ph ph-clock"></i> 2 weeks ago</span><button class="btn-link-sm"><i class="ph ph-pencil-simple"></i> Edit</button><button class="btn-link-sm danger"><i class="ph ph-trash"></i> Delete</button></div>
                            </div>
                        </div>
                        <button class="btn btn-primary mt-3" id="add-review-btn"><i class="ph ph-plus"></i> Write a New Review</button>
                    </div>

                    <!-- TAB: VISITED PLACES -->
                    <div class="profile-tab-content" id="tab-visited">
                        <div class="section-header"><h2>Visited Places</h2><p>Cities and attractions you have explored on Tourista.</p></div>
                        <div class="visited-cities-grid" id="visited-cities-grid">
                            <div class="visited-city-card"><div class="vcc-flag">Ahmedabad</div><div class="vcc-info"><strong>Ahmedabad</strong><span>4 places explored</span></div><div class="vcc-date">Mar 2026</div></div>
                            <div class="visited-city-card"><div class="vcc-flag">Gandhinagar</div><div class="vcc-info"><strong>Gandhinagar</strong><span>2 places explored</span></div><div class="vcc-date">Feb 2026</div></div>
                            <div class="visited-city-card"><div class="vcc-flag">Mehsana</div><div class="vcc-info"><strong>Mehsana</strong><span>3 places explored</span></div><div class="vcc-date">Jan 2026</div></div>
                            <div class="visited-city-card"><div class="vcc-flag">Surat</div><div class="vcc-info"><strong>Surat</strong><span>1 place explored</span></div><div class="vcc-date">Dec 2025</div></div>
                            <div class="visited-city-card"><div class="vcc-flag">Vadodara</div><div class="vcc-info"><strong>Vadodara</strong><span>2 places explored</span></div><div class="vcc-date">Nov 2025</div></div>
                            <div class="visited-city-card add-city-card" id="add-visited-city-btn"><div class="vcc-flag">+</div><div class="vcc-info"><strong>Add City</strong><span>Mark a visit</span></div></div>
                        </div>
                        <div class="glass-panel mt-3">
                            <h4 class="panel-section-title"><i class="ph ph-fire" style="color:#f59e0b"></i> Top Visited Attractions</h4>
                            <div class="top-visited-list">
                                <div class="tv-item"><span class="tv-rank">1</span><div class="tv-details"><strong>Sabarmati Riverfront</strong><span>Ahmedabad - Attraction</span></div><span class="tv-visits">3 visits</span></div>
                                <div class="tv-item"><span class="tv-rank">2</span><div class="tv-details"><strong>Adalaj Stepwell</strong><span>Gandhinagar - Historical</span></div><span class="tv-visits">2 visits</span></div>
                                <div class="tv-item"><span class="tv-rank">3</span><div class="tv-details"><strong>Indroda Nature Park</strong><span>Gandhinagar - Garden</span></div><span class="tv-visits">2 visits</span></div>
                                <div class="tv-item"><span class="tv-rank">4</span><div class="tv-details"><strong>Calico Museum</strong><span>Ahmedabad - Museum</span></div><span class="tv-visits">1 visit</span></div>
                            </div>
                        </div>
                    </div>

                    <!-- TAB: PREFERENCES -->
                    <div class="profile-tab-content" id="tab-prefs">
                        <div class="section-header"><h2>My Preferences</h2><p>Customize your experience for better recommendations.</p></div>
                        <div class="prefs-grid">
                            <div class="glass-panel">
                                <h4 class="panel-section-title"><i class="ph ph-tag" style="color:var(--accent-primary)"></i> Preferred Categories</h4>
                                <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1rem;">Select what types of places you love most.</p>
                                <div class="prefs-categories-grid" id="prefs-categories">
                                    <button class="pref-cat-btn active" data-cat="attraction">Attraction</button>
                                    <button class="pref-cat-btn" data-cat="restaurant">Restaurant</button>
                                    <button class="pref-cat-btn active" data-cat="cafe">Cafe</button>
                                    <button class="pref-cat-btn" data-cat="hotel">Hotel</button>
                                    <button class="pref-cat-btn active" data-cat="garden">Garden</button>
                                    <button class="pref-cat-btn" data-cat="museum">Museum</button>
                                    <button class="pref-cat-btn" data-cat="temple">Temple</button>
                                    <button class="pref-cat-btn active" data-cat="historical">Historical</button>
                                </div>
                            </div>
                            <div class="glass-panel">
                                <h4 class="panel-section-title"><i class="ph ph-currency-inr" style="color:var(--success)"></i> Budget Preference</h4>
                                <div class="budget-options" id="budget-options">
                                    <button class="budget-btn active" data-budget="budget">Budget</button>
                                    <button class="budget-btn" data-budget="mid">Mid-Range</button>
                                    <button class="budget-btn" data-budget="luxury">Luxury</button>
                                </div>
                                <h4 class="panel-section-title" style="margin-top:1.5rem;"><i class="ph ph-map-trifold" style="color:var(--accent-secondary)"></i> Search Radius</h4>
                                <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:0.75rem;">Max distance for nearby suggestions.</p>
                                <div style="display:flex; align-items:center; gap:1rem;">
                                    <input type="range" id="pref-radius" min="1" max="50" value="15" style="flex:1;">
                                    <span id="pref-radius-val" style="font-weight:700; color:var(--accent-primary); min-width:55px;">15 km</span>
                                </div>
                                <h4 class="panel-section-title" style="margin-top:1.5rem;"><i class="ph ph-translate" style="color:var(--warning)"></i> Language</h4>
                                <select class="settings-input" id="pref-language" style="cursor:pointer;">
                                    <option value="en" selected>English</option>
                                    <option value="hi">Hindi</option>
                                    <option value="gu">Gujarati</option>
                                </select>
                                <button class="btn btn-primary w-100" id="save-prefs-btn" style="margin-top:1rem;"><i class="ph ph-floppy-disk"></i> Save Preferences</button>
                            </div>
                        </div>
                    </div>

                    <!-- TAB: FOR YOU (RECOMMENDATIONS) -->
                    <div class="profile-tab-content" id="tab-recommend">
                        <div class="section-header"><h2>Recommended For You</h2><p>Smart suggestions based on your preferences and travel history.</p></div>
                        <div class="rec-section">
                            <div class="rec-section-header"><h4>Best Cafes Near Ahmedabad</h4><span class="rec-badge">Based on your preferences</span></div>
                            <div class="rec-cards-row">
                                <div class="rec-card glass-panel"><div class="rec-card-img" style="background:linear-gradient(135deg,#6366f1,#a855f7);">C</div><div class="rec-card-body"><strong>Cafe Shockolat</strong><span>CG Road, Ahmedabad</span><div class="rec-rating">4.7 stars - Cafe - 2.1 km</div></div><button class="rec-explore-btn">Explore</button></div>
                                <div class="rec-card glass-panel"><div class="rec-card-img" style="background:linear-gradient(135deg,#f59e0b,#ef4444);">C</div><div class="rec-card-body"><strong>The Grand Trunk</strong><span>Maninagar, Ahmedabad</span><div class="rec-rating">4.5 stars - Cafe - 4.3 km</div></div><button class="rec-explore-btn">Explore</button></div>
                                <div class="rec-card glass-panel"><div class="rec-card-img" style="background:linear-gradient(135deg,#10b981,#22d3ee);">C</div><div class="rec-card-body"><strong>House of MG Cafe</strong><span>Old City, Ahmedabad</span><div class="rec-rating">4.9 stars - Cafe - 5.8 km</div></div><button class="rec-explore-btn">Explore</button></div>
                            </div>
                        </div>
                        <div class="rec-section">
                            <div class="rec-section-header"><h4>Top Rated Hotels</h4><span class="rec-badge">Based on your budget</span></div>
                            <div class="rec-cards-row">
                                <div class="rec-card glass-panel"><div class="rec-card-img" style="background:linear-gradient(135deg,#a855f7,#ec4899);">H</div><div class="rec-card-body"><strong>Hyatt Regency</strong><span>SG Highway, Ahmedabad</span><div class="rec-rating">4.8 stars - Luxury Hotel</div></div><button class="rec-explore-btn">Explore</button></div>
                                <div class="rec-card glass-panel"><div class="rec-card-img" style="background:linear-gradient(135deg,#3b82f6,#6366f1);">H</div><div class="rec-card-body"><strong>Taj Skyline</strong><span>Vastrapur, Ahmedabad</span><div class="rec-rating">4.6 stars - Mid-Range Hotel</div></div><button class="rec-explore-btn">Explore</button></div>
                                <div class="rec-card glass-panel"><div class="rec-card-img" style="background:linear-gradient(135deg,#f59e0b,#84cc16);">H</div><div class="rec-card-body"><strong>Lemon Tree</strong><span>Bodakdev, Ahmedabad</span><div class="rec-rating">4.3 stars - Budget Hotel</div></div><button class="rec-explore-btn">Explore</button></div>
                            </div>
                        </div>
                        <div class="rec-section">
                            <div class="rec-section-header"><h4>Must-Visit Attractions</h4><span class="rec-badge">Because you have not been</span></div>
                            <div class="rec-cards-row">
                                <div class="rec-card glass-panel"><div class="rec-card-img" style="background:linear-gradient(135deg,#ef4444,#f97316);">M</div><div class="rec-card-body"><strong>Sidi Saiyyed Mosque</strong><span>Ahmedabad Old City</span><div class="rec-rating">4.9 stars - Historical</div></div><button class="rec-explore-btn">Explore</button></div>
                                <div class="rec-card glass-panel"><div class="rec-card-img" style="background:linear-gradient(135deg,#22d3ee,#3b82f6);">M</div><div class="rec-card-body"><strong>Sardar Patel Museum</strong><span>Shahibaug, Ahmedabad</span><div class="rec-rating">4.4 stars - Museum</div></div><button class="rec-explore-btn">Explore</button></div>
                                <div class="rec-card glass-panel"><div class="rec-card-img" style="background:linear-gradient(135deg,#84cc16,#10b981);">L</div><div class="rec-card-body"><strong>Vastrapur Lake</strong><span>Vastrapur, Ahmedabad</span><div class="rec-rating">4.6 stars - Lake</div></div><button class="rec-explore-btn">Explore</button></div>
                            </div>
                        </div>
                    </div>

                    <!-- TAB: SECURITY -->
                    <div class="profile-tab-content" id="tab-security">
                        <div class="section-header"><h2>Security and Account</h2><p>Manage your password and account security.</p></div>
                        <div class="security-two-col">
                            <div class="glass-panel">
                                <h4 class="panel-section-title"><i class="ph ph-key" style="color:var(--accent-primary)"></i> Change Password</h4>
                                <div class="form-group"><label>Current Password</label><input type="password" class="settings-input" id="user-curr-pw" placeholder="Current password"></div>
                                <div class="form-group"><label>New Password</label><input type="password" class="settings-input" id="user-new-pw" placeholder="New password (min 8 chars)"></div>
                                <div class="form-group"><label>Confirm Password</label><input type="password" class="settings-input" id="user-confirm-pw" placeholder="Confirm new password"></div>
                                <div class="pass-strength-wrap" id="user-pass-strength" style="display:none;">
                                    <div class="user-strength-bar"><div id="user-strength-fill"></div></div>
                                    <span id="user-strength-label" style="font-size:0.82rem;">Weak</span>
                                </div>
                                <button class="btn btn-primary w-100" id="user-change-pw-btn"><i class="ph ph-lock-key"></i> Update Password</button>
                            </div>
                            <div class="glass-panel">
                                <h4 class="panel-section-title"><i class="ph ph-shield-warning" style="color:var(--warning)"></i> Account Actions</h4>
                                <p style="color:var(--text-secondary); font-size:0.875rem; margin-bottom:1.5rem;">Manage your account data and session.</p>
                                <div class="account-action-item">
                                    <div><strong>Export My Data</strong><p>Download all your trips, reviews, and history</p></div>
                                    <button class="btn btn-secondary" id="export-data-btn"><i class="ph ph-download-simple"></i> Export</button>
                                </div>
                                <div class="account-action-item">
                                    <div><strong>Clear Saved Trips</strong><p>Remove all locally saved trips from this device</p></div>
                                    <button class="btn btn-secondary" id="clear-trips-btn"><i class="ph ph-trash"></i> Clear</button>
                                </div>
                                <div class="account-action-item danger-action">
                                    <div><strong>Sign Out</strong><p>End your current session on this device</p></div>
                                    <button class="btn btn-danger-outline" id="user-logout-btn"><i class="ph ph-sign-out"></i> Logout</button>
                                </div>
                            </div>
                        </div>
                    </div>

                </section>
'@

# Find Settings section start and the next section start
$startTag = '                <!-- Settings View -->'
$endTag = '                <!-- Admin View -->'

$startIdx = $content.IndexOf($startTag)
$endIdx = $content.IndexOf($endTag)

if ($startIdx -lt 0) { Write-Error "Could not find settings start tag"; exit 1 }
if ($endIdx -lt 0) { Write-Error "Could not find admin section tag"; exit 1 }

$before = $content.Substring(0, $startIdx)
$after = $content.Substring($endIdx)

$newContent = $before + $newSection + "`r`n`r`n                " + $after

[System.IO.File]::WriteAllText($file, $newContent, [System.Text.Encoding]::UTF8)
Write-Host "Done! Settings section replaced successfully."
