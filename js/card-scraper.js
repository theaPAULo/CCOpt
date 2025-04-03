// ===== CREATE A NEW FILE: server/card-scraper.js =====

/**
 * Credit Card Database Automated Update System
 * 
 * This Node.js script automates the process of updating the credit card database by:
 * 1. Scraping credit card information from official bank websites
 * 2. Using Claude API to extract and structure the data
 * 3. Comparing with existing database to identify changes
 * 4. Flagging items that need human review
 * 5. Generating an updated database file
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const puppeteer = require('puppeteer');
const { Anthropic } = require('@anthropic-ai/sdk');

// Initialize Claude API client
const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY, // Set this in your environment variables
});

// Configuration
const CONFIG = {
  outputPath: path.join(__dirname, '../api/cards-database.json'),
  currentDatabasePath: path.join(__dirname, '../api/cards-database.json'),
  logPath: path.join(__dirname, 'logs/update-log.json'),
  cardSources: [
    {
      id: 'chase-sapphire-reserve',
      name: 'Chase Sapphire Reserve',
      url: 'https://creditcards.chase.com/rewards-credit-cards/sapphire/reserve',
      selector: '.benefit-category', // CSS selector for relevant content
    },
    {
      id: 'amex-platinum',
      name: 'Amex Platinum',
      url: 'https://www.americanexpress.com/us/credit-cards/card/platinum/',
      selector: '.benefits-section', // CSS selector for relevant content
    },
    // Add more cards here...
  ],
  reviewThreshold: 0.7, // Confidence threshold below which human review is flagged
};

// Load the current database
async function loadCurrentDatabase() {
  try {
    const data = fs.readFileSync(CONFIG.currentDatabasePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading current database:', error);
    // Return a template if database doesn't exist yet
    return {
      version: "0.0.0",
      lastUpdated: new Date().toISOString().split('T')[0],
      changeLog: [],
      cards: []
    };
  }
}

// Scrape card information from a website
async function scrapeCardInfo(source) {
  console.log(`Scraping ${source.name} from ${source.url}`);
  
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    await page.goto(source.url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    // Wait for the content to load
    await page.waitForSelector(source.selector, { timeout: 30000 });
    
    // Extract the relevant content
    const content = await page.evaluate((selector) => {
      const elements = document.querySelectorAll(selector);
      return Array.from(elements).map(el => el.textContent).join('\n');
    }, source.selector);
    
    // Extract additional information like annual fee, etc.
    const annualFeeText = await page.evaluate(() => {
      // This selector might need adjustment for each website
      const feeElement = document.querySelector('*:contains("annual fee")');
      return feeElement ? feeElement.textContent : '';
    });
    
    await browser.close();
    
    return {
      rawContent: content,
      annualFeeText: annualFeeText,
      url: source.url,
      timestamp: new Date().toISOString()
    };
    
  } catch (error) {
    console.error(`Error scraping ${source.name}:`, error);
    await browser.close();
    return null;
  }
}

// Use Claude API to extract structured data from scraped content
async function extractCardData(source, scrapedData) {
  if (!scrapedData) return null;
  
  console.log(`Analyzing data for ${source.name} with Claude API`);
  
  try {
    const prompt = `
    I need to extract credit card reward information from this website content. 
    The content is from ${source.name} (${source.url}).
    
    Here's the raw text content:
    ---
    ${scrapedData.rawContent}
    ---
    
    Additional text about annual fee:
    ---
    ${scrapedData.annualFeeText}
    ---
    
    Please extract the following information in JSON format:
    1. Annual fee (as a number without the $ sign)
    2. All reward categories and their rates (e.g. "dining": 3x points)
    3. Any special notes or important features
    
    Format your response as a valid JSON object with the following structure:
    {
      "annualFee": number,
      "notes": "string with important features",
      "categories": {
        "category1": { "rate": number, "details": "string with details" },
        "category2": { "rate": number, "details": "string with details" }
      },
      "confidence": number from 0-1 indicating how confident you are in this extraction,
      "needsReview": boolean indicating if human review is needed,
      "reviewReasons": ["reason1", "reason2"]
    }
    
    Only output valid JSON, no other text.
    `;
    
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4000,
      temperature: 0,
      system: "You are an expert at extracting information about credit card rewards from website content. Your task is to accurately parse the information and structure it as requested.",
      messages: [{ role: "user", content: prompt }]
    });
    
    // Parse the JSON response
    const extractedText = response.content[0].text;
    const extractedData = JSON.parse(extractedText);
    
    // Add metadata
    extractedData.source = {
      id: source.id,
      name: source.name,
      url: source.url,
      scrapedAt: scrapedData.timestamp
    };
    
    // Auto-flag for review if confidence is below threshold
    if (extractedData.confidence < CONFIG.reviewThreshold) {
      extractedData.needsReview = true;
      if (!extractedData.reviewReasons) {
        extractedData.reviewReasons = [];
      }
      extractedData.reviewReasons.push(`Low confidence score: ${extractedData.confidence}`);
    }
    
    return extractedData;
    
  } catch (error) {
    console.error(`Error extracting data for ${source.name}:`, error);
    return null;
  }
}

// Compare new data with existing database to identify changes
function compareWithExisting(cardId, newData, currentDatabase) {
  const existingCard = currentDatabase.cards.find(card => card.id === cardId);
  
  if (!existingCard) {
    return {
      isNew: true,
      changes: [],
      needsReview: true,
      reviewReasons: ['New card added to database']
    };
  }
  
  const changes = [];
  
  // Check annual fee changes
  if (existingCard.annualFee !== newData.annualFee) {
    changes.push({
      field: 'annualFee',
      old: existingCard.annualFee,
      new: newData.annualFee
    });
  }
  
  // Check category changes
  const existingCategories = existingCard.categories || {};
  const newCategories = newData.categories || {};
  
  // Check for added or modified categories
  for (const [category, details] of Object.entries(newCategories)) {
    if (!existingCategories[category]) {
      changes.push({
        field: `categories.${category}`,
        old: null,
        new: details
      });
    } else if (existingCategories[category].rate !== details.rate) {
      changes.push({
        field: `categories.${category}.rate`,
        old: existingCategories[category].rate,
        new: details.rate
      });
    }
  }
  
  // Check for removed categories
  for (const category of Object.keys(existingCategories)) {
    if (!newCategories[category]) {
      changes.push({
        field: `categories.${category}`,
        old: existingCategories[category],
        new: null
      });
    }
  }
  
  // Check notes changes
  if (existingCard.notes !== newData.notes) {
    changes.push({
      field: 'notes',
      old: existingCard.notes,
      new: newData.notes
    });
  }
  
  // Determine if human review is needed based on changes
  const significantChanges = changes.filter(change => 
    change.field === 'annualFee' || 
    change.field.startsWith('categories.')
  );
  
  const needsReview = significantChanges.length > 0 || newData.needsReview;
  
  const reviewReasons = [
    ...(newData.reviewReasons || []),
    ...(significantChanges.length > 0 ? [`${significantChanges.length} significant changes detected`] : [])
  ];
  
  return {
    isNew: false,
    changes,
    needsReview,
    reviewReasons
  };
}

// Generate an updated database file
function generateUpdatedDatabase(currentDatabase, extractedDataList, comparisons) {
  const now = new Date().toISOString().split('T')[0];
  
  // Create a copy of the current database
  const updatedDatabase = JSON.parse(JSON.stringify(currentDatabase));
  
  // Update version
  const versionParts = updatedDatabase.version.split('.');
  versionParts[2] = (parseInt(versionParts[2]) + 1).toString(); // Increment patch version
  updatedDatabase.version = versionParts.join('.');
  
  // Update lastUpdated
  updatedDatabase.lastUpdated = now;
  
  // Add to changeLog
  updatedDatabase.changeLog.unshift({
    date: now,
    description: `Automated update - ${extractedDataList.length} cards checked`
  });
  
  // Update cards
  for (let i = 0; i < extractedDataList.length; i++) {
    const extractedData = extractedDataList[i];
    if (!extractedData) continue;
    
    const source = CONFIG.cardSources[i];
    const comparison = comparisons[i];
    
    if (comparison.isNew) {
      // Add new card
      updatedDatabase.cards.push({
        id: source.id,
        name: source.name,
        annualFee: extractedData.annualFee,
        notes: extractedData.notes,
        categories: extractedData.categories
      });
    } else {
      // Update existing card
      const cardIndex = updatedDatabase.cards.findIndex(card => card.id === source.id);
      if (cardIndex >= 0) {
        updatedDatabase.cards[cardIndex] = {
          ...updatedDatabase.cards[cardIndex],
          annualFee: extractedData.annualFee,
          notes: extractedData.notes,
          categories: extractedData.categories
        };
      }
    }
  }
  
  return updatedDatabase;
}

// Generate a human review report
function generateReviewReport(extractedDataList, comparisons) {
  const reviewItems = [];
  
  for (let i = 0; i < extractedDataList.length; i++) {
    const extractedData = extractedDataList[i];
    if (!extractedData) continue;
    
    const source = CONFIG.cardSources[i];
    const comparison = comparisons[i];
    
    if (comparison.needsReview) {
      reviewItems.push({
        id: source.id,
        name: source.name,
        isNew: comparison.isNew,
        confidence: extractedData.confidence,
        changes: comparison.changes,
        reviewReasons: comparison.reviewReasons,
        extractedData: extractedData
      });
    }
  }
  
  return {
    timestamp: new Date().toISOString(),
    totalCards: extractedDataList.filter(Boolean).length,
    reviewNeeded: reviewItems.length,
    items: reviewItems
  };
}

// Save files to disk
function saveFiles(updatedDatabase, reviewReport) {
  // Create directories if they don't exist
  const outputDir = path.dirname(CONFIG.outputPath);
  const logDir = path.dirname(CONFIG.logPath);
  
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  
  // Save updated database
  fs.writeFileSync(
    CONFIG.outputPath,
    JSON.stringify(updatedDatabase, null, 2)
  );
  
  // Save review report
  fs.writeFileSync(
    CONFIG.logPath,
    JSON.stringify(reviewReport, null, 2)
  );
  
  // If there are items that need review, create a special file
  if (reviewReport.reviewNeeded > 0) {
    const reviewPath = path.join(
      path.dirname(CONFIG.logPath),
      `review-needed-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    );
    
    fs.writeFileSync(
      reviewPath,
      JSON.stringify(reviewReport, null, 2)
    );
  }
}

// Main function
async function main() {
  console.log('Starting automated card database update...');
  
  // Load current database
  const currentDatabase = await loadCurrentDatabase();
  console.log(`Loaded current database (version ${currentDatabase.version})`);
  
  // Scrape data for each card
  const scrapedDataList = await Promise.all(
    CONFIG.cardSources.map(source => scrapeCardInfo(source))
  );
  
  // Extract structured data using Claude API
  const extractedDataList = await Promise.all(
    CONFIG.cardSources.map((source, index) => 
      extractCardData(source, scrapedDataList[index])
    )
  );
  
  // Compare with existing database
  const comparisons = CONFIG.cardSources.map((source, index) => {
    const extractedData = extractedDataList[index];
    if (!extractedData) {
      return {
        isNew: false,
        changes: [],
        needsReview: true,
        reviewReasons: ['Failed to extract data']
      };
    }
    
    return compareWithExisting(source.id, extractedData, currentDatabase);
  });
  
  // Generate updated database
  const updatedDatabase = generateUpdatedDatabase(
    currentDatabase,
    extractedDataList,
    comparisons
  );
  
  // Generate review report
  const reviewReport = generateReviewReport(extractedDataList, comparisons);
  
  // Save files
  saveFiles(updatedDatabase, reviewReport);
  
  console.log('Automated update completed!');
  console.log(`New version: ${updatedDatabase.version}`);
  console.log(`Cards checked: ${extractedDataList.filter(Boolean).length}`);
  console.log(`Cards requiring review: ${reviewReport.reviewNeeded}`);
  
  if (reviewReport.reviewNeeded > 0) {
    console.log('ATTENTION: Some cards need human review!');
    console.log(`Review report saved to: ${CONFIG.logPath}`);
  }
}

// Run the main function
main().catch(error => {
  console.error('Error in main process:', error);
  process.exit(1);
});