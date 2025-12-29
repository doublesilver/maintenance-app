import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="py-12 sm:py-16 md:py-20 text-center">
        <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-primary-50 text-primary-700 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
          <svg className="w-3 h-3 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          AI 기반 스마트 관리 시스템
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight px-4">
          건물 유지보수,
          <br className="sm:hidden" />{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-emerald-600">
            이제는 스마트하게
          </span>
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-slate-600 mb-8 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-4">
          AI가 자동으로 분류하고 우선순위를 매기는
          <br className="hidden sm:block" />
          차세대 건물 유지보수 관리 플랫폼
        </p>

        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
          <Link
            href="/submit"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg hover:shadow-xl font-semibold text-base sm:text-lg"
          >
            유지보수 요청하기
            <svg className="w-4 h-4 sm:w-5 sm:h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-slate-700 rounded-xl hover:bg-slate-50 transition-all border-2 border-slate-200 font-semibold text-base sm:text-lg"
          >
            대시보드 보기
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="py-12 sm:py-16 md:py-20">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4 px-4">주요 기능</h2>
          <p className="text-base sm:text-lg text-slate-600 px-4">효율적인 건물 관리를 위한 핵심 기능들</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">AI 자동 분류</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              OpenAI를 활용해 요청을 자동으로 전기, 배관, HVAC, 구조, 기타로 분류하고 우선순위를 평가합니다
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm">전기</span>
              <span className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-sm">배관</span>
              <span className="px-3 py-1 bg-orange-50 text-orange-700 rounded-lg text-sm">HVAC</span>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">비동기 처리</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              Celery와 Redis를 활용한 백그라운드 작업으로 응답 속도를 25배 향상시켰습니다
            </p>
            <div className="flex items-center text-primary-600 font-semibold">
              <span className="text-2xl">0.1초</span>
              <span className="ml-2 text-sm text-slate-500">평균 응답 시간</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-8 rounded-2xl border border-slate-200 hover:border-primary-300 hover:shadow-lg transition-all group">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">실시간 대시보드</h3>
            <p className="text-slate-600 leading-relaxed mb-4">
              WebSocket을 통해 모든 요청의 상태를 실시간으로 확인하고 관리할 수 있습니다
            </p>
            <Link href="/dashboard" className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center">
              대시보드 보기
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-12 sm:py-16 md:py-20">
        <div className="bg-gradient-to-br from-primary-600 to-emerald-600 rounded-2xl sm:rounded-3xl p-8 sm:p-12 text-white">
          <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center">
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">25배</div>
              <div className="text-primary-100 text-xs sm:text-sm md:text-base lg:text-lg">응답 속도 향상</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">5개</div>
              <div className="text-primary-100 text-xs sm:text-sm md:text-base lg:text-lg">자동 분류 카테고리</div>
            </div>
            <div>
              <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-1 sm:mb-2">실시간</div>
              <div className="text-primary-100 text-xs sm:text-sm md:text-base lg:text-lg">상태 업데이트</div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div className="py-12 sm:py-16 md:py-20">
        <div className="text-center mb-10 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-3 sm:mb-4 px-4">이용 방법</h2>
          <p className="text-base sm:text-lg text-slate-600 px-4">3단계로 간편하게 요청하세요</p>
        </div>

        <div className="grid sm:grid-cols-3 gap-8 sm:gap-6 md:gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              1
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">요청 작성</h3>
            <p className="text-slate-600">
              문제 상황을 자세히 설명하고 위치와 연락처를 입력합니다
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              2
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">AI 자동 분류</h3>
            <p className="text-slate-600">
              AI가 카테고리와 우선순위를 자동으로 판단합니다
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6">
              3
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">실시간 추적</h3>
            <p className="text-slate-600">
              대시보드에서 처리 상태를 실시간으로 확인할 수 있습니다
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <Link
            href="/submit"
            className="inline-flex items-center px-8 py-4 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg font-semibold text-lg"
          >
            지금 시작하기
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}
