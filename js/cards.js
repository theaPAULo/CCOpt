// Default Credit Card Data
const defaultCards = [
    {
        id: 'chase-sapphire-reserve',
        name: 'Chase Sapphire Reserve',
        annualFee: 550,
        notes: 'Priority Pass, $300 travel credit',
        categories: {
            'travel': { rate: 3, details: '3x points on travel worldwide' },
            'dining': { rate: 3, details: '3x points on dining worldwide' },
            'airfare': { rate: 5, details: '5x on flights through Chase Travel' },
            'hotels': { rate: 10, details: '10x on hotels through Chase Travel' },
            'car rentals': { rate: 10, details: '10x on car rentals through Chase Travel' },
            'general': { rate: 1, details: '1x on all other purchases' }
        }
    },
    {
        id: 'amazon-visa',
        name: 'Amazon Visa',
        annualFee: 0,
        notes: 'Prime membership required for 5% back',
        categories: {
            'amazon': { rate: 5, details: '5% back at Amazon.com (with Prime)' },
            'whole foods': { rate: 5, details: '5% back at Whole Foods (with Prime)' },
            'gas stations': { rate: 2, details: '2% back at gas stations' },
            'restaurants': { rate: 2, details: '2% back at restaurants' },
            'transit': { rate: 2, details: '2% back on transit and commuting' },
            'car rentals': { rate: 1, details: '1% back on car rentals (2% through Chase Travel)' },
            'general': { rate: 1, details: '1% back on all other purchases' }
        }
    },
    {
        id: 'citi-costco',
        name: 'Citi Costco',
        annualFee: 0,
        notes: 'Costco membership required',
        categories: {
            'gas stations': { rate: 4, details: '4% back on gas (up to $7,000/year)' },
            'costco gas': { rate: 4, details: '4% back on Costco gas (up to $7,000/year)' },
            'ev charging': { rate: 4, details: '4% back on EV charging (up to $7,000/year)' },
            'travel': { rate: 3, details: '3% back on eligible travel purchases' },
            'car rentals': { rate: 3, details: '3% back on car rentals' },
            'restaurants': { rate: 3, details: '3% back at restaurants' },
            'costco': { rate: 2, details: '2% back at Costco' },
            'general': { rate: 1, details: '1% back on all other purchases' }
        }
    },
    {
        id: 'amex-platinum',
        name: 'Amex Platinum',
        annualFee: 695,
        notes: 'Centurion lounge access, $200 airline fee credit',
        categories: {
            'airfare': { rate: 5, details: '5x points on flights booked directly with airlines or Amex Travel' },
            'hotels': { rate: 5, details: '5x on prepaid hotels booked with Amex Travel' },
            'car rentals': { rate: 1, details: '1x points on car rentals' },
            'general': { rate: 1, details: '1x points on all other purchases' }
        }
    },
    {
        id: 'amex-gold',
        name: 'Amex Gold Card',
        annualFee: 325,
        notes: '$120 dining credit, $84 Dunkin credit',
        categories: {
            'restaurants': { rate: 4, details: '4x points at restaurants worldwide (up to $50,000/year)' },
            'dining': { rate: 4, details: '4x points at restaurants worldwide (up to $50,000/year)' },
            'supermarkets': { rate: 4, details: '4x points at U.S. supermarkets (up to $25,000/year)' },
            'grocery': { rate: 4, details: '4x points at U.S. supermarkets (up to $25,000/year)' },
            'airfare': { rate: 3, details: '3x points on flights booked directly with airlines or Amex Travel' },
            'travel': { rate: 2, details: '2x on prepaid hotels and other eligible travel through Amex Travel' },
            'general': { rate: 1, details: '1x points on all other purchases' }
        }
    },
    {
        id: 'chase-freedom-unlimited',
        name: 'Chase Freedom Unlimited',
        annualFee: 0,
        notes: 'No annual fee, 0% intro APR offers',
        categories: {
            'travel': { rate: 5, details: '5% back on travel purchased through Chase Travel' },
            'dining': { rate: 3, details: '3% back on dining at restaurants' },
            'restaurants': { rate: 3, details: '3% back on dining at restaurants' },
            'drugstore': { rate: 3, details: '3% back at drugstores' },
            'general': { rate: 1.5, details: '1.5% back on all other purchases' }
        }
    },
    {
        id: 'chase-freedom-flex',
        name: 'Chase Freedom Flex',
        annualFee: 0,
        notes: 'Rotating 5% categories each quarter',
        categories: {
            'quarterly': { rate: 5, details: '5% back in rotating categories (up to $1,500 per quarter)' },
            'travel': { rate: 5, details: '5% back on travel purchased through Chase Travel' },
            'dining': { rate: 3, details: '3% back on dining at restaurants' },
            'restaurants': { rate: 3, details: '3% back on dining at restaurants' },
            'drugstore': { rate: 3, details: '3% back at drugstores' },
            'general': { rate: 1, details: '1% back on all other purchases' }
        }
    },
    {
        id: 'citi-double-cash',
        name: 'Citi Double Cash',
        annualFee: 0,
        notes: 'No annual fee, easy rewards structure',
        categories: {
            'general': { rate: 2, details: '2% back on everything (1% when you buy, 1% when you pay)' }
        }
    },
    {
        id: 'capital-one-venture',
        name: 'Capital One Venture',
        annualFee: 95,
        notes: 'Easy to redeem travel rewards',
        categories: {
            'hotels': { rate: 5, details: '5x miles on hotels and rental cars booked through Capital One Travel' },
            'car rentals': { rate: 5, details: '5x miles on hotels and rental cars booked through Capital One Travel' },
            'general': { rate: 2, details: '2x miles on every purchase' }
        }
    },
    {
        id: 'capital-one-savor',
        name: 'Capital One Savor',
        annualFee: 95,
        notes: 'Great for dining and entertainment',
        categories: {
            'dining': { rate: 4, details: '4% cash back on dining and entertainment' },
            'restaurants': { rate: 4, details: '4% cash back on dining and entertainment' },
            'entertainment': { rate: 4, details: '4% cash back on dining and entertainment' },
            'streaming': { rate: 4, details: '4% cash back on select streaming services' },
            'grocery': { rate: 3, details: '3% cash back at grocery stores' },
            'general': { rate: 1, details: '1% cash back on all other purchases' }
        }
    },
    {
        id: 'discover-it-cash-back',
        name: 'Discover it Cash Back',
        annualFee: 0,
        notes: 'Rotating 5% categories, first year match',
        categories: {
            'quarterly': { rate: 5, details: '5% cash back in rotating categories (up to $1,500 per quarter)' },
            'general': { rate: 1, details: '1% cash back on all other purchases' }
        }
    },
    {
        id: 'wells-fargo-active-cash',
        name: 'Wells Fargo Active Cash',
        annualFee: 0,
        notes: 'Simple flat-rate cash back',
        categories: {
            'general': { rate: 2, details: '2% cash back on all purchases' }
        }
    },
    {
        id: 'blue-cash-preferred',
        name: 'Amex Blue Cash Preferred',
        annualFee: 95,
        notes: 'Great for groceries and streaming',
        categories: {
            'grocery': { rate: 6, details: '6% cash back at U.S. supermarkets (up to $6,000 per year)' },
            'supermarkets': { rate: 6, details: '6% cash back at U.S. supermarkets (up to $6,000 per year)' },
            'streaming': { rate: 6, details: '6% cash back on select U.S. streaming services' },
            'transit': { rate: 3, details: '3% cash back on transit including rideshare' },
            'gas stations': { rate: 3, details: '3% cash back at U.S. gas stations' },
            'general': { rate: 1, details: '1% cash back on other purchases' }
        }
    },
    {
        id: 'bilt-mastercard',
        name: 'Bilt Mastercard',
        annualFee: 0,
        notes: 'Earn points on rent with no fees',
        categories: {
            'dining': { rate: 3, details: '3x points on dining' },
            'restaurants': { rate: 3, details: '3x points on dining' },
            'travel': { rate: 2, details: '2x points on travel' },
            'rent': { rate: 1, details: '1x points on rent payments with no fees (up to 100,000 points/year)' },
            'general': { rate: 1, details: '1x points on other purchases' }
        }
    }
];

// Category mapping
const categoryMap = {
    'restaurants': 'restaurants',
    'dining': 'restaurants',
    'food': 'restaurants',
    'uber eats': 'restaurants',
    'doordash': 'restaurants',
    
    'travel': 'travel',
    'flight': 'airfare',
    'flights': 'airfare',
    'airplane': 'airfare',
    'air': 'airfare',
    'hotel': 'hotels',
    'lodging': 'hotels',
    'car rental': 'car rentals',
    'car rentals': 'car rentals',
    'train': 'transit',
    'subway': 'transit',
    'bus': 'transit',
    'taxi': 'transit',
    'uber': 'transit',
    'lyft': 'transit',
    
    'gas': 'gas stations',
    'fuel': 'gas stations',
    'petrol': 'gas stations',
    
    'amazon': 'amazon',
    'amazon.com': 'amazon',
    'amazon fresh': 'amazon',
    
    'whole foods': 'whole foods',
    
    'costco': 'costco',
    'costco gas': 'costco gas',
    
    'grocery': 'grocery',
    'groceries': 'grocery',
    'supermarket': 'grocery',
    
    'streaming': 'streaming services',
    'netflix': 'streaming services',
    'hulu': 'streaming services',
    'spotify': 'streaming services',
    
    'electric vehicle charging': 'ev charging',
    'ev charging': 'ev charging',
    
    'general': 'general',
    'other': 'general',
    
    'drugstore': 'drugstore',
    'pharmacy': 'drugstore',
    
    'entertainment': 'entertainment',
    'movies': 'entertainment',
    'theater': 'entertainment',
    
    'department store': 'department store',
    'retail': 'department store',
    
    'office supply': 'office supply',
    'stationery': 'office supply',
    
    'home improvement': 'home improvement',
    'hardware': 'home improvement',
    
    'furniture': 'furniture',
    'home goods': 'furniture',
    
    'electronics': 'electronics',
    'tech': 'electronics',
    
    'bookstore': 'bookstore',
    'books': 'bookstore',
    
    'clothing': 'clothing',
    'apparel': 'clothing',
    
    'internet': 'internet',
    'cable': 'internet',
    'phone': 'phone',
    'cell': 'phone',
    'mobile': 'phone',
    
    'utilities': 'utilities',
    'electric': 'utilities',
    'water': 'utilities',
    'gas bill': 'utilities',
    
    'insurance': 'insurance',
    'medical': 'medical',
    'doctor': 'medical',
    'hospital': 'medical',
    
    'education': 'education',
    'school': 'education',
    'tuition': 'education',
    
    'charity': 'charity',
    'donation': 'charity',
    
    'rent': 'rent',
    'mortgage': 'mortgage',
    
    'fitness': 'fitness',
    'gym': 'fitness',
    
    'pet': 'pet',
    'veterinary': 'pet',
    
    'childcare': 'childcare',
    'daycare': 'childcare',
    
    'toy': 'toy',
    'game': 'toy',
    
    'sports': 'sports',
    'outdoor': 'outdoor',
    'camping': 'outdoor',
    
    'automotive': 'automotive',
    'car': 'automotive',
    'vehicle': 'automotive',
    
    'jewelry': 'jewelry',
    'luxury': 'luxury',
    
    'tax': 'tax',
    'accounting': 'tax',
    
    'legal': 'legal',
    'attorney': 'legal',
    
    'art': 'art',
    'crafts': 'art',
    
    'music': 'music',
    'instrument': 'music',
    
    'wedding': 'wedding',
    'gift': 'gift',
    'present': 'gift',
    
    'tobacco': 'tobacco',
    'alcohol': 'alcohol',
    'liquor': 'alcohol',
    'wine': 'alcohol',
    'beer': 'alcohol',
    
    'foreign': 'foreign',
    'international': 'foreign',
};

// State variables
let cardsData = [];
let editingCardId = null;

// Load cards from localStorage or use defaults
function loadCards() {
    const savedCards = localStorage.getItem('creditCards');
    if (savedCards) {
        cardsData = JSON.parse(savedCards);
    } else {
        cardsData = [...defaultCards];
        saveCardsToStorage();
    }
}

// Save cards to localStorage
function saveCardsToStorage() {
    localStorage.setItem('creditCards', JSON.stringify(cardsData));
}

// Reset to default cards
function resetToDefaultCards() {
    if (confirm('Are you sure you want to reset to default cards? This will remove any custom cards you\'ve added.')) {
        cardsData = [...defaultCards];
        saveCardsToStorage();
        renderCardsOptimize();
        renderCardsManage();
        showNotification('Cards reset to defaults');
    }
}

// Add version info to your card database
const cardDatabaseVersion = {
  version: "1.0.0",
  lastUpdated: "2025-03-30",
  changeLog: [
    {date: "2025-03-30", description: "Initial release with 14 cards"}
  ]
};