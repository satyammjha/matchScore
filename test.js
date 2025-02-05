const path = require('path');
const fs = require('fs');

const swPath = path.resolve(__dirname, 'src/background/service-worker.js');
console.log('Checking:', swPath);

if (fs.existsSync(swPath)) {
  console.log('✅ Service worker exists');
} else {
  console.log('❌ Service worker missing');
}