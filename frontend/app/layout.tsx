import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: '건물 유지보수 관리 시스템',
  description: 'AI 기반 스마트 건물 유지보수 요청 관리 플랫폼',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css"
        />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-3 group">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="text-white text-xl font-bold">B</span>
                  </div>
                  <span className="text-xl font-bold text-slate-900">건물 유지보수</span>
                </Link>
              </div>
              <div className="flex items-center space-x-1">
                <Link
                  href="/"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  홈
                </Link>
                <Link
                  href="/submit"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  요청하기
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-primary-600 text-white hover:bg-primary-700 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  대시보드
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-white border-t border-slate-200 mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="text-center text-slate-600 text-sm">
              <p>© 2025 건물 유지보수 관리 시스템. Made with Claude Code.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
