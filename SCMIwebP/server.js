import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

// Load environment variables from .env.local if present
dotenv.config({ path: '.env.local' });

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DynamoDB setup
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const dynamoDB = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'scmi-rsvps';

// Serve static files from project root (index.html + assets)
app.use(express.static(__dirname));

// RSVP submission endpoint - stores to DynamoDB
app.post('/api/submit-rsvp', async (req, res) => {
  const { firstName, lastName, email, levelOfStudy, linkedin, createdAt } = req.body || {};

  // Validate required fields
  if (!email || !email.trim()) {
    return res.status(400).json({ error: 'Email is required' });
  }

  if (!firstName || !firstName.trim() || !lastName || !lastName.trim()) {
    return res.status(400).json({ error: 'First and last name are required' });
  }

  try {
    const id = randomUUID();
    const timestamp = new Date().toISOString();

    const item = {
      id,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      levelOfStudy: levelOfStudy || null,
      linkedin: linkedin?.trim() || null,
      createdAt: createdAt || timestamp,
      submittedAt: timestamp
    };

    await dynamoDB.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: item
    }));

    console.log('RSVP saved to DynamoDB:', item);

    return res.status(201).json({ 
      ok: true, 
      message: 'RSVP submitted successfully',
      id
    });
  } catch (err) {
    console.error('Error storing RSVP:', err);
    return res.status(500).json({ 
      error: 'Failed to store RSVP', 
      detail: err.message 
    });
  }
});

// Get all RSVPs endpoint - fetches from DynamoDB
app.get('/api/get-rsvps', async (req, res) => {
  try {
    const result = await dynamoDB.send(new ScanCommand({
      TableName: TABLE_NAME
    }));

    // Sort by submittedAt descending (most recent first)
    const rsvps = (result.Items || []).sort((a, b) => {
      return new Date(b.submittedAt) - new Date(a.submittedAt);
    });

    return res.status(200).json({ 
      ok: true, 
      count: rsvps.length,
      rsvps
    });
  } catch (err) {
    console.error('Error fetching RSVPs:', err);
    return res.status(500).json({ 
      error: 'Failed to fetch RSVPs', 
      detail: err.message 
    });
  }
});

// Legacy endpoint (kept for backwards compatibility)
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
