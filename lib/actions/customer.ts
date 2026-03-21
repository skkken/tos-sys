'use server'

import { createAuthServerClient } from '@/lib/supabase/auth-server'
import type { Customer } from '@/lib/types/customer'

export async function getCustomers(params: {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  sortBy?: 'name' | 'company_name' | 'created_at'
  sortOrder?: 'asc' | 'desc'
} = {}): Promise<Customer[]> {
  const {
    search,
    status = 'active',
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params

  const supabase = await createAuthServerClient()

  let query = supabase.from('customers').select('*')

  // ステータスフィルタ（デフォルトはactiveのみ）
  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // 検索キーワードによる名前・会社名の部分一致検索
  if (search && search.trim()) {
    const keyword = `%${search.trim()}%`
    query = query.or(`name.ilike.${keyword},company_name.ilike.${keyword}`)
  }

  // ソート
  query = query.order(sortBy, { ascending: sortOrder === 'asc' })

  const { data, error } = await query

  if (error) {
    console.error('顧客一覧取得エラー:', error)
    return []
  }

  return data as Customer[]
}
