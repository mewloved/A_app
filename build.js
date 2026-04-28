const fs = require('fs');

const ENV_MAP = {
  __FB_API_KEY__:             'FB_API_KEY',
  __FB_AUTH_DOMAIN__:         'FB_AUTH_DOMAIN',
  __FB_PROJECT_ID__:          'FB_PROJECT_ID',
  __FB_STORAGE_BUCKET__:      'FB_STORAGE_BUCKET',
  __FB_MESSAGING_SENDER_ID__: 'FB_MESSAGING_SENDER_ID',
  __FB_APP_ID__:              'FB_APP_ID',
  __FB_MEASUREMENT_ID__:      'FB_MEASUREMENT_ID',
};

console.log('[build] Checking environment variables...');
const missing = Object.values(ENV_MAP).filter(k => !process.env[k]);
if (missing.length) {
  console.error('[build] ERROR — missing env vars:');
  missing.forEach(k => console.error(`  ${k} is not set`));
  process.exit(1);
}

// Trim values — prevents trailing newline/space from Vercel paste breaking the key
const VALUES = {};
for (const [placeholder, envKey] of Object.entries(ENV_MAP)) {
  VALUES[placeholder] = process.env[envKey].trim();
}

// Log first 15 chars + length so you can visually confirm against the real key
for (const [placeholder, envKey] of Object.entries(ENV_MAP)) {
  const v = VALUES[placeholder];
  console.log(`[build] ${envKey} = "${v.slice(0, 15)}..." length=${v.length}`);
}

console.log('[build] Reading index.html...');
let html = fs.readFileSync('index.html', 'utf8');

for (const [placeholder] of Object.entries(ENV_MAP)) {
  const re = new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
  const count = (html.match(re) || []).length;
  html = html.replace(re, VALUES[placeholder]);
  console.log(`[build] ${placeholder} → replaced ${count} occurrence(s)`);
}

// Verify no placeholders remain
const leftover = Object.keys(ENV_MAP).filter(p => html.includes(p));
if (leftover.length) {
  console.error('[build] ERROR — unreplaced placeholders:', leftover);
  process.exit(1);
}

// Inject build timestamp as HTML comment so we can confirm dist/ is being served
const ts = new Date().toISOString();
html = html.replace('</head>', `<!-- vercel-build: ${ts} -->\n</head>`);

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', html);

const kb = (fs.statSync('dist/index.html').size / 1024).toFixed(1);
console.log(`[build] dist/index.html written — ${kb} KB`);
console.log(`[build] Build timestamp: ${ts}`);
console.log('[build] Done ✓');
