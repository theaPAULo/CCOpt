// ===== CREATE A NEW FILE: js/admin-review.js =====

/**
 * Admin Review Interface for Automated Updates
 * 
 * This module provides a UI for reviewing and approving/rejecting
 * automated changes to the credit card database.
 */

// Initialize review interface
function initReviewInterface() {
    // Check if user is admin
    const isAdmin = localStorage.getItem('ccOptimizer_isAdmin') === 'true';
    if (!isAdmin) return; // Only available to admins

    // Add review tab to admin panel
    addReviewTab();
    
    // Add event listener for the tab
    document.getElementById('review-tab-button')?.addEventListener('click', loadReviewData);
}

// Save review changes
async function saveReviewChanges() {
    const reviewItems = document.querySelectorAll('.review-item');
    
    const approvedItems = [];
    const rejectedItems = [];
    
    // Collect approved and rejected items
    reviewItems.forEach((item, index) => {
        if (item.classList.contains('approved')) {
            approvedItems.push(index);
        } else if (item.classList.contains('rejected')) {
            rejectedItems.push(index);
        }
    });
    
    // Check if all items have been reviewed
    if (approvedItems.length + rejectedItems.length < reviewItems.length) {
        if (!confirm('Some items have not been approved or rejected. Continue anyway?')) {
            return;
        }
    }
    
    // Show loading state
    const reviewContent = document.getElementById('review-tab-content');
    reviewContent.innerHTML = '<div class="review-loading">Saving changes...</div>';
    
    try {
        // Get the review data from localStorage (for demo)
        const reviewData = JSON.parse(localStorage.getItem('ccOptimizer_reviewData'));
        
        // Get the current database
        const currentDatabase = JSON.parse(JSON.stringify(cardsData));  // Deep clone
        
        // Process approved items
        for (const index of approvedItems) {
            const item = reviewData.items[index];
            
            if (item.isNew) {
                // Add new card
                currentDatabase.push({
                    id: item.id,
                    name: item.name,
                    annualFee: item.extractedData.annualFee,
                    notes: item.extractedData.notes,
                    categories: item.extractedData.categories
                });
            } else {
                // Update existing card
                const cardIndex = currentDatabase.findIndex(card => card.id === item.id);
                if (cardIndex >= 0) {
                    currentDatabase[cardIndex] = {
                        ...currentDatabase[cardIndex],
                        annualFee: item.extractedData.annualFee,
                        notes: item.extractedData.notes,
                        categories: item.extractedData.categories
                    };
                }
            }
        }
        
        // Update cardsData with the processed changes
        cardsData = currentDatabase;
        
        // Save to localStorage
        saveCardsToStorage();
        
        // Update the UI
        renderCardsOptimize();
        renderCardsManage();
        
        // Update version info
        const version = cardDatabaseVersion.version.split('.');
        version[2] = (parseInt(version[2]) + 1).toString(); // Increment patch version
        cardDatabaseVersion.version = version.join('.');
        cardDatabaseVersion.lastUpdated = new Date().toISOString().split('T')[0];
        
        // Add to changelog
        if (!cardDatabaseVersion.changeLog) {
            cardDatabaseVersion.changeLog = [];
        }
        
        cardDatabaseVersion.changeLog.unshift({
            date: cardDatabaseVersion.lastUpdated,
            description: `Updated ${approvedItems.length} card${approvedItems.length !== 1 ? 's' : ''} via automated system`
        });
        
        // Remove the review data (for demo)
        localStorage.removeItem('ccOptimizer_reviewData');
        
        // Show success message
        reviewContent.innerHTML = `
            <div class="review-success">
                <h3>Changes Saved Successfully</h3>
                <p>
                    ${approvedItems.length} card${approvedItems.length !== 1 ? 's' : ''} approved<br>
                    ${rejectedItems.length} card${rejectedItems.length !== 1 ? 's' : ''} rejected
                </p>
                <p>New database version: ${cardDatabaseVersion.version}</p>
                <button id="review-done" class="btn-primary">Done</button>
            </div>
        `;
        
        document.getElementById('review-done')?.addEventListener('click', () => {
            // Switch back to general tab
            const generalTabButton = document.getElementById('general-tab-button');
            if (generalTabButton) {
                generalTabButton.click();
            }
        });
    } catch (error) {
        console.error('Error saving changes:', error);
        reviewContent.innerHTML = `
            <div class="review-error">
                <h3>Error Saving Changes</h3>
                <p>${error.message}</p>
                <button id="retry-save" class="btn-primary">Retry</button>
                <button id="cancel-save" class="btn-secondary">Cancel</button>
            </div>
        `;
        
        document.getElementById('retry-save')?.addEventListener('click', saveReviewChanges);
        document.getElementById('cancel-save')?.addEventListener('click', loadReviewData);
    }
}

// Initialize the admin review interface when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Wait a bit for the core app to initialize
    setTimeout(initReviewInterface, 1000);
});

// Add review tab to admin panel
function addReviewTab() {
    const adminPanel = document.querySelector('.admin-panel');
    if (!adminPanel) return;
    
    // Create a tabbed interface if it doesn't exist
    let tabContainer = adminPanel.querySelector('.admin-tabs');
    
    if (!tabContainer) {
        // Create tab container
        tabContainer = document.createElement('div');
        tabContainer.className = 'admin-tabs';
        
        // Wrap existing content in a tab
        const existingContent = adminPanel.innerHTML;
        adminPanel.innerHTML = '';
        
        // Add tabs
        tabContainer.innerHTML = `
            <div class="admin-tab-buttons">
                <button id="general-tab-button" class="admin-tab-button active">General</button>
                <button id="review-tab-button" class="admin-tab-button">Review Updates</button>
            </div>
            <div class="admin-tab-content">
                <div id="general-tab-content" class="admin-tab-pane active">${existingContent}</div>
                <div id="review-tab-content" class="admin-tab-pane">
                    <div class="review-loading">Loading review data...</div>
                </div>
            </div>
        `;
        
        adminPanel.appendChild(tabContainer);
        
        // Add tab switching logic
        const tabButtons = adminPanel.querySelectorAll('.admin-tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Deactivate all tabs
                tabButtons.forEach(btn => btn.classList.remove('active'));
                adminPanel.querySelectorAll('.admin-tab-pane').forEach(pane => pane.classList.remove('active'));
                
                // Activate the clicked tab
                button.classList.add('active');
                const tabId = button.id.replace('-button', '-content');
                document.getElementById(tabId)?.classList.add('active');
                
                // Load data if review tab
                if (button.id === 'review-tab-button') {
                    loadReviewData();
                }
            });
        });
    } else {
        // Check if review tab already exists
        if (!document.getElementById('review-tab-button')) {
            // Add review tab button
            const tabButtons = tabContainer.querySelector('.admin-tab-buttons');
            const reviewButton = document.createElement('button');
            reviewButton.id = 'review-tab-button';
            reviewButton.className = 'admin-tab-button';
            reviewButton.textContent = 'Review Updates';
            tabButtons.appendChild(reviewButton);
            
            // Add review tab content
            const tabContent = tabContainer.querySelector('.admin-tab-content');
            const reviewContent = document.createElement('div');
            reviewContent.id = 'review-tab-content';
            reviewContent.className = 'admin-tab-pane';
            reviewContent.innerHTML = '<div class="review-loading">Loading review data...</div>';
            tabContent.appendChild(reviewContent);
            
            // Add click event
            reviewButton.addEventListener('click', () => {
                // Deactivate all tabs
                tabContainer.querySelectorAll('.admin-tab-button').forEach(btn => btn.classList.remove('active'));
                tabContainer.querySelectorAll('.admin-tab-pane').forEach(pane => pane.classList.remove('active'));
                
                // Activate review tab
                reviewButton.classList.add('active');
                reviewContent.classList.add('active');
                
                // Load data
                loadReviewData();
            });
        }
    }
}

// Load review data from server
async function loadReviewData() {
    const reviewContent = document.getElementById('review-tab-content');
    if (!reviewContent) return;
    
    reviewContent.innerHTML = '<div class="review-loading">Loading review data...</div>';
    
    try {
        // In a real implementation, you would fetch this from your server
        // For now, we'll use a mock implementation that looks for review files in local storage
        
        // Check if we have any review data in local storage
        const mockReviewData = localStorage.getItem('ccOptimizer_reviewData');
        
        if (mockReviewData) {
            const reviewData = JSON.parse(mockReviewData);
            displayReviewData(reviewData);
        } else {
            // For demo purposes, create some mock review data
            const mockData = createMockReviewData();
            localStorage.setItem('ccOptimizer_reviewData', JSON.stringify(mockData));
            displayReviewData(mockData);
        }
    } catch (error) {
        console.error('Error loading review data:', error);
        reviewContent.innerHTML = `
            <div class="review-error">
                <h3>Error Loading Review Data</h3>
                <p>${error.message}</p>
                <button id="retry-load-review" class="btn-primary">Retry</button>
            </div>
        `;
        
        document.getElementById('retry-load-review')?.addEventListener('click', loadReviewData);
    }
}

// Create mock review data for demonstration
function createMockReviewData() {
    const now = new Date().toISOString();
    
    return {
        timestamp: now,
        totalCards: 14,
        reviewNeeded: 3,
        items: [
            {
                id: 'chase-sapphire-reserve',
                name: 'Chase Sapphire Reserve',
                isNew: false,
                confidence: 0.85,
                changes: [
                    {
                        field: 'annualFee',
                        old: 550,
                        new: 595
                    },
                    {
                        field: 'categories.dining.rate',
                        old: 3,
                        new: 5
                    }
                ],
                reviewReasons: ['Annual fee changed', 'Reward rate changed'],
                extractedData: {
                    annualFee: 595,
                    notes: 'Priority Pass, $300 travel credit',
                    categories: {
                        travel: { rate: 3, details: '3x points on travel worldwide' },
                        dining: { rate: 5, details: '5x points on dining worldwide (increased from 3x)' },
                        airfare: { rate: 5, details: '5x on flights through Chase Travel' },
                        hotels: { rate: 10, details: '10x on hotels through Chase Travel' },
                        car_rentals: { rate: 10, details: '10x on car rentals through Chase Travel' },
                        general: { rate: 1, details: '1x on all other purchases' }
                    },
                    confidence: 0.85,
                    source: {
                        id: 'chase-sapphire-reserve',
                        name: 'Chase Sapphire Reserve',
                        url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/reserve',
                        scrapedAt: now
                    }
                }
            },
            {
                id: 'new-card-2025',
                name: 'Example New Card 2025',
                isNew: true,
                confidence: 0.78,
                changes: [],
                reviewReasons: ['New card added to database'],
                extractedData: {
                    annualFee: 95,
                    notes: 'This is a new card added in the database update',
                    categories: {
                        groceries: { rate: 4, details: '4% back on all grocery purchases' },
                        gas: { rate: 3, details: '3% back at all gas stations' },
                        streaming: { rate: 3, details: '3% back on all streaming services' },
                        general: { rate: 1, details: '1% back on all other purchases' }
                    },
                    confidence: 0.78,
                    source: {
                        id: 'new-card-2025',
                        name: 'Example New Card 2025',
                        url: 'https://example.com/newcard2025',
                        scrapedAt: now
                    }
                }
            },
            {
                id: 'amex-gold',
                name: 'Amex Gold Card',
                isNew: false,
                confidence: 0.65,
                changes: [
                    {
                        field: 'annualFee',
                        old: 325,
                        new: 350
                    },
                    {
                        field: 'notes',
                        old: '$120 dining credit, $84 Dunkin credit',
                        new: '$120 dining credit, $100 travel credit, $10 monthly Uber credit'
                    }
                ],
                reviewReasons: ['Low confidence score: 0.65', 'Annual fee changed', 'Notes changed significantly'],
                extractedData: {
                    annualFee: 350,
                    notes: '$120 dining credit, $100 travel credit, $10 monthly Uber credit',
                    categories: {
                        restaurants: { rate: 4, details: '4x points at restaurants worldwide (up to $50,000/year)' },
                        dining: { rate: 4, details: '4x points at restaurants worldwide (up to $50,000/year)' },
                        supermarkets: { rate: 4, details: '4x points at U.S. supermarkets (up to $25,000/year)' },
                        grocery: { rate: 4, details: '4x points at U.S. supermarkets (up to $25,000/year)' },
                        airfare: { rate: 3, details: '3x points on flights booked directly with airlines or Amex Travel' },
                        travel: { rate: 2, details: '2x on prepaid hotels and other eligible travel through Amex Travel' },
                        general: { rate: 1, details: '1x points on all other purchases' }
                    },
                    confidence: 0.65,
                    source: {
                        id: 'amex-gold',
                        name: 'Amex Gold Card',
                        url: 'https://www.americanexpress.com/us/credit-cards/card/gold-card/',
                        scrapedAt: now
                    }
                }
            }
        ]
    };
}

// Display review data in the UI
function displayReviewData(reviewData) {
    const reviewContent = document.getElementById('review-tab-content');
    if (!reviewContent) return;
    
    // If no items need review
    if (reviewData.reviewNeeded === 0) {
        reviewContent.innerHTML = `
            <div class="review-empty">
                <h3>No Updates to Review</h3>
                <p>All cards are up to date. No changes need review.</p>
                <button id="check-for-updates" class="btn-primary">Check for Updates</button>
            </div>
        `;
        
        document.getElementById('check-for-updates')?.addEventListener('click', () => {
            // In a real implementation, this would trigger a new scrape
            reviewContent.innerHTML = '<div class="review-loading">Checking for updates...</div>';
            setTimeout(() => {
                loadReviewData();
            }, 1500);
        });
        
        return;
    }
    
    // Create review interface
    reviewContent.innerHTML = `
        <div class="review-header">
            <h3>Card Updates to Review</h3>
            <p>
                Last checked: ${new Date(reviewData.timestamp).toLocaleString()}<br>
                ${reviewData.reviewNeeded} of ${reviewData.totalCards} cards need review
            </p>
            <div class="review-actions">
                <button id="approve-all" class="btn-primary">Approve All</button>
                <button id="reject-all" class="btn-secondary">Reject All</button>
            </div>
        </div>
        
        <div class="review-items">
            ${reviewData.items.map((item, index) => createReviewItemHtml(item, index)).join('')}
        </div>
        
        <div class="review-footer">
            <button id="save-review-changes" class="btn-primary">Save All Changes</button>
            <button id="cancel-review-changes" class="btn-secondary">Cancel</button>
        </div>
    `;
    
    // Add event listeners
    document.getElementById('approve-all')?.addEventListener('click', () => {
        document.querySelectorAll('.review-approve').forEach(button => {
            button.click();
        });
    });
    
    document.getElementById('reject-all')?.addEventListener('click', () => {
        document.querySelectorAll('.review-reject').forEach(button => {
            button.click();
        });
    });
    
    document.getElementById('save-review-changes')?.addEventListener('click', saveReviewChanges);
    document.getElementById('cancel-review-changes')?.addEventListener('click', loadReviewData);
    
    // Add individual item event listeners
    reviewData.items.forEach((item, index) => {
        const approveButton = document.getElementById(`review-approve-${index}`);
        const rejectButton = document.getElementById(`review-reject-${index}`);
        const toggleButton = document.getElementById(`review-toggle-${index}`);
        
        approveButton?.addEventListener('click', () => {
            const itemElement = document.getElementById(`review-item-${index}`);
            itemElement.classList.add('approved');
            itemElement.classList.remove('rejected');
        });
        
        rejectButton?.addEventListener('click', () => {
            const itemElement = document.getElementById(`review-item-${index}`);
            itemElement.classList.add('rejected');
            itemElement.classList.remove('approved');
        });
        
        toggleButton?.addEventListener('click', () => {
            const detailsElement = document.getElementById(`review-details-${index}`);
            detailsElement.classList.toggle('active');
            
            // Update toggle button text
            if (detailsElement.classList.contains('active')) {
                toggleButton.textContent = 'Hide Details';
            } else {
                toggleButton.textContent = 'Show Details';
            }
        });
    });
}

// Create HTML for a single review item
function createReviewItemHtml(item, index) {
    const isNew = item.isNew;
    const changes = item.changes || [];
    const reasons = item.reviewReasons || [];
    
    // Create badge for confidence level
    let confidenceBadge = '';
    if (item.confidence < 0.7) {
        confidenceBadge = `<span class="badge badge-danger">Low Confidence: ${(item.confidence * 100).toFixed(0)}%</span>`;
    } else if (item.confidence < 0.9) {
        confidenceBadge = `<span class="badge badge-warning">Medium Confidence: ${(item.confidence * 100).toFixed(0)}%</span>`;
    } else {
        confidenceBadge = `<span class="badge badge-success">High Confidence: ${(item.confidence * 100).toFixed(0)}%</span>`;
    }
    
    // Create badge for new/changed status
    const statusBadge = isNew ? 
        `<span class="badge badge-primary">New Card</span>` : 
        `<span class="badge badge-warning">${changes.length} Change${changes.length !== 1 ? 's' : ''}</span>`;
    
    return `
        <div id="review-item-${index}" class="review-item">
            <div class="review-item-header">
                <div class="review-item-title">
                    <h4>${item.name}</h4>
                    <div class="review-badges">
                        ${statusBadge}
                        ${confidenceBadge}
                    </div>
                </div>
                <div class="review-item-actions">
                    <button id="review-approve-${index}" class="review-approve btn-success">Approve</button>
                    <button id="review-reject-${index}" class="review-reject btn-danger">Reject</button>
                </div>
            </div>
            
            <div class="review-item-summary">
                ${isNew ? 
                    `<p>New card detected. Annual fee: ${item.extractedData.annualFee}.</p>` : 
                    `<p>${changes.length} change${changes.length !== 1 ? 's' : ''} detected:</p>
                    <ul class="change-summary">
                        ${changes.slice(0, 3).map(change => `
                            <li>${formatChangeForDisplay(change)}</li>
                        `).join('')}
                        ${changes.length > 3 ? `<li>...and ${changes.length - 3} more</li>` : ''}
                    </ul>`
                }
                
                <div class="review-reasons">
                    <p>Flagged for review because:</p>
                    <ul>
                        ${reasons.map(reason => `<li>${reason}</li>`).join('')}
                    </ul>
                </div>
                
                <button id="review-toggle-${index}" class="btn-secondary">Show Details</button>
            </div>
            
            <div id="review-details-${index}" class="review-details">
                ${isNew ?
                    createNewCardDetailsHtml(item) :
                    createChangesDetailsHtml(item)
                }
                
                <div class="review-source">
                    <h5>Source Information</h5>
                    <p>Scraped from: <a href="${item.extractedData.source.url}" target="_blank">${item.extractedData.source.url}</a></p>
                    <p>Scraped at: ${new Date(item.extractedData.source.scrapedAt).toLocaleString()}</p>
                </div>
            </div>
        </div>
    `;
}

// Format a single change for display
function formatChangeForDisplay(change) {
    const field = change.field.replace(/^categories\./, '').replace(/\.rate$/, ' rate');
    
    if (change.old === null) {
        return `Added new ${field}: ${change.new}`;
    } else if (change.new === null) {
        return `Removed ${field}`;
    } else {
        return `Changed ${field} from ${change.old} to ${change.new}`;
    }
}

// Create HTML for a new card's details
function createNewCardDetailsHtml(item) {
    const data = item.extractedData;
    
    return `
        <div class="review-new-card">
            <h5>New Card Details</h5>
            
            <div class="card-detail">
                <span class="card-detail-label">Annual Fee:</span>
                <span class="card-detail-value">${data.annualFee}</span>
            </div>
            
            <div class="card-detail">
                <span class="card-detail-label">Notes:</span>
                <span class="card-detail-value">${data.notes || 'None'}</span>
            </div>
            
            <h6>Reward Categories</h6>
            <div class="card-categories">
                ${Object.entries(data.categories || {}).map(([category, details]) => `
                    <div class="card-category">
                        <div class="category-header">
                            <span class="category-name">${category.replace(/^[a-z]/, c => c.toUpperCase())}</span>
                            <span class="category-rate">${details.rate}x</span>
                        </div>
                        <div class="category-details">${details.details || ''}</div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Create HTML for changed card details
function createChangesDetailsHtml(item) {
    const changes = item.changes || [];
    
    // Group changes by type
    const feeChanges = changes.filter(c => c.field === 'annualFee');
    const noteChanges = changes.filter(c => c.field === 'notes');
    const categoryChanges = changes.filter(c => c.field.startsWith('categories.'));
    
    return `
        <div class="review-changes">
            <h5>Detected Changes</h5>
            
            ${feeChanges.length > 0 ? `
                <div class="change-group">
                    <h6>Annual Fee Change</h6>
                    <div class="change-comparison">
                        <div class="change-old">
                            <span class="change-label">Current:</span>
                            <span class="change-value">${feeChanges[0].old}</span>
                        </div>
                        <div class="change-arrow">→</div>
                        <div class="change-new">
                            <span class="change-label">New:</span>
                            <span class="change-value">${feeChanges[0].new}</span>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            ${noteChanges.length > 0 ? `
                <div class="change-group">
                    <h6>Notes Change</h6>
                    <div class="change-comparison">
                        <div class="change-old">
                            <span class="change-label">Current:</span>
                            <span class="change-value">${noteChanges[0].old || 'None'}</span>
                        </div>
                        <div class="change-arrow">→</div>
                        <div class="change-new">
                            <span class="change-label">New:</span>
                            <span class="change-value">${noteChanges[0].new || 'None'}</span>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            ${categoryChanges.length > 0 ? `
                <div class="change-group">
                    <h6>Category Changes</h6>
                    ${categoryChanges.map(change => {
                        const categoryName = change.field.replace(/^categories\./, '').replace(/\.rate$/, '');
                        const isNewCategory = change.old === null;
                        const isRemovedCategory = change.new === null;
                        const isRateChange = change.field.endsWith('.rate');
                        
                        if (isNewCategory) {
                            return `
                                <div class="category-added">
                                    <span class="change-label">Added category:</span>
                                    <span class="category-name">${categoryName}</span>
                                    <span class="category-rate">${change.new.rate}x</span>
                                    <span class="category-details">${change.new.details || ''}</span>
                                </div>
                            `;
                        } else if (isRemovedCategory) {
                            return `
                                <div class="category-removed">
                                    <span class="change-label">Removed category:</span>
                                    <span class="category-name">${categoryName}</span>
                                    <span class="category-rate">${change.old.rate}x</span>
                                    <span class="category-details">${change.old.details || ''}</span>
                                </div>
                            `;
                        } else if (isRateChange) {
                            return `
                                <div class="change-comparison">
                                    <div class="change-old">
                                        <span class="change-label">${categoryName}:</span>
                                        <span class="change-value">${change.old}x</span>
                                    </div>
                                    <div class="change-arrow">→</div>
                                    <div class="change-new">
                                        <span class="change-label">${categoryName}:</span>
                                        <span class="change-value">${change.new}x</span>
                                    </div>
                                </div>
                            `;
                        } else {
                            return `
                                <div class="change-comparison">
                                    <div class="change-old">
                                        <span class="change-label">${categoryName} details:</span>
                                        <span class="change-value">${change.old}</span>
                                    </div>
                                    <div class="change-arrow">→</div>
                                    <div class="change-new">
                                        <span class="change-label">${categoryName} details:</span>
                                        <span class="change-value">${change.new}</span>
                                    </div>
                                </div>
                            `;
                        }
                    }).join('')}
                </div>
            ` : ''}
            
            <div class="all-categories">
                <h6>All Categories (After Changes)</h6>
                <div class="card-categories">
                    ${Object.entries(item.extractedData.categories || {}).map(([category, details]) => `
                        <div class="card-category">
                            <div class="category-header">
                                <span class="category-name">${category.replace(/^[a-z]/, c => c.toUpperCase())}</span>
                                <span class="category-rate">${details.rate}x</span>
                            </div>
                            <div class="category-details">${details.details || ''}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}