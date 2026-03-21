import { NextRequest, NextResponse } from 'next/server'
import { withAuth, type ApiContext } from '@/lib/api/handler'
import { parseRequest } from '@/lib/validations'
import { receiptUpdateSchema } from '@/lib/validations/receipt'
import { notFoundError } from '@/lib/errors'
import { getReceiptSignedUrl, deleteReceiptImage } from '@/lib/services/storage'

type Params = { id: string }

export const GET = withAuth<Params>(async (_req: NextRequest, { supabase, params }: ApiContext<Params>) => {
  const { data, error } = await supabase
    .from('receipts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) return notFoundError('領収書')

  const imageUrl = await getReceiptSignedUrl(supabase, data.storage_path)

  return NextResponse.json({ ...data, image_url: imageUrl })
})

export const PUT = withAuth<Params>(async (req: NextRequest, { supabase, params }: ApiContext<Params>) => {
  const parsed = await parseRequest(receiptUpdateSchema, req)
  if (!parsed.success) return parsed.error

  const { data, error } = await supabase
    .from('receipts')
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq('id', params.id)
    .select()
    .single()

  if (error || !data) return notFoundError('領収書')

  return NextResponse.json(data)
})

export const DELETE = withAuth<Params>(async (_req: NextRequest, { supabase, params }: ApiContext<Params>) => {
  const { data, error } = await supabase
    .from('receipts')
    .select('storage_path')
    .eq('id', params.id)
    .single()

  if (error || !data) return notFoundError('領収書')

  await deleteReceiptImage(supabase, data.storage_path)

  const { error: deleteError } = await supabase
    .from('receipts')
    .delete()
    .eq('id', params.id)

  if (deleteError) throw deleteError

  return NextResponse.json({ success: true })
})
