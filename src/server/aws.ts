import { S3Client } from '@aws-sdk/client-s3'
import { CloudWatchLogsClient } from '@aws-sdk/client-cloudwatch-logs'

// AWS Configuration
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

export const cloudWatchClient = new CloudWatchLogsClient({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
})

// S3 Configuration
export const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'fullstack-project-files'
export const S3_REGION = process.env.AWS_REGION || 'us-east-2'
