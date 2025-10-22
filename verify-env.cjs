#!/usr/bin/env node
/**
 * Environment Variable Verification Script
 * Checks if all required environment variables are properly configured
 * Run: node verify-env.js
 */

require('dotenv').config();

const chalk = {
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
  bold: (text) => `\x1b[1m${text}\x1b[0m`
};

console.log(chalk.bold('\n=== Environment Variable Verification ===\n'));

// Define required variables
const requiredVariables = {
  'Backend Critical': [
    { name: 'OPENWEATHER_API_KEY', description: 'OpenWeather API for backend weather fetching' },
    { name: 'AIMLAPI_AI_API_KEY', description: 'Backend API authentication key' },
    { name: 'JWT_SECRET', description: 'JWT signing secret' },
    { name: 'ACCESS_TOKEN_SECRET', description: 'Access token secret for JWT' },
    { name: 'REFRESH_TOKEN_SECRET', description: 'Refresh token secret for JWT' },
    { name: 'MONGODB_URL', description: 'MongoDB connection string' }
  ],
  'Frontend Critical': [
    { name: 'VITE_OPENWEATHER_API_KEY', description: 'OpenWeather API for frontend' },
    { name: 'VITE_AIMLAPI_AI_API_KEY', description: 'Frontend backend auth key' },
    { name: 'VITE_API_BASE_URL', description: 'Backend API base URL' }
  ],
  'Server Configuration': [
    { name: 'PORT', description: 'Server port' },
    { name: 'NODE_ENV', description: 'Environment (development/production)' },
    { name: 'FRONTEND_URL', description: 'Frontend URL for CORS' }
  ]
};

const optionalVariables = [
  'AGROMONITORING_API_KEY',
  'LOCATIONIQ_API_KEY',
  'VITE_AGROMONITORING_API_KEY',
  'VITE_LOCATIONIQ_API_KEY',
  'SMTP_HOST',
  'SMTP_USER',
  'SMTP_PASS'
];

let totalIssues = 0;
let criticalIssues = 0;

// Check each category
Object.keys(requiredVariables).forEach(category => {
  console.log(chalk.bold(`\n${category}:`));

  requiredVariables[category].forEach(variable => {
    const value = process.env[variable.name];
    const isSet = value && value.length > 0;

    if (isSet) {
      // Check if it's a secure value
      let warning = '';
      if (variable.name.includes('API_KEY') || variable.name.includes('SECRET')) {
        if (value.length < 32) {
          warning = chalk.yellow(' (⚠️  Too short, should be 32+ chars)');
        }
        // Check if it's the old insecure key
        if (value === 'dcc847936b14463cac35a898489fb72e') {
          warning = chalk.red(' (🔴 INSECURE - Replace this key!)');
          criticalIssues++;
        }
      }

      console.log(`  ${chalk.green('✓')} ${variable.name}: SET${warning}`);
      if (process.env.VERBOSE) {
        console.log(`    ${chalk.blue(variable.description)}`);
        console.log(`    Value: ${value.substring(0, 20)}...`);
      }
    } else {
      console.log(`  ${chalk.red('✗')} ${variable.name}: ${chalk.red('MISSING')}`);
      console.log(`    ${chalk.yellow(variable.description)}`);
      totalIssues++;
      criticalIssues++;
    }
  });
});

// Check key consistency
console.log(chalk.bold('\n\nKey Consistency Checks:'));

const frontendBackendPairs = [
  { frontend: 'VITE_OPENWEATHER_API_KEY', backend: 'OPENWEATHER_API_KEY', name: 'OpenWeather API' },
  { frontend: 'VITE_AIMLAPI_AI_API_KEY', backend: 'AIMLAPI_AI_API_KEY', name: 'Backend Auth Key' }
];

frontendBackendPairs.forEach(pair => {
  const frontendValue = process.env[pair.frontend];
  const backendValue = process.env[pair.backend];

  if (frontendValue && backendValue) {
    if (frontendValue === backendValue) {
      console.log(`  ${chalk.green('✓')} ${pair.name}: Frontend and Backend keys MATCH`);
    } else {
      console.log(`  ${chalk.red('✗')} ${pair.name}: Frontend and Backend keys DO NOT MATCH`);
      console.log(`    Frontend: ${frontendValue.substring(0, 20)}...`);
      console.log(`    Backend:  ${backendValue.substring(0, 20)}...`);
      totalIssues++;
      criticalIssues++;
    }
  } else {
    console.log(`  ${chalk.yellow('⚠')} ${pair.name}: Cannot verify (one or both missing)`);
  }
});

// Check optional variables
console.log(chalk.bold('\n\nOptional Variables:'));
let optionalSet = 0;
optionalVariables.forEach(varName => {
  const value = process.env[varName];
  if (value && value.length > 0 && value !== '******') {
    console.log(`  ${chalk.green('✓')} ${varName}: SET`);
    optionalSet++;
  } else {
    console.log(`  ${chalk.yellow('○')} ${varName}: Not set (optional)`);
  }
});

// Security checks
console.log(chalk.bold('\n\nSecurity Checks:'));

const securityChecks = [
  {
    name: 'JWT_SECRET length',
    check: () => {
      const secret = process.env.JWT_SECRET;
      return secret && secret.length >= 64;
    },
    message: 'JWT_SECRET should be at least 64 characters'
  },
  {
    name: 'ACCESS_TOKEN_SECRET length',
    check: () => {
      const secret = process.env.ACCESS_TOKEN_SECRET;
      return secret && secret.length >= 64;
    },
    message: 'ACCESS_TOKEN_SECRET should be at least 64 characters'
  },
  {
    name: 'AIMLAPI_AI_API_KEY is not default',
    check: () => {
      const key = process.env.AIMLAPI_AI_API_KEY;
      return key && key !== 'dcc847936b14463cac35a898489fb72e';
    },
    message: 'AIMLAPI_AI_API_KEY is using insecure default value'
  },
  {
    name: 'NODE_ENV is set',
    check: () => {
      return process.env.NODE_ENV && ['development', 'production', 'test'].includes(process.env.NODE_ENV);
    },
    message: 'NODE_ENV should be development, production, or test'
  }
];

securityChecks.forEach(check => {
  if (check.check()) {
    console.log(`  ${chalk.green('✓')} ${check.name}`);
  } else {
    console.log(`  ${chalk.red('✗')} ${check.name}`);
    console.log(`    ${chalk.yellow(check.message)}`);
    totalIssues++;
  }
});

// Summary
console.log(chalk.bold('\n\n=== Summary ===\n'));

if (criticalIssues === 0 && totalIssues === 0) {
  console.log(chalk.green('✅ All required environment variables are properly configured!'));
  console.log(chalk.green('✅ All security checks passed!'));
  console.log(`\n${chalk.blue('ℹ')}  Optional variables set: ${optionalSet}/${optionalVariables.length}`);
  console.log('\nYour application should work correctly. Run:');
  console.log('  npm run dev:all');
  process.exit(0);
} else {
  console.log(chalk.red(`❌ Found ${criticalIssues} critical issues and ${totalIssues} total issues\n`));

  if (criticalIssues > 0) {
    console.log(chalk.bold(chalk.red('CRITICAL ISSUES MUST BE FIXED:')));
    console.log('  1. Missing or insecure API keys will prevent the application from working');
    console.log('  2. Mismatched frontend/backend keys will cause authentication failures');
    console.log('  3. Missing JWT secrets will break authentication\n');
  }

  console.log(chalk.bold('HOW TO FIX:'));
  console.log('  1. See ENV_ISSUES_AND_FIXES.md for detailed instructions');
  console.log('  2. Or use the corrected .env file:');
  console.log('     cp .env.corrected .env');
  console.log('  3. Then restart your servers:');
  console.log('     npm run dev:all\n');

  process.exit(1);
}
