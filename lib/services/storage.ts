import type { SupabaseClient } from '@supabase/supabase-js'

const BUCKET = 'receipts'
const SIGNED_URL_EXPIRY = 3600 // 1時間

export async function uploadReceiptImage(
  supabase: SupabaseClient,
  file: Buffer,
  userId: string,
  fileName: string,
  contentType: string
): Promise<string> {
  const storagePath = `${userId}/${Date.now()}_${fileName}`

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType, upsert: false })

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`)
  }

  return storagePath
}

export async function getReceiptSignedUrl(
  supabase: SupabaseClient,
  storagePath: string
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(storagePath, SIGNED_URL_EXPIRY)

  if (error || !data?.signedUrl) {
    throw new Error(`Failed to create signed URL: ${error?.message}`)
  }

  return data.signedUrl
}

export async function deleteReceiptImage(
  supabase: SupabaseClient,
  storagePath: string
): Promise<void> {
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([storagePath])

  if (error) {
    throw new Error(`Storage delete failed: ${error.message}`)
  }
}
