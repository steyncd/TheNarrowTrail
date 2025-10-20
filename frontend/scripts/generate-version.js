// scripts/generate-version.js
// Generates a version.json file with build timestamp and version info

const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');

const versionInfo = {
  version: packageJson.version,
  buildTime: new Date().toISOString(),
  buildTimestamp: Date.now(),
  commitHash: process.env.COMMIT_HASH || 'unknown'
};

const outputPath = path.join(__dirname, '../public/version.json');

fs.writeFileSync(outputPath, JSON.stringify(versionInfo, null, 2));

console.log('✅ Version file generated:', versionInfo);
console.log('📁 Location:', outputPath);
