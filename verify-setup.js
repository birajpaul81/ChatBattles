#!/usr/bin/env node

/**
 * ChatBattles.ai - Setup Verification Script
 * Run this to verify your environment is configured correctly
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 ChatBattles.ai - Setup Verification\n');
console.log('='.repeat(50));

let allChecksPassed = true;

// Check 1: Node version
console.log('\n✓ Checking Node.js version...');
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
if (majorVersion >= 18) {
  console.log(`  ✅ Node.js ${nodeVersion} (Required: 18+)`);
} else {
  console.log(`  ❌ Node.js ${nodeVersion} (Required: 18+)`);
  allChecksPassed = false;
}

// Check 2: Environment file
console.log('\n✓ Checking environment file...');
if (fs.existsSync('.env.local')) {
  console.log('  ✅ .env.local exists');
  
  // Check for required variables
  const envContent = fs.readFileSync('.env.local', 'utf8');
  const requiredVars = [
    'A4F_API_KEY',
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
    'CLERK_SECRET_KEY'
  ];
  
  let missingVars = [];
  requiredVars.forEach(varName => {
    if (!envContent.includes(varName) || envContent.includes(`${varName}=your_`)) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length === 0) {
    console.log('  ✅ All required environment variables are set');
  } else {
    console.log('  ⚠️  Missing or not configured:');
    missingVars.forEach(v => console.log(`     - ${v}`));
    allChecksPassed = false;
  }
} else {
  console.log('  ❌ .env.local not found');
  console.log('     Run: cp .env.local.example .env.local');
  allChecksPassed = false;
}

// Check 3: Dependencies
console.log('\n✓ Checking dependencies...');
if (fs.existsSync('node_modules')) {
  console.log('  ✅ node_modules exists');
} else {
  console.log('  ❌ node_modules not found');
  console.log('     Run: npm install');
  allChecksPassed = false;
}

// Check 4: Required files
console.log('\n✓ Checking required files...');
const requiredFiles = [
  'app/layout.tsx',
  'app/page.tsx',
  'app/chat/page.tsx',
  'app/api/a4f-battle/route.ts',
  'components/BattleCard.tsx',
  'lib/supabaseClient.ts',
  'middleware.ts',
  'tailwind.config.ts'
];

let missingFiles = [];
requiredFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length === 0) {
  console.log(`  ✅ All ${requiredFiles.length} core files present`);
} else {
  console.log('  ❌ Missing files:');
  missingFiles.forEach(f => console.log(`     - ${f}`));
  allChecksPassed = false;
}

// Check 5: Package.json
console.log('\n✓ Checking package.json...');
if (fs.existsSync('package.json')) {
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const requiredDeps = ['next', 'react', '@clerk/nextjs', '@supabase/supabase-js', 'openai', 'framer-motion'];
  let missingDeps = [];
  
  requiredDeps.forEach(dep => {
    if (!pkg.dependencies || !pkg.dependencies[dep]) {
      missingDeps.push(dep);
    }
  });
  
  if (missingDeps.length === 0) {
    console.log('  ✅ All required dependencies listed');
  } else {
    console.log('  ❌ Missing dependencies:');
    missingDeps.forEach(d => console.log(`     - ${d}`));
    allChecksPassed = false;
  }
} else {
  console.log('  ❌ package.json not found');
  allChecksPassed = false;
}

// Final Summary
console.log('\n' + '='.repeat(50));
if (allChecksPassed) {
  console.log('\n✅ All checks passed! You\'re ready to run:');
  console.log('   npm run dev\n');
  console.log('Then visit: http://localhost:3000\n');
} else {
  console.log('\n⚠️  Some checks failed. Please fix the issues above.\n');
  console.log('For help, see:');
  console.log('  - QUICKSTART.md');
  console.log('  - SETUP.md\n');
  process.exit(1);
}

