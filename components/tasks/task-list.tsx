import Link from 'next/link'
import { isPast, parseISO, format } from 'date-fns'
import type { TaskWithProject } from '@/lib/types/task'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface TaskListProps {
  tasks: TaskWithProject[]
  groupBy?: string
}

const statusLabels: Record<string, string> = {
  todo: '未着手',
  in_progress: '進行中',
  done: '完了',
  cancelled: 'キャンセル',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  todo: 'outline',
  in_progress: 'default',
  done: 'secondary',
  cancelled: 'destructive',
}

const priorityLabels: Record<string, string> = {
  low: '低',
  medium: '中',
  high: '高',
  urgent: '緊急',
}

const priorityVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  low: 'outline',
  medium: 'secondary',
  high: 'default',
  urgent: 'destructive',
}

function TaskTable({ tasks }: { tasks: TaskWithProject[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>タイトル</TableHead>
          <TableHead>ステータス</TableHead>
          <TableHead>優先度</TableHead>
          <TableHead>プロジェクト</TableHead>
          <TableHead>期限</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {tasks.map((task) => {
          const isOverdue =
            task.due_date &&
            task.status !== 'done' &&
            task.status !== 'cancelled' &&
            isPast(parseISO(task.due_date))

          return (
            <TableRow key={task.id}>
              <TableCell>
                <Link
                  href={`/tasks/${task.id}`}
                  className="font-medium text-primary hover:underline"
                >
                  {task.title}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant={statusVariants[task.status]}>
                  {statusLabels[task.status]}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant={priorityVariants[task.priority]}>
                  {priorityLabels[task.priority]}
                </Badge>
              </TableCell>
              <TableCell>
                {task.projects?.name ?? '—'}
              </TableCell>
              <TableCell>
                {task.due_date ? (
                  <span className={isOverdue ? 'text-red-500 font-medium' : ''}>
                    {format(parseISO(task.due_date), 'yyyy/MM/dd')}
                  </span>
                ) : (
                  '—'
                )}
              </TableCell>
            </TableRow>
          )
        })}
      </TableBody>
    </Table>
  )
}

export function TaskList({ tasks, groupBy }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        該当するタスクがありません
      </div>
    )
  }

  if (groupBy === 'project') {
    const grouped = new Map<string, { name: string; tasks: TaskWithProject[] }>()
    const noProject: TaskWithProject[] = []

    for (const task of tasks) {
      if (task.projects) {
        const group = grouped.get(task.projects.id)
        if (group) {
          group.tasks.push(task)
        } else {
          grouped.set(task.projects.id, { name: task.projects.name, tasks: [task] })
        }
      } else {
        noProject.push(task)
      }
    }

    return (
      <div className="space-y-6">
        {Array.from(grouped.values()).map((group) => (
          <div key={group.name}>
            <h3 className="text-lg font-semibold mb-2">{group.name}</h3>
            <TaskTable tasks={group.tasks} />
          </div>
        ))}
        {noProject.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">プロジェクトなし</h3>
            <TaskTable tasks={noProject} />
          </div>
        )}
      </div>
    )
  }

  return <TaskTable tasks={tasks} />
}
