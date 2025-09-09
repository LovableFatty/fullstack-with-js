import { NextResponse } from 'next/server'
import { s3Client, S3_BUCKET_NAME } from '@/server/aws'
import { cloudWatchLogger } from '@/server/cloudwatch'

export async function GET() {
  try {
    // Test S3 connection
    const { ListBucketsCommand } = await import('@aws-sdk/client-s3')
    const command = new ListBucketsCommand({})
    const response = await s3Client.send(command)
    
    // Test CloudWatch logging
    await cloudWatchLogger.info('AWS integration test successful', {
      bucketName: S3_BUCKET_NAME,
      availableBuckets: response.Buckets?.length || 0
    })

    return NextResponse.json({
      success: true,
      message: 'AWS integration working!',
      bucketName: S3_BUCKET_NAME,
      availableBuckets: response.Buckets?.map(bucket => bucket.Name) || [],
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    await cloudWatchLogger.error('AWS integration test failed', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    })
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
