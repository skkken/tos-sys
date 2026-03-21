'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAuthServerClient } from '@/lib/supabase/auth-server'
import type { Customer } from '@/lib/types/customer'
import { customerCreateSchema, customerUpdateSchema } from '@/lib/validations/customer'

export type ActionState = {
  success: boolean
  errors?: Record<string, string[]>
  message?: string
}

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

export async function updateCustomer(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    name: formData.get('name'),
    name_kana: formData.get('name_kana'),
    company_name: formData.get('company_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    postal_code: formData.get('postal_code'),
    address: formData.get('address'),
    contact_person: formData.get('contact_person'),
    notes: formData.get('notes'),
    status: formData.get('status'),
  }

  const result = customerUpdateSchema.safeParse(rawData)

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const [key, messages] of Object.entries(result.error.flatten().fieldErrors)) {
      if (messages) {
        fieldErrors[key] = messages
      }
    }
    return {
      success: false,
      errors: fieldErrors,
      message: '入力内容に誤りがあります',
    }
  }

  const supabase = await createAuthServerClient()

  const { error } = await supabase
    .from('customers')
    .update(result.data)
    .eq('id', id)

  if (error) {
    console.error('顧客更新エラー:', error)
    return {
      success: false,
      message: '顧客の更新に失敗しました',
    }
  }

  revalidatePath('/customers')
  revalidatePath(`/customers/${id}`)
  redirect(`/customers/${id}`)
}

export async function createCustomer(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    name: formData.get('name'),
    name_kana: formData.get('name_kana'),
    company_name: formData.get('company_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    postal_code: formData.get('postal_code'),
    address: formData.get('address'),
    contact_person: formData.get('contact_person'),
    notes: formData.get('notes'),
  }

  const result = customerCreateSchema.safeParse(rawData)

  if (!result.success) {
    const fieldErrors: Record<string, string[]> = {}
    for (const [key, messages] of Object.entries(result.error.flatten().fieldErrors)) {
      if (messages) {
        fieldErrors[key] = messages
      }
    }
    return {
      success: false,
      errors: fieldErrors,
      message: '入力内容に誤りがあります',
    }
  }

  const supabase = await createAuthServerClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return {
      success: false,
      message: '認証エラーが発生しました',
    }
  }

  const { error } = await supabase
    .from('customers')
    .insert({ ...result.data, user_id: user.id })

  if (error) {
    console.error('顧客作成エラー:', error)
    return {
      success: false,
      message: '顧客の作成に失敗しました',
    }
  }

  revalidatePath('/customers')
  redirect('/customers')
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = await createAuthServerClient()

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('顧客取得エラー:', error)
    return null
  }

  return data as Customer
}

export async function deleteCustomer(id: string): Promise<ActionState> {
  const supabase = await createAuthServerClient()

  const { error } = await supabase
    .from('customers')
    .update({ status: 'inactive' })
    .eq('id', id)

  if (error) {
    console.error('顧客削除エラー:', error)
    return {
      success: false,
      message: '顧客の削除に失敗しました',
    }
  }

  revalidatePath('/customers')

  return {
    success: true,
    message: '顧客を非アクティブにしました',
  }
}
