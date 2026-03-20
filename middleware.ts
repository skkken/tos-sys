import { NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const { user, supabaseResponse } = await updateSession(request)

  // 未認証ユーザーが保護ルートにアクセスした場合、/login にリダイレクト
  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * 以下を除く全てのリクエストパスにマッチ:
     * - _next/static (静的ファイル)
     * - _next/image (画像最適化)
     * - favicon.ico (ファビコン)
     * - /login (ログインページ)
     * - /api/auth (認証 API)
     */
    '/((?!_next/static|_next/image|favicon.ico|login|api/auth).*)',
  ],
}
