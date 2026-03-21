import { z } from 'zod'
import { dateSchema } from './index'

export const paymentMethodSchema = z.enum(['card', 'cash', 'other'])
export type PaymentMethod = z.infer<typeof paymentMethodSchema>

export const receiptCreateSchema = z.object({
  amount: z.number().int().positive(),
  date: dateSchema,
  store_name: z.string().min(1),
  payment_method: paymentMethodSchema,
  storage_path: z.string().min(1),
})

export type ReceiptCreateRequest = z.infer<typeof receiptCreateSchema>

export const receiptUpdateSchema = z.object({
  amount: z.number().int().positive().optional(),
  date: dateSchema.optional(),
  store_name: z.string().min(1).optional(),
  payment_method: paymentMethodSchema.optional(),
})

export type ReceiptUpdateRequest = z.infer<typeof receiptUpdateSchema>
