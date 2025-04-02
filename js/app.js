// Initialize the app with enhanced features
function initApp() {
    // Load cards from localStorage or use defaults
    loadCards();
    
    // Render cards
    renderCardsOptimize();
    renderCardsManage();
    
    // Add dark mode toggle
    addDarkModeToggle();
    
    // Add event listeners
    categorySelect.addEventListener('change', handleCategoryChange);
    customCategoryInput.addEventListener('input', handleCustomCategoryInput);
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            switchTab(tab.getAttribute('data-tab'));
        });
    });
    
    addCardButton.addEventListener('click', openAddCardModal);
    resetCardsButton.addEventListener('click', resetToDefaultCards);
    modalClose.addEventListener('click', closeModal);
    addCategoryButton.addEventListener('click', () => addRewardCategory());
    saveCardButton.addEventListener('click', saveCard);
    cancelButton.addEventListener('click', closeModal);
    
    // Initialize Floating Action Button for mobile
    initFAB();
    
    // Check for URL parameters to auto-select category
    const urlParams = new URLSearchParams(window.location.search);
    const categoryParam = urlParams.get('category');
    if (categoryParam) {
        // Find matching option or select "Other"
        const option = Array.from(categorySelect.options).find(opt => 
            opt.value.toLowerCase() === categoryParam.toLowerCase()
        );
        
        if (option) {
            option.selected = true;
            handleCategoryChange();
        } else {
            // Select "Other" and fill in custom value
            categorySelect.value = "Other";
            customCategoryInput.value = categoryParam;
            handleCategoryChange();
            handleCustomCategoryInput();
        }
    }
    
    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape key closes modal
        if (e.key === 'Escape' && cardModal.classList.contains('active')) {
            closeModal();
        }
        
        // Alt+N to add new card
        if (e.key === 'n' && e.altKey) {
            openAddCardModal();
        }
        
        // Alt+1 to switch to Optimize tab
        if (e.key === '1' && e.altKey) {
            switchTab('optimize');
        }
        
        // Alt+2 to switch to Manage tab
        if (e.key === '2' && e.altKey) {
            switchTab('manage');
        }
    });
    
    // Add version info to footer
    addVersionInfo();
}

// Add version info to the page
function addVersionInfo() {
    // Create a footer if it doesn't exist
    let footer = document.querySelector('footer');
    if (!footer) {
        footer = document.createElement('footer');
        footer.style.textAlign = 'center';
        footer.style.padding = '1rem';
        footer.style.marginTop = '2rem';
        footer.style.fontSize = '0.75rem';
        footer.style.color = 'var(--neutral-500)';
        document.body.appendChild(footer);
    }
    
    // Add version info to footer
    footer.innerHTML = `
        <p>Credit Card Optimizer v${cardDatabaseVersion.version} | Last Updated: ${cardDatabaseVersion.lastUpdated}</p>
        <p>Card Database: ${cardsData.length} cards available</p>
    `;
}

// Function to share a card via URL
function shareCardCategory(category) {
    const url = new URL(window.location.href);
    url.searchParams.set('category', category);
    
    // Create temporary input to copy URL
    const tempInput = document.createElement('input');
    document.body.appendChild(tempInput);
    tempInput.value = url.toString();
    tempInput.select();
    document.execCommand('copy');
    document.body.removeChild(tempInput);
    
    showNotification(`Link to "${category}" copied to clipboard!`);
}

// Initialize the app when the document is fully loaded
document.addEventListener('DOMContentLoaded', initApp);