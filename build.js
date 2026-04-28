const fs = require('fs');

// authDomain is hardcoded — required for iOS Safari redirect flow
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
  console.error('[build] Go to Vercel → Settings → Environment Variables and add the missing keys.');
  process.exit(1);
}

// Log detected values (first 8 chars only — enough to confirm correct key)
Object.entries(ENV_MAP).forEach(([, envKey]) => {
  const v = process.env[envKey];
  console.log(`[build] ${envKey} = ${v.slice(0, 8)}... (length ${v.length})`);
});

console.log('[build] Reading index.html...');
let html = fs.readFileSync('index.html', 'utf8');

for (const [placeholder, envKey] of Object.entries(ENV_MAP)) {
  const count = (html.match(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  html = html.replaceAll(placeholder, process.env[envKey]);
  console.log(`[build] ${placeholder} → replaced ${count} occurrence(s)`);
}

// Verify no placeholders remain
const leftover = Object.keys(ENV_MAP).filter(p => html.includes(p));
if (leftover.length) {
  console.error('[build] ERROR — placeholders still present after substitution:', leftover);
  process.exit(1);
}

fs.mkdirSync('dist', { recursive: true });
fs.writeFileSync('dist/index.html', html);

const kb = (fs.statSync('dist/index.html').size / 1024).toFixed(1);
console.log(`[build] dist/index.html written — ${kb} KB`);
console.log('[build] Done ✓');
