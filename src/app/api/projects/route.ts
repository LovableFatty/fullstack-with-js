import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { createProjectSchema } from '@/server/validation'
import { logger } from '@/server/logger'

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      include: { 
        owner: { select: { email: true, name: true } }, 
        tasks: true 
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(projects)
  } catch (error) {
    logger.error('Failed to fetch projects', { error })
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const { name, ownerEmail, description, url: imageUrl, key: imageKey } = createProjectSchema.parse(json)

    // Find or create the user
    const owner = await prisma.user.upsert({
      where: { email: ownerEmail },
      update: {},
      create: { email: ownerEmail },
    })

    // Create the project data object
    const projectData: any = { 
      name, 
      ownerId: owner.id 
    }
    
    if (description) {
      projectData.description = description
    }
    
    if (imageUrl) {
      projectData.imageUrl = imageUrl
    }
    
    if (imageKey) {
      projectData.imageKey = imageKey
    }

    // Create the project
    const project = await prisma.project.create({
      data: projectData,
      include: {
        owner: { select: { email: true, name: true } },
        tasks: true
      }
    })

    logger.info('Project created successfully', { projectId: project.id, ownerEmail, hasImage: !!imageUrl })
    return NextResponse.json(project, { status: 201 })
  } catch (err: any) {
    logger.warn('Failed to create project', { err })
    return NextResponse.json({ error: err.message ?? 'Bad Request' }, { status: 400 })
  }
}
