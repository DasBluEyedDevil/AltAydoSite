const fs = require('fs');
const path = require('path');

// Read the ShipData.ts file
const shipDataPath = path.join(__dirname, '../src/types/ShipData.ts');
const shipDataContent = fs.readFileSync(shipDataPath, 'utf8');

// Extract ships from shipDatabase
const extractShipDbNames = () => {
  const dbSectionStart = shipDataContent.indexOf('export const shipDatabase: ShipDetails[] = [');
  const dbSectionEnd = shipDataContent.indexOf('// Ship manufacturers in the game');
  
  if (dbSectionStart === -1 || dbSectionEnd === -1) {
    console.error('Could not locate the shipDatabase section in the file');
    return [];
  }
  
  const dbSection = shipDataContent.substring(dbSectionStart, dbSectionEnd);
  const shipNameRegex = /name: "([^"]+)"/g;
  const dbShips = [];
  let match;
  
  while ((match = shipNameRegex.exec(dbSection)) !== null) {
    dbShips.push(match[1]);
  }
  
  return dbShips;
};

// Extract ships from manufacturer arrays
const extractManufacturerShips = () => {
  const mfgSectionStart = shipDataContent.indexOf('export const shipManufacturers: ShipManufacturer[] = [');
  const mfgSectionEnd = shipDataContent.indexOf('export const getManufacturersList = ():');
  
  if (mfgSectionStart === -1 || mfgSectionEnd === -1) {
    console.error('Could not locate the shipManufacturers section in the file');
    return [];
  }
  
  const mfgSection = shipDataContent.substring(mfgSectionStart, mfgSectionEnd);
  const manufacturerRegex = /name: "([^"]+)",\s*ships: \[\s*([\s\S]*?)\s*\]/g;
  
  const manufacturerShips = [];
  let mfgMatch;
  
  while ((mfgMatch = manufacturerRegex.exec(mfgSection)) !== null) {
    const manufacturer = mfgMatch[1];
    const shipsSection = mfgMatch[2];
    const shipRegex = /\{\s*name:\s*"([^"]+)",\s*image:/g;
    let shipMatch;
    
    while ((shipMatch = shipRegex.exec(shipsSection)) !== null) {
      manufacturerShips.push({
        name: shipMatch[1],
        manufacturer
      });
    }
  }
  
  return manufacturerShips;
};

// Find ships in the manufacturer lists but not in the detailed database
const generateTemplates = () => {
  const dbShips = extractShipDbNames();
  const mfgShips = extractManufacturerShips();
  
  console.log(`Found ${dbShips.length} ships in the shipDatabase`);
  console.log(`Found ${mfgShips.length} ships in the manufacturer arrays`);
  
  const missingShips = mfgShips.filter(ship => !dbShips.includes(ship.name));
  
  console.log(`\nFound ${missingShips.length} ships missing from the detailed database`);
  
  // Generate templates for missing ships
  console.log('\nGenerated templates for missing ships:');
  console.log('======================================');
  
  // Group by manufacturer for cleaner output
  const groupedByMfg = {};
  missingShips.forEach(ship => {
    if (!groupedByMfg[ship.manufacturer]) {
      groupedByMfg[ship.manufacturer] = [];
    }
    groupedByMfg[ship.manufacturer].push(ship.name);
  });
  
  // Generate templates for each manufacturer
  Object.entries(groupedByMfg).forEach(([manufacturer, ships]) => {
    console.log(`\n// ${manufacturer}`);
    ships.forEach(shipName => {
      console.log(`{
  name: "${shipName}",
  manufacturer: "${manufacturer}",
  type: "${shipName}",
  size: "Medium", // Update as needed: Small, Medium, Large, Capital
  role: [""], // Add appropriate roles
  image: getShipImagePath("${shipName}"),
  crewRequirement: 1, // Update as needed
  maxCrew: 1, // Update as needed
  cargoCapacity: 0, // Update as needed
  length: 0, // Length in meters
  beam: 0, // Width in meters
  height: 0, // Height in meters
  speedSCM: 0, // Standard Combat Maneuvering speed
  speedBoost: 0, // Boost speed
  status: "Flight Ready" // Or "In Production" or "Concept"
},`);
    });
  });
  
  // Check for missing images
  console.log('\nNow checking for images for the missing ships...');
  const imagesDir = path.join(__dirname, '../public/images');
  
  if (!fs.existsSync(imagesDir)) {
    console.error('Images directory not found!');
    return;
  }
  
  const imageFiles = fs.readdirSync(imagesDir)
    .filter(file => file.endsWith('.png') || file.endsWith('.jpg'));
  
  // Format ship name to match image name (same as in ShipData.ts)
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
  
  console.log('\nShips missing both from database AND missing images:');
  console.log('=================================================');
  
  missingShips.forEach(ship => {
    const expectedImageName = formatShipImageName(ship.name);
    if (!imageFiles.includes(expectedImageName)) {
      console.log(`${ship.name} => ${expectedImageName}`);
    }
  });
};

// Run the script
generateTemplates(); 