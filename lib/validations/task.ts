import { z } from 'zod'

export const taskStatusSchema = z.enum(['todo', 'in_progress', 'done', 'cancelled'])
export type TaskStatus = z.infer<typeof taskStatusSchema>

export const taskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent'])
export type TaskPriority = z.infer<typeof taskPrioritySchema>

export const taskBaseSchema = z.object({
  title: z.string().min(1, 'タイトルは必須です'),
  description: z.string().optional(),
  project_id: z.string().uuid().optional().nullable(),
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
  due_date: z.string().optional().nullable(),
})

export const taskCreateSchema = taskBaseSchema
export type TaskCreateInput = z.infer<typeof taskCreateSchema>

export const taskUpdateSchema = taskBaseSchema.extend({
  status: taskStatusSchema.optional(),
  priority: taskPrioritySchema.optional(),
})
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>
