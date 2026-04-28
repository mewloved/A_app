export default function handler(req, res) {
  const required = [
    'FB_API_KEY', 'FB_AUTH_DOMAIN', 'FB_PROJECT_ID',
    'FB_STORAGE_BUCKET', 'FB_MESSAGING_SENDER_ID',
    'FB_APP_ID', 'FB_MEASUREMENT_ID',
  ];

  const missing = required.filter(k => !process.env[k]);
  if (missing.length) {
    console.error('[api/config] Missing env vars:', missing);
    return res.status(500).json({ error: 'Server configuration incomplete', missing });
  }

  res.setHeader('Cache-Control', 'no-store');
  res.json({
    apiKey:            process.env.FB_API_KEY.trim(),
    authDomain:        process.env.FB_AUTH_DOMAIN.trim(),
    projectId:         process.env.FB_PROJECT_ID.trim(),
    storageBucket:     process.env.FB_STORAGE_BUCKET.trim(),
    messagingSenderId: process.env.FB_MESSAGING_SENDER_ID.trim(),
    appId:             process.env.FB_APP_ID.trim(),
    measurementId:     process.env.FB_MEASUREMENT_ID.trim(),
  });
}
