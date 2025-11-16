export default async function handler(req, res) {
  return res.status(200).json({
    hasAccessKeyId: !!process.env.AWS_ACCESS_KEY_ID,
    hasSecretAccessKey: !!process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION || 'not set',
    tableName: process.env.DYNAMODB_TABLE_NAME || 'not set',
    accessKeyIdPrefix: process.env.AWS_ACCESS_KEY_ID?.substring(0, 5) || 'not set',
    nodeEnv: process.env.NODE_ENV
  });
}
