export default function handler(req, res) {
  const hasKey = Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== '');
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasResendApiKey: hasKey,
    resendApiKeyLength: process.env.RESEND_API_KEY ? process.env.RESEND_API_KEY.length : 0,
    vercelDeployment: process.env.VERCEL === '1',
    hint: hasKey
      ? 'RESEND_API_KEY detected.'
      : 'Missing RESEND_API_KEY. Add it in Vercel Project Settings (Production) then redeploy. Locally put it in .env.local and run `vercel dev`.',
    relevantEnvKeys: Object.keys(process.env).filter(k => /^(RESEND|VERCEL|NODE|PORT)/i.test(k))
  });
}
