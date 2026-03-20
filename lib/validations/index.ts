import { z } from 'zod'
import { NextResponse } from 'next/server'

export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '日付は YYYY-MM-DD 形式で入力してください')
export const uuidSchema = z.string().uuid()

export function parseBody<T>(schema: z.ZodSchema<T>, body: unknown):
  { success: true; data: T } | { success: false; error: NextResponse } {
  const result = schema.safeParse(body)
  if (!result.success) {
    const flat = result.error.flatten()
    const firstError = flat.formErrors[0] ?? Object.values(flat.fieldErrors).flat()[0] ?? 'バリデーションエラー'
    return {
      success: false,
      error: NextResponse.json({ error: firstError, details: flat.fieldErrors }, { status: 400 }),
    }
  }
  return { success: true, data: result.data }
}

export async function parseRequest<T>(schema: z.ZodSchema<T>, req: Request):
  Promise<{ success: true; data: T } | { success: false; error: NextResponse }> {
  let body: unknown
  try { body = await req.json() } catch {
    return { success: false, error: NextResponse.json({ error: 'リクエストボディが不正です' }, { status: 400 }) }
  }
  return parseBody(schema, body)
}
