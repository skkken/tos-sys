import Link from 'next/link'
import { isPast, parseISO, format } from 'date-fns'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { TaskWithProject } from '@/lib/types/task'

const priorityConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  urgent: { label: '緊急', variant: 'destructive' },
  high: { label: '高', variant: 'default' },
  medium: { label: '中', variant: 'secondary' },
  low: { label: '低', variant: 'outline' },
}

export function TaskCard({ task }: { task: TaskWithProject }) {
  const priority = priorityConfig[task.priority]
  const isOverdue = task.due_date && task.status !== 'done' && isPast(parseISO(task.due_date))

  return (
    <Link href={`/tasks/${task.id}`} className="block">
      <Card size="sm" className="hover:ring-foreground/20 transition-all cursor-pointer">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant={priority.variant}>{priority.label}</Badge>
          </div>
          <CardTitle>{task.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            {task.projects && (
              <span>{task.projects.name}</span>
            )}
            {task.due_date && (
              <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                期限: {format(parseISO(task.due_date), 'yyyy/MM/dd')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
