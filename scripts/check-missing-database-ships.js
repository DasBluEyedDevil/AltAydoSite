const fs = require('fs');
const path = require('path');

// Read the ShipData.ts file
const shipDataPath = path.join(__dirname, '../src/types/ShipData.ts');
const shipDataContent = fs.readFileSync(shipDataPath, 'utf8');

// Extract ships from shipDatabase
const extractShipDbNames = () => {
  // Look for entries in the format: name: "Ship Name", in the shipDatabase section
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
  // Look for entries in the format: { name: "Ship Name", image: formatShipImageName("Ship Name") }
  const mfgSectionStart = shipDataContent.indexOf('export const shipManufacturers: ShipManufacturer[] = [');
  const mfgSectionEnd = shipDataContent.indexOf('export const getManufacturersList = ():');
  
  if (mfgSectionStart === -1 || mfgSectionEnd === -1) {
    console.error('Could not locate the shipManufacturers section in the file');
    return [];
  }
  
  const mfgSection = shipDataContent.substring(mfgSectionStart, mfgSectionEnd);
  const shipNameRegex = /\{\s*name:\s*"([^"]+)",\s*image:/g;
  const mfgShips = [];
  let match;
  
  while ((match = shipNameRegex.exec(mfgSection)) !== null) {
    mfgShips.push(match[1]);
  }
  
  return mfgShips;
};

// Find ships in the manufacturer lists but not in the detailed database
const findMissingShips = () => {
  const dbShips = extractShipDbNames();
  const mfgShips = extractManufacturerShips();
  
  console.log(`Found ${dbShips.length} ships in the shipDatabase`);
  console.log(`Found ${mfgShips.length} ships in the manufacturer arrays`);
  
  const missingShips = mfgShips.filter(ship => !dbShips.includes(ship));
  
  console.log('\nShips in manufacturer arrays but missing from the shipDatabase:');
  console.log('===========================================================');
  missingShips.forEach(ship => console.log(ship));
  console.log(`\nTotal missing: ${missingShips.length}`);
  
  // Organize by manufacturer
  const mfgSections = shipDataContent.match(/name: "([^"]+)",\s*ships: \[\s*([\s\S]*?)\s*\]/g);
  
  if (mfgSections) {
    console.log('\nMissing ships by manufacturer:');
    console.log('===========================');
    
    for (const section of mfgSections) {
      const mfgMatch = section.match(/name: "([^"]+)"/);
      
      if (mfgMatch) {
        const manufacturer = mfgMatch[1];
        const shipMatches = section.match(/\{\s*name:\s*"([^"]+)",\s*image:/g);
        
        if (shipMatches) {
          const ships = shipMatches
            .map(m => m.match(/\{\s*name:\s*"([^"]+)"/)[1])
            .filter(ship => missingShips.includes(ship));
          
          if (ships.length > 0) {
            console.log(`\n${manufacturer} (${ships.length} ships):`);
            ships.forEach(ship => console.log(`  - ${ship}`));
          }
        }
      }
    }
  }
};

// Run the analysis
findMissingShips(); 