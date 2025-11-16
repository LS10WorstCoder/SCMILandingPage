import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { randomUUID } from 'crypto';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const dynamoDB = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'scmi-rsvps';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    return res.status(201).json({ 
      ok: true, 
      message: 'RSVP submitted successfully',
      id
    });
  } catch (err) {
    console.error('Error storing RSVP:', err);
    return res.status(500).json({ 
      error: 'Failed to store RSVP', 
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
}
