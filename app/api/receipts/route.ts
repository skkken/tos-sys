import { NextRequest, NextResponse } from 'next/server'
import { withAuth, type ApiContext } from '@/lib/api/handler'
import { parseRequest } from '@/lib/validations'
import { receiptCreateSchema } from '@/lib/validations/receipt'

export const GET = withAuth(async (req: NextRequest, { supabase }: ApiContext) => {
  const { searchParams } = req.nextUrl
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit') ?? '20')))
  const offset = (page - 1) * limit

  const { data, error, count } = await supabase
    .from('receipts')
    .select('*', { count: 'exact' })
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) throw error

  return NextResponse.json({ data: data ?? [], total: count ?? 0 })
})

export const POST = withAuth(async (req: NextRequest, { supabase }: ApiContext) => {
  const parsed = await parseRequest(receiptCreateSchema, req)
  if (!parsed.success) return parsed.error

  const { data, error } = await supabase
    .from('receipts')
    .insert(parsed.data)
    .select()
    .single()

  if (error) throw error

  return NextResponse.json(data, { status: 201 })
})
