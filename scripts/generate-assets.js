import fs from 'fs';
import path from 'path';

// Valid 1x1 transparent PNG buffer
const PNG_1X1 = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

const assetsDir = path.resolve('expo-project', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

const assets = [
  'icon.png',
  'adaptive-icon.png',
  'splash-icon.png',
  'notification-icon.png',
  'favicon.png',
];

assets.forEach((filename) => {
  const filePath = path.join(assetsDir, filename);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, PNG_1X1);
    console.log(`Created asset: ${filePath}`);
  }
});

// Also create public/favicon.ico
const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), PNG_1X1);
console.log('All placeholder assets generated successfully.');
