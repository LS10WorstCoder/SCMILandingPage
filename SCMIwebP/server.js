import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env.local if present
dotenv.config({ path: '.env.local' });

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from project root (index.html + assets)
app.use(express.static(__dirname));

app.post('/api/send-email', async (req, res) => {
  const { firstName, lastName, email, levelOfStudy, linkedin, createdAt } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('Missing RESEND_API_KEY in environment');
    return res.status(500).json({ error: 'Server not configured for sending email' });
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
      console.error('Resend API error', r.status, text);
      return res.status(502).json({ error: 'Failed to send email', detail: text });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error('Error sending email', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
