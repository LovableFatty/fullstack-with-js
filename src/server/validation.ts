import { z } from 'zod'

export const createProjectSchema = z.object({
  name: z.string().min(1).max(64),
  ownerEmail: z.string().email(),
  description: z.string().optional(),
  url: z.string().url().optional(),
  key: z.string().optional(),
})

export type CreateProjectInput = z.infer<typeof createProjectSchema>

export const createTaskSchema = z.object({
  title: z.string().min(1).max(255),
  projectId: z.string().min(1),
})

export type CreateTaskInput = z.infer<typeof createTaskSchema>
