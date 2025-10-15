#!/usr/bin/env node

// Pre-deployment validation script
// Ensures no local environment references make it to production

const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

console.log(`${YELLOW}🔍 Running pre-deployment validation...${RESET}\n`);

let hasErrors = false;
let hasWarnings = false;

// Check 1: Verify .env files don't contain local references
function checkEnvFiles() {
  console.log('📋 Checking environment configuration...');
  
  const envFiles = ['.env.local', '.env.development', '.env.production'];
  const localPatterns = [
    /localhost/i,
    /127\.0\.0\.1/,
    /192\.168\./,
    /10\.0\./,
    /172\.16\./,
    /:300[0-9]/,  // Common dev ports
    /:800[0-9]/,  // Common dev ports
    /:900[0-9]/   // Common dev ports
  ];

  envFiles.forEach(file => {
    const filePath = path.join(__dirname, '..', file);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      
      localPatterns.forEach(pattern => {
        if (pattern.test(content)) {
          if (file === '.env.production') {
            console.log(`${RED}❌ ERROR: ${file} contains local environment reference matching ${pattern}${RESET}`);
            hasErrors = true;
          } else {
            console.log(`${YELLOW}⚠️  WARNING: ${file} contains local environment reference matching ${pattern}${RESET}`);
            hasWarnings = true;
          }
        }
      });
    }
  });
}

// Check 2: Verify built files don't contain local references
function checkBuildFiles() {
  console.log('🏗️  Checking build output...');
  
  const buildDir = path.join(__dirname, '..', 'build', 'static', 'js');
  if (!fs.existsSync(buildDir)) {
    console.log(`${YELLOW}⚠️  WARNING: Build directory not found. Run 'npm run build' first.${RESET}`);
    hasWarnings = true;
    return;
  }

  const jsFiles = fs.readdirSync(buildDir).filter(file => file.endsWith('.js'));
  const localPatterns = [
    /localhost/g,
    /127\.0\.0\.1/g,
    /192\.168\./g,
    /10\.0\./g,
    /172\.16\./g
  ];

  jsFiles.forEach(file => {
    const filePath = path.join(buildDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    localPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`${RED}❌ ERROR: ${file} contains ${matches.length} local environment reference(s)${RESET}`);
        hasErrors = true;
      }
    });
  });
}

// Check 3: Verify package.json scripts are production-ready
function checkPackageJson() {
  console.log('📦 Checking package.json configuration...');
  
  const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8'));
  
  // Check if homepage is set correctly
  if (!packageJson.homepage || packageJson.homepage.includes('localhost')) {
    console.log(`${YELLOW}⚠️  WARNING: package.json homepage not set or contains localhost${RESET}`);
    hasWarnings = true;
  }
}

// Check 4: Verify critical environment variables are set
function checkRequiredEnvVars() {
  console.log('🔧 Checking required environment variables...');
  
  const requiredVars = ['REACT_APP_API_URL'];
  const envFile = path.join(__dirname, '..', '.env.production');
  
  if (!fs.existsSync(envFile)) {
    console.log(`${RED}❌ ERROR: .env.production file not found${RESET}`);
    hasErrors = true;
    return;
  }

  const envContent = fs.readFileSync(envFile, 'utf8');
  
  requiredVars.forEach(varName => {
    const regex = new RegExp(`^${varName}=.+`, 'm');
    if (!regex.test(envContent)) {
      console.log(`${RED}❌ ERROR: Required environment variable ${varName} not found in .env.production${RESET}`);
      hasErrors = true;
    }
  });
}

// Check 5: Verify no debug/development flags are enabled in production
function checkProductionFlags() {
  console.log('🚩 Checking production flags...');
  
  const envFile = path.join(__dirname, '..', '.env.production');
  if (fs.existsSync(envFile)) {
    const content = fs.readFileSync(envFile, 'utf8');
    
    if (/REACT_APP_DEBUG=true/i.test(content)) {
      console.log(`${YELLOW}⚠️  WARNING: Debug mode enabled in production${RESET}`);
      hasWarnings = true;
    }
    
    if (/REACT_APP_ENV=development/i.test(content)) {
      console.log(`${RED}❌ ERROR: Environment set to development in .env.production${RESET}`);
      hasErrors = true;
    }
  }
}

// Run all checks
checkEnvFiles();
checkBuildFiles();
checkPackageJson();
checkRequiredEnvVars();
checkProductionFlags();

// Summary
console.log('\n' + '='.repeat(50));
if (hasErrors) {
  console.log(`${RED}❌ DEPLOYMENT BLOCKED: ${hasErrors ? 'Errors' : 'No errors'} found${RESET}`);
  console.log(`${RED}Please fix the errors above before deploying to production.${RESET}`);
  process.exit(1);
} else if (hasWarnings) {
  console.log(`${YELLOW}⚠️  WARNINGS FOUND: Deployment allowed but please review warnings${RESET}`);
  process.exit(0);
} else {
  console.log(`${GREEN}✅ ALL CHECKS PASSED: Ready for production deployment${RESET}`);
  process.exit(0);
}