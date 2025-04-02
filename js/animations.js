// Create ripple effect for buttons
function createRipple(event) {
    const button = event.currentTarget;
    
    const circle = document.createElement("span");
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    // Get button's position relative to viewport
    const rect = button.getBoundingClientRect();
    
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add("ripple");
    
    // Remove any existing ripple
    const ripple = button.getElementsByClassName("ripple")[0];
    if (ripple) {
        ripple.remove();
    }
    
    button.appendChild(circle);
    
    // Remove the ripple span after animation completes
    setTimeout(() => {
        if (circle) {
            circle.remove();
        }
    }, 600);
}

// Add ripple effect to all buttons
function addRippleToButtons() {
    const buttons = document.getElementsByTagName("button");
    
    for (const button of buttons) {
        button.addEventListener("click", createRipple);
    }
    
    // Also add to dynamically created buttons
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
                for (let i = 0; i < mutation.addedNodes.length; i++) {
                    const node = mutation.addedNodes[i];
                    if (node.nodeType === 1 && node.tagName === 'BUTTON') {
                        node.addEventListener('click', createRipple);
                    }
                    // Check for buttons within the added node
                    if (node.nodeType === 1) {
                        const childButtons = node.getElementsByTagName('BUTTON');
                        for (const button of childButtons) {
                            button.addEventListener('click', createRipple);
                        }
                    }
                }
            }
        });
    });
    
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

// Function to improve card transitions
function enhanceCardTransitions() {
    const cardHeaders = document.querySelectorAll('.card-header');
    
    cardHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const cardDetails = header.nextElementSibling;
            const chevron = header.querySelector('.chevron-icon');
            
            if (cardDetails && cardDetails.classList.contains('card-details')) {
                if (cardDetails.classList.contains('active')) {
                    // Add slide-up animation before removing active class
                    cardDetails.style.maxHeight = '0';
                    cardDetails.style.opacity = '0';
                    
                    if (chevron) {
                        chevron.style.transform = 'rotate(0deg)';
                    }
                    
                    setTimeout(() => {
                        cardDetails.classList.remove('active');
                    }, 300);
                } else {
                    cardDetails.classList.add('active');
                    cardDetails.style.maxHeight = cardDetails.scrollHeight + 'px';
                    cardDetails.style.opacity = '1';
                    
                    if (chevron) {
                        chevron.style.transform = 'rotate(180deg)';
                    }
                }
            }
        });
    });
}

// Function to add scroll animations
function addScrollAnimations() {
    // Only run on devices that support IntersectionObserver
    if (!('IntersectionObserver' in window)) return;
    
    const elementsToAnimate = document.querySelectorAll('.card-item, .result-card, .form-group');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        root: null,
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    elementsToAnimate.forEach(element => {
        observer.observe(element);
    });
}

// Function to add typewriter effect to result card
function addTypewriterEffect() {
    const resultTitle = document.querySelector('.result-title');
    const bestCard = document.querySelector('.best-card');
    const rewardRate = document.querySelector('.reward-rate');
    
    if (!resultTitle || !bestCard || !rewardRate) return;
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'class' && 
                resultCard.classList.contains('active')) {
                
                // Add staggered animation classes
                setTimeout(() => {
                    bestCard.classList.add('typewriter-in');
                }, 100);
                
                setTimeout(() => {
                    rewardRate.classList.add('typewriter-in');
                }, 300);
                
                setTimeout(() => {
                    rewardDetails.classList.add('typewriter-in');
                }, 500);
            }
        });
    });
    
    observer.observe(resultCard, {
        attributes: true
    });
}

// Helper function to add smooth scrolling to all links
function addSmoothScrolling() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Initialize animation features
function initAnimations() {
    addRippleToButtons();
    enhanceCardTransitions();
    addScrollAnimations();
    addTypewriterEffect();
    addSmoothScrolling();
}

// Run animations on DOMContentLoaded
document.addEventListener('DOMContentLoaded', initAnimations);