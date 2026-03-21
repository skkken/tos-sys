'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createAuthServerClient } from '@/lib/supabase/auth-server'
import type { TaskWithProject } from '@/lib/types/task'
import type { TaskStatus, TaskPriority } from '@/lib/validations/task'
import { taskCreateSchema, taskUpdateSchema } from '@/lib/validations/task'
import type { ActionState } from '@/lib/actions/customer'

export async function getTasks(params: {
  status?: TaskStatus | 'all'
  priority?: TaskPriority | 'all'
  projectId?: string | 'all'
  sortBy?: 'priority' | 'due_date' | 'created_at'
  sortOrder?: 'asc' | 'desc'
  groupBy?: 'project'
} = {}): Promise<TaskWithProject[]> {
  const {
    status = 'all',
    priority = 'all',
    projectId = 'all',
    sortBy = 'created_at',
    sortOrder = 'desc',
  } = params

  const supabase = await createAuthServerClient()

  let query = supabase
    .from('tasks')
    .select('*, projects:project_id(id, name)')

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  if (priority !== 'all') {
    query = query.eq('priority', priority)
  }

  if (projectId !== 'all') {
    query = query.eq('project_id', projectId)
  }

  // priority ソートはCASE式が使えないため、クライアント側でソートする
  if (sortBy === 'priority') {
    // デフォルトで created_at でソートし、後でクライアントソート
    query = query.order('created_at', { ascending: false })
  } else {
    query = query.order(sortBy, {
      ascending: sortOrder === 'asc',
      nullsFirst: false,
    })
  }

  const { data, error } = await query

  if (error) {
    console.error('タスク一覧取得エラー:', error)
    return []
  }

  let tasks = data as TaskWithProject[]

  // 優先度ソート（CASE式の代替: urgent=0, high=1, medium=2, low=3）
  if (sortBy === 'priority') {
    const priorityWeight: Record<string, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    }
    tasks = tasks.sort((a, b) => {
      const diff = priorityWeight[a.priority] - priorityWeight[b.priority]
      if (sortOrder === 'desc') return -diff
      return diff
    })
  }

  return tasks
}

export async function getTask(id: string): Promise<TaskWithProject | null> {
  const supabase = await createAuthServerClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('*, projects:project_id(id, name)')
    .eq('id', id)
    .single()

  if (error) {
    console.error('タスク取得エラー:', error)
    return null
  }

  return data as TaskWithProject
}

export async function createTask(
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    project_id: formData.get('project_id') || null,
    status: formData.get('status') || undefined,
    priority: formData.get('priority') || undefined,
    due_date: formData.get('due_date') || null,
  }

  const result = taskCreateSchema.safeParse(rawData)

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
    .from('tasks')
    .insert({ ...result.data, user_id: user.id })

  if (error) {
    console.error('タスク作成エラー:', error)
    return {
      success: false,
      message: 'タスクの作成に失敗しました',
    }
  }

  revalidatePath('/tasks')
  redirect('/tasks')
}

export async function updateTask(
  id: string,
  prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const rawData = {
    title: formData.get('title'),
    description: formData.get('description'),
    project_id: formData.get('project_id') || null,
    status: formData.get('status') || undefined,
    priority: formData.get('priority') || undefined,
    due_date: formData.get('due_date') || null,
  }

  const result = taskUpdateSchema.safeParse(rawData)

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

  // completed_at の自動設定
  const updateData: Record<string, unknown> = { ...result.data }
  if (result.data.status === 'done') {
    updateData.completed_at = new Date().toISOString()
  } else if (result.data.status) {
    updateData.completed_at = null
  }

  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('タスク更新エラー:', error)
    return {
      success: false,
      message: 'タスクの更新に失敗しました',
    }
  }

  revalidatePath('/tasks')
  revalidatePath(`/tasks/${id}`)
  redirect(`/tasks/${id}`)
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus
): Promise<ActionState> {
  const supabase = await createAuthServerClient()

  const updateData: Record<string, unknown> = { status }
  if (status === 'done') {
    updateData.completed_at = new Date().toISOString()
  } else {
    updateData.completed_at = null
  }

  const { error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)

  if (error) {
    console.error('タスクステータス更新エラー:', error)
    return {
      success: false,
      message: 'ステータスの更新に失敗しました',
    }
  }

  revalidatePath('/tasks')

  return {
    success: true,
    message: 'ステータスを更新しました',
  }
}

export async function deleteTask(id: string): Promise<ActionState> {
  const supabase = await createAuthServerClient()

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('タスク削除エラー:', error)
    return {
      success: false,
      message: 'タスクの削除に失敗しました',
    }
  }

  revalidatePath('/tasks')

  return {
    success: true,
    message: 'タスクを削除しました',
  }
}
