'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { ActionState } from '@/lib/actions/customer'
import type { TaskWithProject } from '@/lib/types/task'
import type { Project } from '@/lib/types/project'

interface TaskFormProps {
  task?: TaskWithProject
  projects: Project[]
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>
}

const initialState: ActionState = {
  success: false,
}

export function TaskForm({ task, projects, action }: TaskFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState)

  return (
    <form action={formAction} className="space-y-6">
      {state.message && !state.success && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {state.message}
        </div>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">
            タイトル <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            name="title"
            defaultValue={task?.title ?? ''}
            aria-invalid={!!state.errors?.title}
            required
          />
          {state.errors?.title && (
            <p className="text-sm text-destructive">{state.errors.title[0]}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">説明</Label>
          <Textarea
            id="description"
            name="description"
            defaultValue={task?.description ?? ''}
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="project_id">プロジェクト</Label>
          <select
            id="project_id"
            name="project_id"
            defaultValue={task?.project_id ?? ''}
            className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="">未選択</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="status">ステータス</Label>
            <select
              id="status"
              name="status"
              defaultValue={task?.status ?? 'todo'}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="todo">未着手</option>
              <option value="in_progress">進行中</option>
              <option value="done">完了</option>
              <option value="cancelled">キャンセル</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="priority">優先度</Label>
            <select
              id="priority"
              name="priority"
              defaultValue={task?.priority ?? 'medium'}
              className="flex h-8 w-full rounded-lg border border-input bg-transparent px-2.5 py-1 text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="low">低</option>
              <option value="medium">中</option>
              <option value="high">高</option>
              <option value="urgent">緊急</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">期限</Label>
          <Input
            id="due_date"
            name="due_date"
            type="date"
            defaultValue={task?.due_date ?? ''}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? '保存中...' : task ? '更新する' : '作成する'}
        </Button>
        <Button
          variant="outline"
          render={<Link href={task ? `/tasks/${task.id}` : '/tasks'} />}
        >
          キャンセル
        </Button>
      </div>
    </form>
  )
}
