// Test script to check ship deduplication
const fs = require('fs');

try {
  process.stderr.write('Starting script...\n');
  
  // Read the ShipData.ts file directly as a string
  process.stderr.write('Reading ShipData.ts file...\n');
  const shipDataPath = './ShipData.ts';
  
  if (!fs.existsSync(shipDataPath)) {
    process.stderr.write(`ERROR: File not found: ${shipDataPath}\n`);
    process.stderr.write(`Current directory: ${process.cwd()}\n`);
    process.stderr.write(`Directory contents: ${fs.readdirSync('.').join(', ')}\n`);
    process.exit(1);
  }
  
  const shipDataContent = fs.readFileSync(shipDataPath, 'utf8');
  process.stderr.write(`File loaded, size: ${shipDataContent.length} bytes\n`);

  // Count occurrences of "name: " to get an approximate count of ships
  const shipCount = (shipDataContent.match(/name: "/g) || []).length;
  process.stderr.write(`Approximate ship count: ${shipCount}\n`);

  // Check for duplicate Zeus MK II MR entries
  const zeusMkIIMRCount = (shipDataContent.match(/name: "Zeus Mk II MR"/g) || []).length;
  process.stderr.write(`Zeus Mk II MR appears ${zeusMkIIMRCount} times\n`);

  // Check other potential duplicates
  const shipNames = shipDataContent.match(/name: "([^"]+)"/g) || [];
  process.stderr.write(`Extracted ${shipNames.length} ship names from the database\n`);
  
  const nameMap = {};

  shipNames.forEach(nameMatch => {
    const name = nameMatch.replace('name: "', '').replace('"', '').toLowerCase();
    nameMap[name] = (nameMap[name] || 0) + 1;
  });

  const duplicates = Object.entries(nameMap)
    .filter(([_, count]) => count > 1)
    .map(([name, count]) => ({ name, count }));

  process.stderr.write(`Found ${duplicates.length} duplicated ship names\n`);
  if (duplicates.length > 0) {
    process.stderr.write('Duplicated ships:\n');
    duplicates.forEach(dup => {
      process.stderr.write(`- "${dup.name}" appears ${dup.count} times\n`);
    });
  }
  
  process.stderr.write('Script completed successfully.\n');
} catch (error) {
  process.stderr.write(`ERROR in script: ${error.message}\n`);
  process.stderr.write(error.stack + '\n');
  process.exit(1);
} 