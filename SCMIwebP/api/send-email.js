import dotenv from 'dotenv';

// Load local env only during development; Vercel injects env in production
if (process.env.NODE_ENV !== 'production') {
  dotenv.config({ path: '.env.local' });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, email, levelOfStudy, linkedin, createdAt } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey || apiKey.trim() === '') {
    return res.status(500).json({
      error: 'Server not configured for sending email',
      detail: 'Missing RESEND_API_KEY. In production, set it in Vercel → Project Settings → Environment Variables (Production) and redeploy. For local dev, add it to .env.local.'
    });
  }

  const to = 'genFaq@scmi.club';
  const subject = `New RSVP from ${firstName || ''} ${lastName || ''}`.trim();
  const html = `
    <h2>New RSVP</h2>
    <p><strong>Name:</strong> ${firstName || ''} ${lastName || ''}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Level of Study:</strong> ${levelOfStudy || ''}</p>
    <p><strong>LinkedIn:</strong> ${linkedin || ''}</p>
    <p><small>Submitted at ${createdAt || new Date().toISOString()}</small></p>
  `;

  try {
    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        from: 'SCMI <no-reply@scmi.club>',
        to,
        subject,
        html
      })
    });

    if (!r.ok) {
      const text = await r.text();
      return res.status(502).json({ error: 'Failed to send email', detail: text });
    }

    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}
