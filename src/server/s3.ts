import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, S3_BUCKET_NAME } from './aws'

export interface UploadResult {
  success: boolean
  url?: string
  key?: string
  error?: string
}

export async function uploadFile(
  file: Buffer,
  fileName: string,
  contentType: string,
  folder: string = 'uploads'
): Promise<UploadResult> {
  try {
    const key = `${folder}/${Date.now()}-${fileName}`
    
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
      // ACL removed - bucket policy will handle public access
    })

    await s3Client.send(command)
    
    const url = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`
    
    return {
      success: true,
      url,
      key,
    }
  } catch (error) {
    console.error('S3 upload error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    }
  }
}

export async function deleteFile(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key,
    })

    await s3Client.send(command)
    return true
  } catch (error) {
    console.error('S3 delete error:', error)
    return false
  }
}

export function getFileUrl(key: string): string {
  return `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${key}`
}
