// DOM Elements
const categorySelect = document.getElementById('category-select');
const customCategoryGroup = document.getElementById('custom-category-group');
const customCategoryInput = document.getElementById('custom-category');
const resultCard = document.getElementById('result-card');
const resultCategory = document.getElementById('result-category');
const bestCardName = document.getElementById('best-card-name');
const rewardRate = document.getElementById('reward-rate');
const rewardDetails = document.getElementById('reward-details');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const cardsListOptimize = document.getElementById('cards-list-optimize');
const cardsListManage = document.getElementById('cards-list-manage');
const addCardButton = document.getElementById('add-card-button');
const resetCardsButton = document.getElementById('reset-cards-button');
const cardModal = document.getElementById('card-modal');
const modalTitle = document.getElementById('modal-title');
const modalClose = document.getElementById('modal-close');
const cardNameInput = document.getElementById('card-name');
const annualFeeInput = document.getElementById('annual-fee');
const notesInput = document.getElementById('notes');
const rewardCategoriesContainer = document.getElementById('reward-categories-container');
const addCategoryButton = document.getElementById('add-category-button');
const saveCardButton = document.getElementById('save-card-button');
const cancelButton = document.getElementById('cancel-button');
const notification = document.getElementById('notification');

// Enhanced renderCardsOptimize function
function renderCardsOptimize() {
    cardsListOptimize.innerHTML = '<h2 class="cards-title">Your Cards</h2>';
    
    cardsData.forEach(card => {
        // Create fee badge based on annual fee
        let feeBadge = '';
        if (card.annualFee > 0) {
            feeBadge = `<span class="badge badge-fee">$${card.annualFee}/yr</span>`;
        } else {
            feeBadge = `<span class="badge badge-success">No Fee</span>`;
        }
        
        const cardElement = document.createElement('div');
        cardElement.className = 'card-item';
        cardElement.innerHTML = `
            <div class="card-header" data-card="${card.id}">
                <div>
                    <span class="card-name">${card.name}</span>
                    ${feeBadge}
                </div>
                <span class="chevron-icon">▼</span>
            </div>
            <div class="card-details" id="${card.id}-details">
                <div class="detail-section">
                    <h4 class="detail-title">Reward Categories:</h4>
                    <ul class="detail-list">
                        ${Object.entries(card.categories).map(([category, details]) => 
                            `<li><span class="capitalize">${category}:</span> <strong>${details.rate}x</strong> - ${details.details}</li>`
                        ).join('')}
                    </ul>
                </div>
                
                <div class="detail-section">
                    <h4 class="detail-title">Annual Fee:</h4>
                    <p>$${card.annualFee}</p>
                </div>
                
                ${card.notes ? `
                <div class="detail-section">
                    <h4 class="detail-title">Notes:</h4>
                    <p>${card.notes}</p>
                </div>
                ` : ''}
            </div>
        `;
        cardsListOptimize.appendChild(cardElement);
        
        // Add click event to toggle details
        const cardHeader = cardElement.querySelector('.card-header');
        cardHeader.addEventListener('click', () => {
            const cardId = cardHeader.getAttribute('data-card');
            toggleCardDetails(cardId);
            toggleChevron(cardHeader.querySelector('.chevron-icon'));
        });
    });
}

// Enhanced renderCardsManage function
function renderCardsManage() {
    cardsListManage.innerHTML = '<h2 class="cards-title">Your Cards</h2>';
    
    cardsData.forEach(card => {
        // Create fee badge based on annual fee
        let feeBadge = '';
        if (card.annualFee > 0) {
            feeBadge = `<span class="badge badge-fee">$${card.annualFee}/yr</span>`;
        } else {
            feeBadge = `<span class="badge badge-success">No Fee</span>`;
        }
        
        const cardElement = document.createElement('div');
        cardElement.className = 'card-item';
        cardElement.innerHTML = `
            <div class="card-header">
                <div>
                    <span class="card-name">${card.name}</span>
                    ${feeBadge}
                </div>
                <div class="card-actions">
                    <button class="edit-card btn-secondary" data-id="${card.id}">Edit</button>
                    <button class="delete-card btn-danger" data-id="${card.id}">Delete</button>
                </div>
            </div>
            
            <div class="card-badges">
                ${Object.keys(card.categories).length > 0 ? `
                    <span class="badge badge-primary">${Object.keys(card.categories).length} Categories</span>
                ` : ''}
                ${card.notes ? `<span class="badge badge-warning">Has Notes</span>` : ''}
            </div>
        `;
        cardsListManage.appendChild(cardElement);
        
        // Add event listeners for edit and delete buttons
        const editButton = cardElement.querySelector('.edit-card');
        const deleteButton = cardElement.querySelector('.delete-card');
        
        editButton.addEventListener('click', (e) => {
            e.stopPropagation();
            openEditCardModal(card.id);
        });
        
        deleteButton.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteCard(card.id);
        });
    });
}

// Handle category selection changes
function handleCategoryChange() {
    const selectedCategory = categorySelect.value;
    
    // Show/hide custom category input
    if (selectedCategory === 'Other') {
        customCategoryGroup.style.display = 'block';
        if (customCategoryInput.value) {
            updateResult(customCategoryInput.value);
        } else {
            resultCard.style.display = 'none';
        }
    } else {
        customCategoryGroup.style.display = 'none';
        if (selectedCategory) {
            updateResult(selectedCategory);
        } else {
            resultCard.style.display = 'none';
        }
    }
}

// Handle custom category input
function handleCustomCategoryInput() {
    if (customCategoryInput.value) {
        updateResult(customCategoryInput.value);
    } else {
        resultCard.style.display = 'none';
    }
}

// Switch tabs
function switchTab(tabId) {
    tabs.forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabId) {
            tab.classList.add('active');
        }
    });
    
    tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === tabId + '-tab') {
            content.classList.add('active');
        }
    });
}

// Open modal to add a new card
function openAddCardModal() {
    modalTitle.textContent = 'Add Credit Card';
    cardNameInput.value = '';
    annualFeeInput.value = '';
    notesInput.value = '';
    rewardCategoriesContainer.innerHTML = '';
    
    // Add a default general category
    addRewardCategory();
    
    // Populate the dropdown with available cards
    populateCardFromPreset();
    
    editingCardId = null;
    cardModal.classList.add('active');
}

// Open modal to edit an existing card
function openEditCardModal(cardId) {
    const card = cardsData.find(c => c.id === cardId);
    if (!card) return;
    
    modalTitle.textContent = 'Edit Credit Card';
    cardNameInput.value = card.name;
    annualFeeInput.value = card.annualFee;
    notesInput.value = card.notes || '';
    rewardCategoriesContainer.innerHTML = '';
    
    // Add existing categories
    Object.entries(card.categories).forEach(([category, details]) => {
        addRewardCategory(category, details.rate, details.details);
    });
    
    editingCardId = cardId;
    cardModal.classList.add('active');
}

// Add a preselected card to the modal
function populateCardFromPreset() {
    const selectCardDropdown = document.getElementById('preset-card-select');
    
    // Only populate if empty to avoid clearing the selection
    if (selectCardDropdown.options.length <= 1) {
        // Clear existing options and add the default 'Custom Card' option
        selectCardDropdown.innerHTML = '<option value="">Custom Card</option>';
        
        // Add all default cards as options
        defaultCards.forEach(card => {
            // Skip cards that are already in the user's collection
            if (!cardsData.some(c => c.id === card.id)) {
                const option = document.createElement('option');
                option.value = card.id;
                option.textContent = card.name;
                selectCardDropdown.appendChild(option);
            }
        });
    }
    
    // Remove previous event listeners by cloning and replacing
    const newSelect = selectCardDropdown.cloneNode(true);
    selectCardDropdown.parentNode.replaceChild(newSelect, selectCardDropdown);
    
    // Add event listener for changes
    newSelect.addEventListener('change', function() {
        const selectedCardId = this.value;
        if (selectedCardId) {
            // Find the selected card
            const selectedCard = defaultCards.find(card => card.id === selectedCardId);
            if (selectedCard) {
                // Populate the form with the selected card's details
                cardNameInput.value = selectedCard.name;
                annualFeeInput.value = selectedCard.annualFee;
                notesInput.value = selectedCard.notes || '';
                
                // Clear existing categories
                rewardCategoriesContainer.innerHTML = '';
                
                // Add categories from the selected card
                Object.entries(selectedCard.categories).forEach(([category, details]) => {
                    addRewardCategory(category, details.rate, details.details);
                });
            }
        } else {
            // Reset form for custom card
            cardNameInput.value = '';
            annualFeeInput.value = '';
            notesInput.value = '';
            rewardCategoriesContainer.innerHTML = '';
            addRewardCategory(); // Add one empty category
        }
    });
}

// Add a new reward category input row with better styling
function addRewardCategory(category = '', rate = 1, details = '') {
    const categoryRow = document.createElement('div');
    categoryRow.className = 'reward-category';
    categoryRow.innerHTML = `
        <input type="text" placeholder="Category" class="category-name" value="${category}">
        <input type="number" min="1" max="100" value="${rate}" class="category-rate">
        <span>x</span>
        <input type="text" placeholder="Details" class="category-details" value="${details}">
        <button class="remove-category btn-secondary">-</button>
    `;
    rewardCategoriesContainer.appendChild(categoryRow);
    
    // Add fade-in animation
    categoryRow.style.opacity = '0';
    categoryRow.style.transform = 'translateY(10px)';
    setTimeout(() => {
        categoryRow.style.transition = 'all 0.3s ease';
        categoryRow.style.opacity = '1';
        categoryRow.style.transform = 'translateY(0)';
    }, 10);
    
    // Add event listener to remove button
    const removeButton = categoryRow.querySelector('.remove-category');
    removeButton.addEventListener('click', (e) => {
        e.preventDefault();
        // Add fade-out animation before removing
        categoryRow.style.opacity = '0';
        categoryRow.style.transform = 'translateY(10px)';
        setTimeout(() => {
            categoryRow.remove();
        }, 300);
    });
}

// Save a card (new or edited)
function saveCard() {
    const name = cardNameInput.value.trim();
    const annualFee = parseInt(annualFeeInput.value) || 0;
    const notes = notesInput.value.trim();
    
    if (!name) {
        alert('Please enter a card name');
        return;
    }
    
    // Get all category inputs
    const categoryRows = rewardCategoriesContainer.querySelectorAll('.reward-category');
    const categories = {};
    
    for (const row of categoryRows) {
        const categoryName = row.querySelector('.category-name').value.trim().toLowerCase();
        const rate = parseInt(row.querySelector('.category-rate').value) || 1;
        const details = row.querySelector('.category-details').value.trim();
        
        if (categoryName) {
            categories[categoryName] = { rate, details };
        }
    }
    
    if (Object.keys(categories).length === 0) {
        alert('Please add at least one reward category');
        return;
    }
    
    // Make sure there's a general/default category
    if (!categories['general']) {
        categories['general'] = { rate: 1, details: '1x on all other purchases' };
    }
    
    // Create or update card
    if (editingCardId) {
        // Update existing card
        const index = cardsData.findIndex(c => c.id === editingCardId);
        if (index !== -1) {
            cardsData[index] = {
                ...cardsData[index],
                name,
                annualFee,
                notes,
                categories
            };
        }
    } else {
        // Add new card
        const newCard = {
            id: 'card-' + Date.now(),
            name,
            annualFee,
            notes,
            categories
        };
        cardsData.push(newCard);
    }
    
    // Save to localStorage and update UI
    saveCardsToStorage();
    renderCardsOptimize();
    renderCardsManage();
    
    closeModal();
    showNotification(editingCardId ? 'Card updated successfully' : 'Card added successfully');
}

// Delete a card
function deleteCard(cardId) {
    if (cardsData.length <= 1) {
        alert('You must have at least one credit card');
        return;
    }
    
    if (confirm('Are you sure you want to delete this card?')) {
        cardsData = cardsData.filter(card => card.id !== cardId);
        saveCardsToStorage();
        renderCardsOptimize();
        renderCardsManage();
        showNotification('Card deleted successfully');
    }
}

// Close the modal
function closeModal() {
    cardModal.classList.remove('active');
    editingCardId = null;
}

// Enhanced updateResult function for better visual feedback
function updateResult(category) {
    const searchCategory = category.toLowerCase();
    
    // Try to map the search category to a standard category
    const mappedCategory = categoryMap[searchCategory] || searchCategory;
    
    // Find the best card for this category
    let bestCard = null;
    let bestRate = 0;
    let bestDetails = '';
    
    cardsData.forEach(card => {
        // Check each category in the card
        for (const [cardCategory, details] of Object.entries(card.categories)) {
            // Check if this category matches or is an alias
            if ((cardCategory === mappedCategory || categoryMap[cardCategory] === mappedCategory) && details.rate > bestRate) {
                bestCard = card.name;
                bestRate = details.rate;
                bestDetails = details.details;
            }
        }
        
        // If no specific category match found, check for general rate
        if (!bestCard && card.categories.general && (bestRate === 0 || card.categories.general.rate > bestRate)) {
            bestCard = card.name;
            bestRate = card.categories.general.rate;
            bestDetails = card.categories.general.details;
        }
    });
    
// Update the UI
if (bestCard) {
    resultCategory.textContent = " " + category;
    bestCardName.textContent = bestCard;
    rewardRate.textContent = bestRate + 'x rewards';
    rewardDetails.textContent = bestDetails;
    
    // Set display block first, then add the active class
    resultCard.style.display = 'block';
    
    // Force reflow to restart animation
    void resultCard.offsetWidth;
    
    // Show with animation
    resultCard.classList.add('active');
} else {
    resultCard.classList.remove('active');
    
    // Hide after animation
    setTimeout(() => {
        if (!resultCard.classList.contains('active')) {
            resultCard.style.display = 'none';
        }
    }, 300);
}
}

// Enhanced toggle card details for smoother animation
function toggleCardDetails(cardId) {
    const detailsElement = document.getElementById(cardId + '-details');
    if (detailsElement) {
        detailsElement.classList.toggle('active');
    }
}

// Updated toggle chevron function
function toggleChevron(chevronElement) {
    if (chevronElement) {
        if (chevronElement.textContent === '▼') {
            chevronElement.textContent = '▲';
        } else {
            chevronElement.textContent = '▼';
        }
    }
}

// Show a notification with enhanced animation
function showNotification(message, isError = false) {
    notification.textContent = message;
    notification.classList.remove('error', 'active');
    
    // Force reflow to restart animation
    void notification.offsetWidth;
    
    if (isError) {
        notification.classList.add('error');
    }
    
    notification.classList.add('active');
    
    // Remove automatically after animation completes
    setTimeout(() => {
        notification.classList.remove('active');
    }, 4000); // Match animation duration
}

// FAB Functionality
function initFAB() {
    const fabButton = document.getElementById('fab-button');
    const fabMenu = document.getElementById('fab-menu');
    const fabAddCard = document.getElementById('fab-add-card');
    const fabResetCards = document.getElementById('fab-reset-cards');
    
    if (!fabButton || !fabMenu || !fabAddCard || !fabResetCards) return;
    
    let fabActive = false;
    
    fabButton.addEventListener('click', () => {
        fabActive = !fabActive;
        
        if (fabActive) {
            fabMenu.classList.add('active');
            fabButton.textContent = '×';
        } else {
            fabMenu.classList.remove('active');
            fabButton.textContent = '+';
        }
    });
    
    // Close FAB menu when clicking outside
    document.addEventListener('click', (e) => {
        if (fabActive && !e.target.closest('.fab-container')) {
            fabActive = false;
            fabMenu.classList.remove('active');
            fabButton.textContent = '+';
        }
    });
    
    fabAddCard.addEventListener('click', () => {
        openAddCardModal();
        fabActive = false;
        fabMenu.classList.remove('active');
        fabButton.textContent = '+';
    });
    
    fabResetCards.addEventListener('click', () => {
        resetToDefaultCards();
        fabActive = false;
        fabMenu.classList.remove('active');
        fabButton.textContent = '+';
    });
}

// Dark mode functionality
function addDarkModeToggle() {
    const appHeader = document.querySelector('.app-header');
    
    // Create the toggle button
    const darkModeToggle = document.createElement('button');
    darkModeToggle.className = 'dark-mode-toggle';
    darkModeToggle.innerHTML = '☀️';
    darkModeToggle.setAttribute('title', 'Toggle Light/Dark Mode');
    
    // Add to header
    appHeader.appendChild(darkModeToggle);
    
    // Add event listener
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Check initial preference
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        darkModeToggle.innerHTML = '🌙';
    }
}

function toggleDarkMode() {
    const darkModeToggle = document.querySelector('.dark-mode-toggle');
    
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'true');
        darkModeToggle.innerHTML = '🌙';
    } else {
        localStorage.setItem('darkMode', 'false');
        darkModeToggle.innerHTML = '☀️';
    }
}