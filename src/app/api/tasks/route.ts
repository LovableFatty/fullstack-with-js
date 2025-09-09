import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/server/db'
import { createTaskSchema } from '@/server/validation'
import { logger } from '@/server/logger'

export async function POST(req: NextRequest) {
  try {
    const json = await req.json()
    const { title, projectId } = createTaskSchema.parse(json)
    
    // Verify the project exists
    const project = await prisma.project.findUnique({
      where: { id: projectId }
    })
    
    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 })
    }
    
    const task = await prisma.task.create({ 
      data: { title, projectId } 
    })
    
    logger.info('Task created successfully', { taskId: task.id, projectId })
    return NextResponse.json(task, { status: 201 })
  } catch (err: any) {
    logger.warn('Failed to create task', { err })
    return NextResponse.json({ error: err.message ?? 'Bad Request' }, { status: 400 })
  }
}
