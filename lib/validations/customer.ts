import { z } from 'zod'

export const customerStatusSchema = z.enum(['active', 'inactive'])
export type CustomerStatus = z.infer<typeof customerStatusSchema>

export const customerBaseSchema = z.object({
  name: z.string().min(1, '名前は必須です'),
  name_kana: z.string().optional(),
  company_name: z.string().optional(),
  email: z.string().email('メールアドレスの形式が正しくありません').optional().or(z.literal('')),
  phone: z.string().optional(),
  postal_code: z.string().optional(),
  address: z.string().optional(),
  contact_person: z.string().optional(),
  notes: z.string().optional(),
})

export const customerCreateSchema = customerBaseSchema
export type CustomerCreateInput = z.infer<typeof customerCreateSchema>

export const customerUpdateSchema = customerBaseSchema.extend({
  status: customerStatusSchema.optional(),
})
export type CustomerUpdateInput = z.infer<typeof customerUpdateSchema>
