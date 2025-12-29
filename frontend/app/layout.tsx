import type { Metadata } from 'next'
import Link from 'next/link'
import MobileNav from './components/MobileNav'
import AuthButtons from './components/AuthButtons'
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
      </head>
      <body className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 backdrop-blur-sm bg-white/90">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-2 sm:space-x-3 group">
                  <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="text-white text-lg sm:text-xl font-bold">B</span>
                  </div>
                  <span className="text-lg sm:text-xl font-bold text-slate-900">건물 유지보수</span>
                </Link>
              </div>

              {/* Desktop navigation */}
              <div className="hidden md:flex items-center space-x-1">
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
                  href="/my-requests"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  내 요청
                </Link>
                <Link
                  href="/admin/dashboard"
                  className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors font-medium"
                >
                  관리자
                </Link>
                <AuthButtons />
              </div>

              {/* Mobile navigation */}
              <MobileNav />
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="bg-white border-t border-slate-200 mt-12 sm:mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="text-center text-slate-600 text-xs sm:text-sm">
              <p>© 2025 건물 유지보수 관리 시스템. Made with Claude Code.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  )
}
