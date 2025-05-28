const fs = require('fs');
const path = require('path');

// List of manufacturers to exclude from ship check
const MANUFACTURERS = [
  "Aegis Dynamics",
  "Anvil Aerospace",
  "Aopoa",
  "Argo Astronautics",
  "Banu",
  "CNOU (Consolidated Outland)",
  "Crusader Industries",
  "Drake Interplanetary",
  "Esperia",
  "Gatac Manufacture",
  "Greycat Industrial",
  "Kruger Intergalatic",
  "MISC (Musashi Industrial and Starflight Concern)",
  "Mirai",
  "Origin Jumpworks",
  "Roberts Space Industries (RSI)",
  "Tumbril Land Systems",
  "Vanduul"
];

// Extract ship names from ShipData.ts
const extractShipNames = () => {
  const shipDataPath = path.join(__dirname, '../src/types/ShipData.ts');
  const shipDataContent = fs.readFileSync(shipDataPath, 'utf8');
  
  // Extract ships from the shipDatabase array
  const shipDbMatches = shipDataContent.match(/name: "(.*?)"/g);
  const shipDbNames = shipDbMatches 
    ? shipDbMatches.map(match => match.replace('name: "', '').replace('"', ''))
    : [];
  
  // Extract ships from the manufacturer arrays
  const manufacturerShips = [];
  const regex = /\{ name: "(.*?)", image: formatShipImageName/g;
  let match;
  while ((match = regex.exec(shipDataContent)) !== null) {
    manufacturerShips.push(match[1]);
  }
  
  // Combine all ship names, remove duplicates, and filter out manufacturers
  const allShips = [...new Set([...shipDbNames, ...manufacturerShips])];
  return allShips.filter(ship => !MANUFACTURERS.includes(ship));
};

// Get existing image files
const getExistingImages = () => {
  const imagesDir = path.join(__dirname, '../public/images');
  
  // Check if directory exists
  if (!fs.existsSync(imagesDir)) {
    console.error('Images directory not found!');
    return [];
  }
  
  try {
    const files = fs.readdirSync(imagesDir);
    return files.filter(file => file.endsWith('.png') || file.endsWith('.jpg'));
  } catch (error) {
    console.error('Error reading images directory:', error);
    return [];
  }
};

// Format ship name to match image name
const formatShipImageName = (shipName) => {
  // Special case for San'tok.yāi
  if (shipName === "San'tok.yāi") {
    return "santokyai.png";
  }
  
  return shipName.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[\.']/g, '')
    .replace(/\//g, '_')
    .replace(/[āáàäâã]/g, 'a')
    .replace(/[ēéèëê]/g, 'e')
    .replace(/[īíìïî]/g, 'i')
    .replace(/[ōóòöôõ]/g, 'o')
    .replace(/[ūúùüû]/g, 'u')
    .replace(/[ÿý]/g, 'y')
    + '.png';
};

// Check which ships don't have images
const checkMissingImages = () => {
  const shipNames = extractShipNames();
  const existingImages = getExistingImages();
  
  console.log(`Found ${shipNames.length} ships in the database (excluding manufacturers)`);
  console.log(`Found ${existingImages.length} images in the public/images directory`);
  
  const missingImages = [];
  
  for (const shipName of shipNames) {
    const expectedImageName = formatShipImageName(shipName);
    if (!existingImages.includes(expectedImageName)) {
      missingImages.push({ shipName, expectedImageName });
    }
  }
  
  console.log('\nMissing images:');
  console.log('==============');
  missingImages.forEach(({ shipName, expectedImageName }) => {
    console.log(`${shipName} => ${expectedImageName}`);
  });
  
  console.log(`\nTotal missing: ${missingImages.length}`);
};

// Run the check
checkMissingImages(); 