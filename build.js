const fs = require('fs');

// authDomain is hardcoded in index.html (a-mew-project.firebaseapp.com)
// to ensure iOS Safari redirect flow works correctly — do not env-var it
const ENV_MAP = {
  __FB_API_KEY__:             'FB_API_KEY',
  __FB_PROJECT_ID__:          'FB_PROJECT_ID',
  __FB_STORAGE_BUCKET__:      'FB_STORAGE_BUCKET',
  __FB_MESSAGING_SENDER_ID__: 'FB_MESSAGING_SENDER_ID',
  __FB_APP_ID__:              'FB_APP_ID',
  __FB_MEASUREMENT_ID__:      'FB_MEASUREMENT_ID',
};

const missing = Object.values(ENV_MAP).filter(k => !process.env[k]);
if (missing.length) {
  console.error('Missing environment variables:\n  ' + missing.join('\n  '));
  process.exit(1);
}

let html = fs.readFileSync('index.html', 'utf8');
for (const [placeholder, envKey] of Object.entries(ENV_MAP)) {
  html = html.replaceAll(placeholder, process.env[envKey]);
}

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', html);
console.log('Build complete → dist/index.html');
