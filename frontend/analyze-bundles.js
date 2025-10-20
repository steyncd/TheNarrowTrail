const fs = require('fs');
const path = require('path');

// Read the latest build stats
const buildDir = path.join(__dirname, 'build', 'static', 'js');

if (!fs.existsSync(buildDir)) {
  console.log('Build directory not found. Please run npm run build first.');
  process.exit(1);
}

const files = fs.readdirSync(buildDir);
const jsFiles = files.filter(f => f.endsWith('.js') && !f.endsWith('.map'));

let totalSize = 0;
const fileStats = [];

jsFiles.forEach(file => {
  const filePath = path.join(buildDir, file);
  const stats = fs.statSync(filePath);
  const sizeKB = (stats.size / 1024).toFixed(2);
  totalSize += stats.size;

  fileStats.push({
    name: file,
    size: sizeKB,
    sizeBytes: stats.size
  });
});

// Sort by size
fileStats.sort((a, b) => b.sizeBytes - a.sizeBytes);

console.log('\n=== JavaScript Bundle Analysis ===\n');
console.log('Top 10 Largest Bundles:');
console.log('----------------------------------------');

fileStats.slice(0, 10).forEach((file, index) => {
  console.log(`${index + 1}. ${file.name}`);
  console.log(`   Size: ${file.size} KB`);
});

console.log('\n----------------------------------------');
console.log(`Total JS Size: ${(totalSize / 1024).toFixed(2)} KB`);
console.log(`Total Files: ${jsFiles.length}`);
console.log(`Average File Size: ${(totalSize / jsFiles.length / 1024).toFixed(2)} KB`);
