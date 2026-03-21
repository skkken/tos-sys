import { NextRequest, NextResponse } from 'next/server'
import { withAuth, type ApiContext } from '@/lib/api/handler'
import { clientError } from '@/lib/errors'
import { uploadReceiptImage } from '@/lib/services/storage'
import { analyzeReceipt } from '@/lib/services/ocr'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png'] as const

export const POST = withAuth(async (req: NextRequest, { supabase, user }: ApiContext) => {
  const formData = await req.formData()
  const file = formData.get('file')

  if (!file || !(file instanceof File)) {
    return clientError('画像ファイルが必要です')
  }

  if (!ALLOWED_TYPES.includes(file.type as typeof ALLOWED_TYPES[number])) {
    return clientError('JPEG/PNG形式の画像を選択してください')
  }

  if (file.size > MAX_FILE_SIZE) {
    return clientError('画像サイズは5MB以下にしてください')
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const storagePath = await uploadReceiptImage(supabase, buffer, user.id, file.name, file.type)

  const mediaType = file.type as 'image/jpeg' | 'image/png'
  const imageBase64 = buffer.toString('base64')
  const ocrResult = await analyzeReceipt(imageBase64, mediaType)

  return NextResponse.json({ storagePath, ocrResult })
})
