import Link from 'next/link'
import type { TaskWithProject } from '@/lib/types/task'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardAction,
} from '@/components/ui/card'

interface TaskDetailProps {
  task: TaskWithProject
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateOnly(dateString: string) {
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function DetailItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-2 py-2 border-b last:border-b-0">
      <dt className="text-muted-foreground font-medium">{label}</dt>
      <dd>{value || '—'}</dd>
    </div>
  )
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

export function TaskDetail({ task }: TaskDetailProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" render={<Link href="/tasks" />}>
          ← 一覧に戻る
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {task.title}
            <Badge variant={statusVariants[task.status]}>
              {statusLabels[task.status]}
            </Badge>
            <Badge variant={priorityVariants[task.priority]}>
              {priorityLabels[task.priority]}
            </Badge>
          </CardTitle>
          <CardAction>
            <Button variant="outline" size="sm" render={<Link href={`/tasks/${task.id}/edit`} />}>
              編集
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          <dl className="text-sm">
            <DetailItem label="タイトル" value={task.title} />
            <DetailItem label="説明" value={task.description} />
            <DetailItem label="プロジェクト" value={task.projects?.name ?? null} />
            <DetailItem label="ステータス" value={statusLabels[task.status]} />
            <DetailItem label="優先度" value={priorityLabels[task.priority]} />
            <DetailItem label="期限" value={task.due_date ? formatDateOnly(task.due_date) : null} />
            <DetailItem label="完了日時" value={task.completed_at ? formatDate(task.completed_at) : null} />
            <DetailItem label="作成日" value={formatDate(task.created_at)} />
            <DetailItem label="更新日" value={formatDate(task.updated_at)} />
          </dl>
        </CardContent>
      </Card>
    </div>
  )
}
