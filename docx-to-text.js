const fs = require('fs');
const path = require('path');
const mammoth = require('mammoth');

// Path to the reference material directory
const directoryPath = path.join(__dirname, 'reference material');

// Read all files in the directory
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.error('Error reading directory:', err);
    return;
  }

  // Filter for .docx files
  const docxFiles = files.filter(file => path.extname(file).toLowerCase() === '.docx');
  
  console.log(`Found ${docxFiles.length} DOCX files to convert.`);
  
  // Process each DOCX file
  docxFiles.forEach(file => {
    const filePath = path.join(directoryPath, file);
    const outputFilePath = path.join(directoryPath, `${path.basename(file, '.docx')}.txt`);
    
    // Convert DOCX to text
    mammoth.extractRawText({path: filePath})
      .then(result => {
        const text = result.value;
        
        // Write the text to a new file
        fs.writeFileSync(outputFilePath, text);
        console.log(`Converted: ${file} -> ${path.basename(outputFilePath)}`);
      })
      .catch(err => {
        console.error(`Error converting ${file}:`, err);
      });
  });
}); 