// ===== CREATE A NEW FILE: js/admin.js =====

/**
 * Admin Interface
 * This file contains functionality for admin users to manage
 * the credit card database and application settings.
 */

// Initialize admin interface
function initAdminInterface() {
    // Check if user is admin
    const isAdmin = localStorage.getItem('ccOptimizer_isAdmin') === 'true';
    
    if (!isAdmin) return; // Only proceed for admin users

    // Create Admin Panel in Manage Cards tab
    createAdminPanel();
    
    // Add Export/Import functionality
    setupExportImport();
    
    // Show admin features
    document.querySelectorAll('.admin-only').forEach(el => {
        el.style.display = 'block';
    });
}

// Create the admin panel inside the manage tab
function createAdminPanel() {
    const manageTabContent = document.getElementById('manage-tab');
    if (!manageTabContent) return;
    
    // Create admin card database panel
    const adminPanel = document.createElement('div');
    adminPanel.className = 'admin-panel admin-only';
    adminPanel.style.display = 'none'; // Hidden by default
    adminPanel.innerHTML = `
        <h2 class="section-title">Admin Controls</h2>
        
        <div class="admin-update-panel">
            <h3>Card Database Management</h3>
            <p>Current database version: <span id="current-db-version">${cardDatabaseVersion.version}</span></p>
            <p>Last updated: <span id="last-db-update">${cardDatabaseVersion.lastUpdated}</span></p>
            
            <div class="admin-update-controls">
                <button id="check-updates" class="btn-secondary">Check for Updates</button>
                <button id="force-update" class="btn-primary">Force Update</button>
                <button id="view-changelog" class="btn-secondary">View Changelog</button>
            </div>
            
            <div id="update-status" class="update-status" style="display: none;"></div>
        </div>
        
        <div class="admin-export-panel admin-update-panel">
            <h3>Export/Import Database</h3>
            <p>Export the current card database or import a new one.</p>
            
            <div class="admin-update-controls">
                <button id="export-cards" class="btn-secondary">Export Cards</button>
                <label for="import-file" class="btn-secondary" style="cursor: pointer;">
                    Import Cards
                    <input type="file" id="import-file" style="display: none;" accept=".json">
                </label>
            </div>
        </div>
        
        <div class="admin-storage-panel admin-update-panel">
            <h3>Storage Management</h3>
            <p>Manage application storage and user data.</p>
            
            <div class="admin-update-controls">
                <button id="clear-storage" class="btn-danger">Clear All User Data</button>
                <button id="storage-stats" class="btn-secondary">Storage Stats</button>
            </div>
        </div>
    `;
    
    // Insert admin panel at the end of the manage tab
    manageTabContent.appendChild(adminPanel);
    
    // Add event listeners
    document.getElementById('check-updates').addEventListener('click', checkForUpdates);
    document.getElementById('force-update').addEventListener('click', forceUpdate);
    document.getElementById('view-changelog').addEventListener('click', viewChangelog);
    document.getElementById('export-cards').addEventListener('click', exportCards);
    document.getElementById('import-file').addEventListener('change', importCards);
    document.getElementById('clear-storage').addEventListener('click', clearAllUserData);
    document.getElementById('storage-stats').addEventListener('click', showStorageStats);
}

// Check for updates
async function checkForUpdates() {
    const updateStatus = document.getElementById('update-status');
    updateStatus.style.display = 'block';
    updateStatus.textContent = 'Checking for updates...';
    
    try {
        const hasUpdate = await window.cardUpdater.checkForUpdates();
        
        if (hasUpdate) {
            updateStatus.textContent = 'Update available! Click "Force Update" to update now.';
            updateStatus.style.color = 'var(--success-color)';
        } else {
            updateStatus.textContent = 'Your card database is up to date.';
            updateStatus.style.color = 'var(--neutral-500)';
        }
    } catch (error) {
        updateStatus.textContent = 'Error checking for updates: ' + error.message;
        updateStatus.style.color = 'var(--danger-color)';
    }
}

// Force update
async function forceUpdate() {
    const updateStatus = document.getElementById('update-status');
    updateStatus.style.display = 'block';
    updateStatus.textContent = 'Updating database...';
    
    try {
        const success = await window.cardUpdater.updateDatabase();
        
        if (success) {
            // Update the version display
            document.getElementById('current-db-version').textContent = cardDatabaseVersion.version;
            document.getElementById('last-db-update').textContent = cardDatabaseVersion.lastUpdated;
            
            updateStatus.textContent = 'Database updated successfully!';
            updateStatus.style.color = 'var(--success-color)';
        } else {
            updateStatus.textContent = 'Update failed. See console for details.';
            updateStatus.style.color = 'var(--danger-color)';
        }
    } catch (error) {
        updateStatus.textContent = 'Error updating database: ' + error.message;
        updateStatus.style.color = 'var(--danger-color)';
    }
}

// View changelog
function viewChangelog() {
    // Create modal for changelog
    const modal = document.createElement('div');
    modal.className = 'modal changelog-modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Card Database Changelog</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <ul class="changelog-list">
                    ${cardDatabaseVersion.changeLog.map(log => `
                        <li class="changelog-item">
                            <div class="changelog-date">${log.date}</div>
                            <p class="changelog-description">${log.description}</p>
                        </li>
                    `).join('')}
                </ul>
            </div>
            <div class="modal-footer">
                <button class="btn-primary changelog-close">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show the modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Add event listeners
    const closeButtons = modal.querySelectorAll('.modal-close, .changelog-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
    });
}

// Export cards to JSON file
function exportCards() {
    // Prepare the data to export
    const exportData = {
        version: cardDatabaseVersion.version,
        lastUpdated: new Date().toISOString().split('T')[0],
        cards: cardsData,
        changeLog: cardDatabaseVersion.changeLog || []
    };
    
    // Convert to JSON
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create a download link
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(jsonString);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `credit-card-database-${exportData.version}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    showNotification("Card database exported successfully");
}

// Import cards from JSON file
function importCards(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // Validate the imported data
            if (!data.version || !Array.isArray(data.cards)) {
                throw new Error("Invalid database format");
            }
            
            // Confirm import
            if (confirm(`Import card database version ${data.version} with ${data.cards.length} cards?`)) {
                // Store user's custom cards before updating
                const userCustomCards = cardsData.filter(card => 
                    !defaultCards.some(defaultCard => defaultCard.id === card.id)
                );
                
                // Update default cards with new data
                defaultCards.length = 0; // Clear the array
                
                // Add all cards from import except user's custom cards
                const importedDefaultCards = data.cards.filter(card => 
                    !userCustomCards.some(customCard => customCard.id === card.id)
                );
                
                importedDefaultCards.forEach(card => defaultCards.push(card));
                
                // Combine default cards with user's custom cards
                cardsData = [...defaultCards, ...userCustomCards];
                
                // Update the version info
                cardDatabaseVersion.version = data.version;
                cardDatabaseVersion.lastUpdated = data.lastUpdated || new Date().toISOString().split('T')[0];
                cardDatabaseVersion.changeLog = data.changeLog || [];
                
                // Update the version display
                document.getElementById('current-db-version').textContent = cardDatabaseVersion.version;
                document.getElementById('last-db-update').textContent = cardDatabaseVersion.lastUpdated;
                
                // Save to localStorage
                saveCardsToStorage();
                
                // Update the UI
                renderCardsOptimize();
                renderCardsManage();
                
                showNotification(`Imported card database version ${data.version}`);
            }
        } catch (error) {
            console.error("Import error:", error);
            showNotification("Failed to import database: " + error.message, true);
        }
        
        // Reset the file input
        event.target.value = '';
    };
    
    reader.readAsText(file);
}

// Clear all user data
function clearAllUserData() {
    if (confirm("WARNING: This will clear ALL user data including saved cards, preferences, and settings. This cannot be undone. Continue?")) {
        if (confirm("Are you REALLY sure? All data will be lost.")) {
            // Clear all localStorage items with our prefix
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('ccOptimizer_') || key === 'creditCards' || key === 'darkMode') {
                    localStorage.removeItem(key);
                }
            });
            
            showNotification("All user data cleared. Reloading page...");
            
            // Reload the page after a short delay
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        }
    }
}

// Show storage stats
function showStorageStats() {
    // Calculate localStorage usage
    let totalBytes = 0;
    let appBytes = 0;
    
    Object.keys(localStorage).forEach(key => {
        const bytes = new Blob([localStorage[key]]).size;
        totalBytes += bytes;
        
        if (key.startsWith('ccOptimizer_') || key === 'creditCards' || key === 'darkMode') {
            appBytes += bytes;
        }
    });
    
    // Show storage stats in a modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2 class="modal-title">Storage Statistics</h2>
                <button class="modal-close">&times;</button>
            </div>
            <div class="modal-body">
                <h3>LocalStorage Usage</h3>
                <p><strong>Total storage used:</strong> ${(totalBytes / 1024).toFixed(2)} KB</p>
                <p><strong>App storage used:</strong> ${(appBytes / 1024).toFixed(2)} KB</p>
                <p><strong>Storage limit:</strong> ~5 MB (varies by browser)</p>
                
                <h3>Data Entries</h3>
                <ul>
                    ${Object.keys(localStorage)
                        .filter(key => key.startsWith('ccOptimizer_') || key === 'creditCards' || key === 'darkMode')
                        .map(key => {
                            const size = new Blob([localStorage[key]]).size;
                            return `<li><strong>${key}:</strong> ${(size / 1024).toFixed(2)} KB</li>`;
                        })
                        .join('')}
                </ul>
            </div>
            <div class="modal-footer">
                <button class="btn-primary storage-close">Close</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Show the modal
    setTimeout(() => {
        modal.classList.add('active');
    }, 10);
    
    // Add event listeners
    const closeButtons = modal.querySelectorAll('.modal-close, .storage-close');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            modal.classList.remove('active');
            setTimeout(() => {
                modal.remove();
            }, 300);
        });
    });
}

// Setup export/import functionality
function setupExportImport() {
    // This function is called from initAdminInterface
    // We've already created the UI elements and attached event handlers
}

// Add this function to your app.js initialization
