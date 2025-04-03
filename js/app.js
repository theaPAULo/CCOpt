// Initialize the app with enhanced features
function initApp() {
    // Load cards from localStorage or use defaults
    loadCards();
    
    // Render cards
    renderCardsOptimize();
    renderCardsManage();
    
    // Add dark mode toggle
    addDarkModeToggle();

    initAdminAndAds();

    
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

// ===== ADD THIS TO js/app.js =====

// Admin and Ad management
function initAdminAndAds() {
    // Check if user is admin
    const isAdmin = localStorage.getItem('ccOptimizer_isAdmin') === 'true';
    
    // Only show ads for non-admin users
    if (!isAdmin) {
        createAdContainers();
        loadAds();
    }
    
    // Add a hidden admin login functionality
    // This creates a simple keycode sequence detector for admin login
    // Default sequence is 'optimize' (type it when on the site)
    let adminKeySequence = '';
    document.addEventListener('keydown', function(e) {
        adminKeySequence += e.key.toLowerCase();
        
        // Keep only the last 8 characters
        if (adminKeySequence.length > 8) {
            adminKeySequence = adminKeySequence.substring(adminKeySequence.length - 8);
        }
        
        // Check for admin activation sequence
        if (adminKeySequence === 'optimize') {
            toggleAdminStatus();
            adminKeySequence = '';
        }
    });
}

// Toggle admin status
function toggleAdminStatus() {
    const isCurrentlyAdmin = localStorage.getItem('ccOptimizer_isAdmin') === 'true';
    
    if (isCurrentlyAdmin) {
        localStorage.setItem('ccOptimizer_isAdmin', 'false');
        showNotification('Admin mode disabled. Ads will show after refresh.');
    } else {
        // Show a password prompt for additional security
        const password = prompt('Enter admin password:');
        
        // You should replace 'yourSecurePassword' with a strong password
        // In a production environment, consider using a more secure authentication method
        if (password === 'yourSecurePassword') {
            localStorage.setItem('ccOptimizer_isAdmin', 'true');
            showNotification('Admin mode enabled. Ads will be hidden after refresh.');
        } else if (password !== null) {
            showNotification('Incorrect password!', true);
        }
    }
}

// Create ad containers in strategic locations
function createAdContainers() {
    // Top banner ad
    const topAdContainer = document.createElement('div');
    topAdContainer.id = 'top-ad-container';
    topAdContainer.className = 'ad-container';
    topAdContainer.innerHTML = '<div class="ad-label">Advertisement</div><div id="top-ad" class="ad-slot"></div>';
    
    // Insert after header
    const appHeader = document.querySelector('.app-header');
    appHeader.parentNode.insertBefore(topAdContainer, appHeader.nextSibling);
    
    // Side ad (only for desktop)
    if (window.innerWidth >= 1200) {
        const sideAdContainer = document.createElement('div');
        sideAdContainer.id = 'side-ad-container';
        sideAdContainer.className = 'ad-container side-ad';
        sideAdContainer.innerHTML = '<div class="ad-label">Advertisement</div><div id="side-ad" class="ad-slot"></div>';
        
        // Insert to the right of the main container
        const container = document.querySelector('.container');
        const parentElement = container.parentNode;
        
        // Create a wrapper for the layout
        const wrapper = document.createElement('div');
        wrapper.className = 'content-with-ads';
        
        // Move the container inside the wrapper
        parentElement.replaceChild(wrapper, container);
        wrapper.appendChild(container);
        wrapper.appendChild(sideAdContainer);
    }
    
    // Bottom ad
    const bottomAdContainer = document.createElement('div');
    bottomAdContainer.id = 'bottom-ad-container';
    bottomAdContainer.className = 'ad-container';
    bottomAdContainer.innerHTML = '<div class="ad-label">Advertisement</div><div id="bottom-ad" class="ad-slot"></div>';
    
    // Insert at the bottom of the container
    const container = document.querySelector('.container');
    container.appendChild(bottomAdContainer);
}

// Load ads (placeholder for actual ad code)
function loadAds() {
    // This is where you would initialize your ad provider's code
    // For example, with Google AdSense:
    /*
    (adsbygoogle = window.adsbygoogle || []).push({});
    (adsbygoogle = window.adsbygoogle || []).push({});
    (adsbygoogle = window.adsbygoogle || []).push({});
    */
    
    // For now, we'll just add placeholder styling
    document.querySelectorAll('.ad-slot').forEach(slot => {
        slot.innerHTML = 'Ad would appear here';
        slot.style.height = '90px';
        slot.style.backgroundColor = 'rgba(200, 200, 200, 0.3)';
        slot.style.display = 'flex';
        slot.style.justifyContent = 'center';
        slot.style.alignItems = 'center';
        slot.style.fontSize = '0.8rem';
        slot.style.color = 'var(--neutral-500)';
    });
}

document.addEventListener('DOMContentLoaded', function() {
     // Wait for the core app to initialize
     setTimeout(initAdminInterface, 500);
 });

// Add this to your initApp function in app.js

// Initialize the app when the document is fully loaded
document.addEventListener('DOMContentLoaded', initApp);