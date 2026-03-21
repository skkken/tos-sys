import Link from 'next/link'
import { Plus } from 'lucide-react'
import { getTasks } from '@/lib/actions/task'
import { getProjects } from '@/lib/actions/project'
import { TaskFilters } from '@/components/tasks/task-filters'
import { TaskList } from '@/components/tasks/task-list'
import { TaskKanban } from '@/components/tasks/task-kanban'
import { Button } from '@/components/ui/button'
import type { TaskStatus, TaskPriority } from '@/lib/validations/task'

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string
    status?: string
    priority?: string
    projectId?: string
    sortBy?: string
    sortOrder?: string
    groupBy?: string
  }>
}) {
  const params = await searchParams
  const view = params.view ?? 'list'
  const status = (params.status as TaskStatus | 'all') ?? 'all'
  const priority = (params.priority as TaskPriority | 'all') ?? 'all'
  const projectId = params.projectId ?? 'all'
  const sortBy = (params.sortBy as 'priority' | 'due_date' | 'created_at') ?? 'created_at'
  const sortOrder = (params.sortOrder as 'asc' | 'desc') ?? 'desc'
  const groupBy = params.groupBy as 'project' | undefined

  const [tasks, projects] = await Promise.all([
    getTasks({ status, priority, projectId, sortBy, sortOrder, groupBy }),
    getProjects(),
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">タスク一覧</h1>
        <Button render={<Link href="/tasks/new" />}>
          <Plus className="size-4" />
          新規作成
        </Button>
      </div>
      <TaskFilters
        projects={projects}
        defaultView={view}
        defaultStatus={status}
        defaultPriority={priority}
        defaultProjectId={projectId}
        defaultSortBy={sortBy}
        defaultSortOrder={sortOrder}
        defaultGroupBy={groupBy}
      />
      {view === 'kanban' ? (
        <TaskKanban tasks={tasks} />
      ) : (
        <TaskList tasks={tasks} groupBy={groupBy} />
      )}
    </div>
  )
}
