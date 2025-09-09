import { NextRequest, NextResponse } from 'next/server'
import { uploadFile } from '@/server/s3'
import { cloudWatchLogger } from '@/server/cloudwatch'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only images are allowed.' 
      }, { status: 400 })
    }

    // Validate file size (5MB limit)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: 'File too large. Maximum size is 5MB.' 
      }, { status: 400 })
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())
    
    // Upload to S3
    const result = await uploadFile(
      buffer,
      file.name,
      file.type,
      'project-images'
    )

    if (!result.success) {
      await cloudWatchLogger.error('File upload failed', { 
        fileName: file.name, 
        error: result.error 
      })
      return NextResponse.json({ 
        error: result.error || 'Upload failed' 
      }, { status: 500 })
    }

    await cloudWatchLogger.info('File uploaded successfully', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      s3Key: result.key
    })

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type
    })

  } catch (error) {
    await cloudWatchLogger.error('Upload API error', { error: error instanceof Error ? error.message : 'Unknown error' })
    return NextResponse.json({ 
      error: 'Internal server error' 
    }, { status: 500 })
  }
}
