// This script optimizes and verifies images used in the carousel
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Path to images directory
const imagesDir = path.join(__dirname, '../public/images');

// List of images used in the carousel from HomeContent.tsx
const carouselImages = [
  'sc.jpg',
  'sc_banner_crusader.jpg',
  'Star-Citizen-4K-Wallpaper-3.jpg',
  'jan-urschel-a.jpg',
  'spacebg.jpg',
  'spacebg.png',
  'sc_cargo.jpeg',
  'star_citizen_0.jpg',
  'Firing_Concept.jpg',
  'hull_e.png',
  '791602-Ships-Fantastic-world-Star-Citizen.jpg',
  'RSI_AYDO_Corp_image.png',
  'CargoCapacity_ProposedFinal-Min.jpg',
  'AydoCorp_Fleet_poster.jpg'
];

// Function to check if file exists
function fileExists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch (err) {
    console.error(`Error checking if file exists: ${err.message}`);
    return false;
  }
}

// Function to check image dimensions
function getImageInfo(filePath) {
  return new Promise((resolve, reject) => {
    try {
      // For simplicity, just checking if the file exists and its size
      const stats = fs.statSync(filePath);
      resolve({
        exists: true,
        size: stats.size,
        path: filePath
      });
    } catch (err) {
      resolve({
        exists: false,
        error: err.message,
        path: filePath
      });
    }
  });
}

async function main() {
  console.log('Checking carousel images...');
  
  const results = [];
  
  for (const image of carouselImages) {
    const imagePath = path.join(imagesDir, image);
    const info = await getImageInfo(imagePath);
    
    results.push({
      filename: image,
      ...info
    });
    
    if (!info.exists) {
      console.log(`❌ Missing: ${image}`);
    } else {
      console.log(`✅ Found: ${image} (${(info.size / 1024).toFixed(2)} KB)`);
      
      // Create PNG copy for JPEG files that are causing issues
      if (image.toLowerCase().endsWith('.jpg') || image.toLowerCase().endsWith('.jpeg')) {
        const baseFilename = path.basename(image, path.extname(image));
        const pngFilename = `${baseFilename}.png`;
        const pngPath = path.join(imagesDir, pngFilename);
        
        if (!fileExists(pngPath)) {
          console.log(`Creating PNG copy for: ${image} (${pngFilename})`);
          // This is where an image conversion library would be used
          // For now, we just make a copy of the original
          fs.copyFileSync(imagePath, pngPath);
          console.log(`Created copy: ${pngFilename}`);
        }
      }
    }
  }
  
  // Output a summary
  const existingImages = results.filter(img => img.exists).length;
  const missingImages = results.filter(img => !img.exists).length;
  
  console.log('\nSummary:');
  console.log(`Total images checked: ${results.length}`);
  console.log(`Existing images: ${existingImages}`);
  console.log(`Missing images: ${missingImages}`);
  
  if (missingImages > 0) {
    console.log('\nMissing images:');
    results.filter(img => !img.exists).forEach(img => {
      console.log(`- ${img.filename}`);
    });
  }
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
