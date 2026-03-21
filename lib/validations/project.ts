import { z } from 'zod'

export const projectStatusSchema = z.enum(['active', 'completed', 'on_hold', 'cancelled'])
export type ProjectStatus = z.infer<typeof projectStatusSchema>

export const projectBaseSchema = z.object({
  name: z.string().min(1, 'プロジェクト名は必須です'),
  description: z.string().optional(),
  customer_id: z.string().uuid().optional().nullable(),
  status: projectStatusSchema.optional(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
})

export const projectCreateSchema = projectBaseSchema
export type ProjectCreateInput = z.infer<typeof projectCreateSchema>

export const projectUpdateSchema = projectBaseSchema.extend({
  status: projectStatusSchema.optional(),
})
export type ProjectUpdateInput = z.infer<typeof projectUpdateSchema>
