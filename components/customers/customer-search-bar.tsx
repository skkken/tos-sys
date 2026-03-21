'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useTransition } from 'react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface CustomerSearchBarProps {
  defaultSearch?: string
  defaultStatus?: string
  defaultSortBy?: string
  defaultSortOrder?: string
}

export function CustomerSearchBar({
  defaultSearch = '',
  defaultStatus = 'active',
  defaultSortBy = 'created_at',
  defaultSortOrder = 'desc',
}: CustomerSearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const updateSearchParams = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      startTransition(() => {
        router.push(`/customers?${params.toString()}`)
      })
    },
    [router, searchParams, startTransition]
  )

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <Input
        placeholder="名前・会社名で検索..."
        defaultValue={defaultSearch}
        onChange={(e) => updateSearchParams('search', e.target.value)}
        className="sm:max-w-xs"
      />
      <Select
        defaultValue={defaultStatus}
        onValueChange={(value) => updateSearchParams('status', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="ステータス" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">全て</SelectItem>
          <SelectItem value="active">アクティブ</SelectItem>
          <SelectItem value="inactive">非アクティブ</SelectItem>
        </SelectContent>
      </Select>
      <Select
        defaultValue={defaultSortBy}
        onValueChange={(value) => updateSearchParams('sortBy', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="ソート項目" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">名前</SelectItem>
          <SelectItem value="company_name">会社名</SelectItem>
          <SelectItem value="created_at">作成日</SelectItem>
        </SelectContent>
      </Select>
      <Select
        defaultValue={defaultSortOrder}
        onValueChange={(value) => updateSearchParams('sortOrder', value)}
      >
        <SelectTrigger>
          <SelectValue placeholder="順序" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="asc">昇順</SelectItem>
          <SelectItem value="desc">降順</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
