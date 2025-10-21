#!/usr/bin/env node

/**
 * Generate Favicon Variations
 * 
 * This script generates different favicon sizes from the source icon.svg
 * Sizes: favicon.ico (32x32), icon-192.png, icon-512.png, apple-icon.png (180x180)
 * 
 * Note: This requires sharp package. Install with: npm install sharp
 * For production, use an online favicon generator or design tool
 */

const fs = require('fs');
const path = require('path');

// SVG content for different sizes
const createSVG = (size) => `<svg width="${size}" height="${size}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="#1e40af" rx="4"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".35em" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="bold">
    <tspan fill="white">G</tspan><tspan fill="#fbbf24">E</tspan>
  </text>
</svg>`;

const publicDir = path.join(__dirname, '../public');

// Create larger SVG versions
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), createSVG(192));
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), createSVG(512));
fs.writeFileSync(path.join(publicDir, 'apple-icon.svg'), createSVG(180));

console.log('✅ Favicon SVG variations generated!');
console.log('📌 For production PNG versions, use: https://realfavicongenerator.net/');
console.log('📌 Upload icon.svg and download all sizes');
