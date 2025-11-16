import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || 'scmi-rsvps';

/**
 * Ensure the DynamoDB table exists, creating it if necessary
 */
export async function ensureTableExists() {
  try {
    // Check if table exists
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    console.log(`Table ${TABLE_NAME} already exists`);
    return true;
  } catch (err) {
    if (err.name === 'ResourceNotFoundException') {
      // Table doesn't exist, create it
      console.log(`Creating table ${TABLE_NAME}...`);
      
      await client.send(new CreateTableCommand({
        TableName: TABLE_NAME,
        KeySchema: [
          { AttributeName: 'id', KeyType: 'HASH' }  // Partition key
        ],
        AttributeDefinitions: [
          { AttributeName: 'id', AttributeType: 'S' }
        ],
        BillingMode: 'PAY_PER_REQUEST'  // On-demand pricing
      }));
      
      console.log(`Table ${TABLE_NAME} created successfully`);
      return true;
    }
    
    console.error('Error checking/creating table:', err);
    throw err;
  }
}

export { TABLE_NAME };
