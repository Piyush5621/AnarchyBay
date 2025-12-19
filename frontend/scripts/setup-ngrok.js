#!/usr/bin/env node

/**
 * Setup script for ngrok + Vite HMR
 * This script helps configure the VITE_NGROK_HOST environment variable
 * for proper WebSocket connections through ngrok.
 */

import { execSync } from 'child_process';
import { writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const ENV_FILE = join(process.cwd(), '.env');

console.log('🚀 Setting up ngrok for Vite HMR...\n');

// Check if ngrok is installed
try {
  execSync('ngrok version', { stdio: 'pipe' });
  console.log('✅ ngrok is installed');
} catch (error) {
  console.log('❌ ngrok is not installed. Please install it from https://ngrok.com/download');
  console.log('   Then run: npm run dev:ngrok');
  process.exit(1);
}

// Check if ngrok is running
let ngrokUrl = null;
try {
  const output = execSync('curl -s http://localhost:4040/api/tunnels', { encoding: 'utf8' });
  const tunnels = JSON.parse(output);
  const httpsTunnel = tunnels.tunnels.find(t => t.proto === 'https');
  if (httpsTunnel) {
    ngrokUrl = httpsTunnel.public_url.replace('https://', '');
    console.log(`✅ ngrok is running at: https://${ngrokUrl}`);
  }
} catch (error) {
  console.log('❌ ngrok is not running. Please start it with: ngrok http 5173');
  console.log('   Then run: npm run dev:ngrok');
  process.exit(1);
}

// Update .env file
let envContent = '';
if (existsSync(ENV_FILE)) {
  envContent = require('fs').readFileSync(ENV_FILE, 'utf8');
}

// Remove existing VITE_NGROK_HOST line
envContent = envContent.split('\n').filter(line => !line.startsWith('VITE_NGROK_HOST=')).join('\n');

// Add new VITE_NGROK_HOST
envContent += `\nVITE_NGROK_HOST=${ngrokUrl}\n`;

writeFileSync(ENV_FILE, envContent.trim() + '\n');

console.log(`✅ Updated .env with VITE_NGROK_HOST=${ngrokUrl}`);
console.log('\n🎉 Setup complete! You can now run: npm run dev');
console.log('   Your app will be available at: https://' + ngrokUrl);
console.log('   HMR WebSocket will connect properly through ngrok!');