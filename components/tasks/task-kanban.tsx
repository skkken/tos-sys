import { TaskCard } from '@/components/tasks/task-card'
import type { TaskWithProject } from '@/lib/types/task'
import type { TaskStatus } from '@/lib/validations/task'

const statusColumns: { key: TaskStatus; label: string }[] = [
  { key: 'todo', label: '未着手' },
  { key: 'in_progress', label: '進行中' },
  { key: 'done', label: '完了' },
  { key: 'cancelled', label: 'キャンセル' },
]

export function TaskKanban({ tasks }: { tasks: TaskWithProject[] }) {
  if (tasks.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-8">
        該当するタスクがありません
      </p>
    )
  }

  const tasksByStatus = statusColumns.map((col) => ({
    ...col,
    tasks: tasks.filter((t) => t.status === col.key),
  }))

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {tasksByStatus.map((col) => (
        <div key={col.key} className="flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2">
            <h3 className="text-sm font-medium">{col.label}</h3>
            <span className="text-xs text-muted-foreground">{col.tasks.length}</span>
          </div>
          <div className="flex flex-col gap-2">
            {col.tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
