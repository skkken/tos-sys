'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { List, LayoutGrid } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Project } from '@/lib/types/project'

interface TaskFiltersProps {
  projects: Project[]
  defaultView?: string
  defaultStatus?: string
  defaultPriority?: string
  defaultProjectId?: string
  defaultSortBy?: string
  defaultSortOrder?: string
  defaultGroupBy?: string
}

export function TaskFilters({
  projects,
  defaultView = 'list',
  defaultStatus = 'all',
  defaultPriority = 'all',
  defaultProjectId = 'all',
  defaultSortBy = 'created_at',
  defaultSortOrder = 'desc',
  defaultGroupBy = '',
}: TaskFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const updateSearchParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value && value !== 'all' && value !== '') {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.push(`/tasks?${params.toString()}`)
      })
    },
    [router, searchParams, startTransition]
  )

  const setView = useCallback(
    (view: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (view === 'list') {
        params.delete('view')
      } else {
        params.set('view', view)
      }
      startTransition(() => {
        router.push(`/tasks?${params.toString()}`)
      })
    },
    [router, searchParams, startTransition]
  )

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap">
        <Select
          defaultValue={defaultStatus}
          onValueChange={(value) => updateSearchParams('status', value)}
        >
          <SelectTrigger className="sm:w-[150px]">
            <SelectValue placeholder="ステータス" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全てのステータス</SelectItem>
            <SelectItem value="todo">未着手</SelectItem>
            <SelectItem value="in_progress">進行中</SelectItem>
            <SelectItem value="done">完了</SelectItem>
            <SelectItem value="cancelled">キャンセル</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue={defaultPriority}
          onValueChange={(value) => updateSearchParams('priority', value)}
        >
          <SelectTrigger className="sm:w-[150px]">
            <SelectValue placeholder="優先度" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全ての優先度</SelectItem>
            <SelectItem value="urgent">緊急</SelectItem>
            <SelectItem value="high">高</SelectItem>
            <SelectItem value="medium">中</SelectItem>
            <SelectItem value="low">低</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue={defaultProjectId}
          onValueChange={(value) => updateSearchParams('projectId', value)}
        >
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="プロジェクト" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">全てのプロジェクト</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          defaultValue={defaultSortBy}
          onValueChange={(value) => updateSearchParams('sortBy', value)}
        >
          <SelectTrigger className="sm:w-[150px]">
            <SelectValue placeholder="ソート項目" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at">作成日</SelectItem>
            <SelectItem value="priority">優先度</SelectItem>
            <SelectItem value="due_date">期限</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue={defaultSortOrder}
          onValueChange={(value) => updateSearchParams('sortOrder', value)}
        >
          <SelectTrigger className="sm:w-[120px]">
            <SelectValue placeholder="順序" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">昇順</SelectItem>
            <SelectItem value="desc">降順</SelectItem>
          </SelectContent>
        </Select>

        <Select
          defaultValue={defaultGroupBy || 'none'}
          onValueChange={(value) => updateSearchParams('groupBy', value === 'none' ? null : value)}
        >
          <SelectTrigger className="sm:w-[180px]">
            <SelectValue placeholder="グルーピング" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">グルーピングなし</SelectItem>
            <SelectItem value="project">プロジェクト別</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-1 ml-auto">
          <Button
            variant={defaultView === 'list' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={defaultView === 'kanban' ? 'default' : 'outline'}
            size="icon"
            onClick={() => setView('kanban')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
