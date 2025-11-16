import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Fetch all RSVPs ordered by most recent
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
      rsvps: rsvps
    });
  } catch (err) {
    console.error('Error fetching RSVPs:', err);
    return res.status(500).json({ 
      error: 'Failed to fetch RSVPs', 
      detail: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
  }
}

