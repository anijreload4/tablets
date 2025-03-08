/**
 * Tablets & Trials: The Covenant Quest
 * Font Downloader Script
 * 
 * This script downloads the Cinzel and EB Garamond fonts from Google Fonts
 * in WOFF and WOFF2 formats and saves them to the assets/fonts directory.
 */

const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

// Font configurations
const fonts = [
  {
    googleFontName: 'Cinzel:wght@400;700',
    localNames: {
      regular: 'Covenant-Regular',
      bold: 'Covenant-Bold'
    }
  },
  {
    googleFontName: 'EB+Garamond:wght@400;700',
    localNames: {
      regular: 'CovenantText-Regular',
      bold: 'CovenantText-Bold'
    }
  }
];

// Ensure fonts directory exists
const fontsDir = path.join(__dirname, 'assets', 'fonts');
if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
  console.log(`Created directory: ${fontsDir}`);
}

/**
 * Downloads a font file from the specified URL and saves it to the local filesystem
 */
async function downloadFontFile(url, filename) {
  try {
    console.log(`Downloading ${filename}...`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to download font: ${response.statusText}`);
    }
    
    const buffer = await response.buffer();
    const filepath = path.join(fontsDir, filename);
    
    fs.writeFileSync(filepath, buffer);
    console.log(`✓ Saved ${filename}`);
    
    return true;
  } catch (error) {
    console.error(`✗ Error downloading ${filename}:`, error.message);
    return false;
  }
}

/**
 * Extracts font URLs from Google Fonts CSS
 */
function extractFontUrls(css, format) {
  const regex = new RegExp(`url\\((https://fonts.gstatic.com/[^)]+\\.${format}[^)]*?)\\)`, 'g');
  const urls = [];
  let match;
  
  while ((match = regex.exec(css)) !== null) {
    urls.push(match[1]);
  }
  
  return urls;
}

/**
 * Main function to download all configured fonts
 */
async function downloadFonts() {
  console.log('Starting font download process...');
  
  for (const font of fonts) {
    try {
      console.log(`\nProcessing font: ${font.googleFontName}`);
      
      // Get the font CSS from Google Fonts
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36';
      const url = `https://fonts.googleapis.com/css2?family=${font.googleFontName}&display=swap`;
      
      console.log(`Fetching CSS from Google Fonts: ${url}`);
      const response = await fetch(url, {
        headers: {
          'User-Agent': userAgent
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch font CSS: ${response.statusText}`);
      }
      
      const css = await response.text();
      
      // Extract font URLs from CSS
      const woffUrls = extractFontUrls(css, 'woff');
      const woff2Urls = extractFontUrls(css, 'woff2');
      
      console.log(`Found ${woff2Urls.length} WOFF2 fonts and ${woffUrls.length} WOFF fonts`);
      
      // Download WOFF2 files (primary format)
      if (woff2Urls.length > 0) {
        const regularFont = font.localNames.regular + '.woff2';
        await downloadFontFile(woff2Urls[0], regularFont);
        
        // If bold version available, download it too
        if (woff2Urls.length > 1) {
          const boldFont = font.localNames.bold + '.woff2';
          await downloadFontFile(woff2Urls[1], boldFont);
        }
      } else {
        console.warn(`No WOFF2 fonts found for ${font.googleFontName}`);
      }
      
      // Download WOFF files (fallback format)
      if (woffUrls.length > 0) {
        const regularFont = font.localNames.regular + '.woff';
        await downloadFontFile(woffUrls[0], regularFont);
        
        // If bold version available, download it too
        if (woffUrls.length > 1) {
          const boldFont = font.localNames.bold + '.woff';
          await downloadFontFile(woffUrls[1], boldFont);
        }
      } else {
        console.warn(`No WOFF fonts found for ${font.googleFontName}`);
      }
      
    } catch (error) {
      console.error(`Error processing font ${font.googleFontName}:`, error.message);
    }
  }
  
  console.log('\nFont download process completed!');
  console.log(`Font files have been saved to: ${fontsDir}`);
  
  // Update CSS
  updateFontCSS();
}

/**
 * Updates the CSS file with the correct @font-face declarations
 */
function updateFontCSS() {
  const cssPath = path.join(__dirname, 'css', 'main.css');
  
  // Check if CSS file exists
  if (!fs.existsSync(cssPath)) {
    console.warn(`Could not find CSS file at ${cssPath}. Skipping CSS update.`);
    return;
  }
  
  try {
    console.log(`\nUpdating font references in CSS...`);
    let cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Check if @font-face declarations already exist
    if (cssContent.includes('@font-face')) {
      console.log('CSS already contains @font-face declarations. Please update manually if needed.');
      return;
    }
    
    // Create font-face declarations
    const fontFaceDeclarations = `
/* Font Declarations */
@font-face {
    font-family: 'Covenant';
    src: url('../assets/fonts/Covenant-Regular.woff2') format('woff2'),
         url('../assets/fonts/Covenant-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'Covenant';
    src: url('../assets/fonts/Covenant-Bold.woff2') format('woff2'),
         url('../assets/fonts/Covenant-Bold.woff') format('woff');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'CovenantText';
    src: url('../assets/fonts/CovenantText-Regular.woff2') format('woff2'),
         url('../assets/fonts/CovenantText-Regular.woff') format('woff');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
}

@font-face {
    font-family: 'CovenantText';
    src: url('../assets/fonts/CovenantText-Bold.woff2') format('woff2'),
         url('../assets/fonts/CovenantText-Bold.woff') format('woff');
    font-weight: bold;
    font-style: normal;
    font-display: swap;
}
`;

    // Find a good spot to insert the declarations
    if (cssContent.includes('/* 1. Base/Reset Styles */')) {
      // Insert before the first section
      cssContent = cssContent.replace('/* 1. Base/Reset Styles */', `${fontFaceDeclarations}\n/* 1. Base/Reset Styles */`);
    } else {
      // Just add to the beginning
      cssContent = fontFaceDeclarations + cssContent;
    }
    
    // Update body font-family if needed
    if (cssContent.includes('font-family:') && !cssContent.includes('font-family: \'Covenant\'')) {
      console.log('Updating body font-family declaration...');
      cssContent = cssContent.replace(
        /body\s*\{[^}]*?font-family:[^;]+;/g, 
        match => match.replace(/font-family:[^;]+;/, "font-family: 'Covenant', 'CovenantText', serif;")
      );
    }
    
    // Write updated CSS back to file
    fs.writeFileSync(cssPath, cssContent, 'utf8');
    console.log('✓ CSS file updated successfully!');
    
  } catch (error) {
    console.error('Error updating CSS file:', error.message);
  }
}

// Run the download process
downloadFonts().catch(error => {
  console.error('Fatal error during font download:', error);
  process.exit(1);
});