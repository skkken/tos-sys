'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAuthServerClient } from '@/lib/supabase/auth-server'
import type { Project } from '@/lib/types/project'
import type { ProjectStatus } from '@/lib/validations/project'
import { projectCreateSchema, projectUpdateSchema } from '@/lib/validations/project'
import type { ActionState } from '@/lib/actions/customer'

export async function getProjects(params: {
  status?: ProjectStatus | 'all'
} = {}): Promise<Project[]> {
  const { status = 'all' } = params

  const supabase = await createAuthServerClient()

  let query = supabase.from('projects').select('*')

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  query = query.order('created_at', { ascending: false })

  const { data, error } = await query

  if (error) {
    console.error('プロジェクト一覧取得エラー:', error)
    return []
  }

  return data as Project[]
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createAuthServerClient()

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('プロジェクト取得エラー:', error)
    return null
  }

  return data as Project
}

export async function createProject(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
    customer_id: formData.get('customer_id') || null,
    status: formData.get('status') || undefined,
    start_date: formData.get('start_date') || null,
    end_date: formData.get('end_date') || null,
  }

  const result = projectCreateSchema.safeParse(rawData)

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
    .from('projects')
    .insert({ ...result.data, user_id: user.id })

  if (error) {
    console.error('プロジェクト作成エラー:', error)
    return {
      success: false,
      message: 'プロジェクトの作成に失敗しました',
    }
  }

  revalidatePath('/tasks')
  redirect('/tasks')
}

export async function updateProject(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    name: formData.get('name'),
    description: formData.get('description'),
    customer_id: formData.get('customer_id') || null,
    status: formData.get('status') || undefined,
    start_date: formData.get('start_date') || null,
    end_date: formData.get('end_date') || null,
  }

  const result = projectUpdateSchema.safeParse(rawData)

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
    .from('projects')
    .update(result.data)
    .eq('id', id)

  if (error) {
    console.error('プロジェクト更新エラー:', error)
    return {
      success: false,
      message: 'プロジェクトの更新に失敗しました',
    }
  }

  revalidatePath('/tasks')
  return {
    success: true,
    message: 'プロジェクトを更新しました',
  }
}

export async function deleteProject(id: string): Promise<ActionState> {
  const supabase = await createAuthServerClient()

  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('プロジェクト削除エラー:', error)
    return {
      success: false,
      message: 'プロジェクトの削除に失敗しました',
    }
  }

  revalidatePath('/tasks')

  return {
    success: true,
    message: 'プロジェクトを削除しました',
  }
}
