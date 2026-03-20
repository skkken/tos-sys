import { NextResponse } from 'next/server'

export function clientError(message: string, status: number = 400): NextResponse {
  return NextResponse.json({ error: message }, { status })
}

export function notFoundError(resourceName: string): NextResponse {
  return clientError(`${resourceName}が見つかりません`, 404)
}

export function apiError(
  error: unknown,
  route: string,
  method: string,
  options?: { message?: string; status?: number }
): NextResponse {
  console.error(`[API Error] ${method} ${route}:`, error)
  return NextResponse.json(
    { error: options?.message ?? 'サーバーエラーが発生しました' },
    { status: options?.status ?? 500 }
  )
}
