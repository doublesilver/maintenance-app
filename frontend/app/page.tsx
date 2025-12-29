import Link from 'next/link'

export default function Home() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Welcome to Building Maintenance Manager
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          AI-powered 건물 유지보수 요청 관리 시스템
        </p>

        <div className="grid md:grid-cols-3 gap-8 mt-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">요청 제출</h3>
            <p className="text-gray-600 mb-4">
              건물 수리 및 유지보수 요청을 간편하게 제출하세요
            </p>
            <Link
              href="/submit"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
            >
              요청하기
            </Link>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI 자동 분류</h3>
            <p className="text-gray-600 mb-4">
              AI가 요청을 자동으로 카테고리화하고 우선순위를 평가합니다
            </p>
            <div className="text-sm text-gray-500">
              전기 · 배관 · HVAC · 구조 · 기타
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-semibold mb-2">실시간 추적</h3>
            <p className="text-gray-600 mb-4">
              대시보드에서 모든 요청의 상태를 실시간으로 확인하세요
            </p>
            <Link
              href="/dashboard"
              className="inline-block bg-primary-600 text-white px-6 py-2 rounded-md hover:bg-primary-700"
            >
              대시보드
            </Link>
          </div>
        </div>

        <div className="mt-16 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">주요 기능</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <div>
                <h4 className="font-semibold">AI 기반 카테고리화</h4>
                <p className="text-gray-600 text-sm">
                  OpenAI를 사용한 자동 분류 및 우선순위 설정
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <div>
                <h4 className="font-semibold">상태 추적</h4>
                <p className="text-gray-600 text-sm">
                  대기중, 진행중, 완료 상태 관리
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <div>
                <h4 className="font-semibold">실시간 대시보드</h4>
                <p className="text-gray-600 text-sm">
                  모든 요청을 한눈에 확인
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-3 text-xl">✓</span>
              <div>
                <h4 className="font-semibold">통계 및 분석</h4>
                <p className="text-gray-600 text-sm">
                  카테고리별, 상태별 통계 제공
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
