'use client'

import { useState } from 'react'
import axios from 'axios'
import Link from 'next/link'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export default function SubmitRequest() {
  const [formData, setFormData] = useState({
    description: '',
    location: '',
    contact_info: '',
  })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await axios.post(`${API_URL}/api/requests`, formData)
      setResult(response.data)
      setFormData({ description: '', location: '', contact_info: '' })
    } catch (err: any) {
      setError(err.response?.data?.detail || '요청 제출 중 오류가 발생했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      electrical: '전기',
      plumbing: '배관',
      hvac: '냉난방',
      structural: '구조',
      other: '기타',
    }
    return labels[category] || category
  }

  const getPriorityLabel = (priority: string) => {
    const labels: { [key: string]: string } = {
      urgent: '긴급',
      high: '높음',
      medium: '보통',
      low: '낮음',
    }
    return labels[priority] || priority
  }

  const getCategoryBadgeColor = (category: string) => {
    const colors: { [key: string]: string } = {
      electrical: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      plumbing: 'bg-blue-50 text-blue-700 border-blue-200',
      hvac: 'bg-orange-50 text-orange-700 border-orange-200',
      structural: 'bg-red-50 text-red-700 border-red-200',
      other: 'bg-slate-50 text-slate-700 border-slate-200',
    }
    return colors[category] || colors.other
  }

  const getPriorityBadgeColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      urgent: 'bg-red-50 text-red-700 border-red-200',
      high: 'bg-orange-50 text-orange-700 border-orange-200',
      medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      low: 'bg-green-50 text-green-700 border-green-200',
    }
    return colors[priority] || colors.medium
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-2 sm:mb-3">
          유지보수 요청하기
        </h1>
        <p className="text-base sm:text-lg text-slate-600">
          문제를 설명해주시면 AI가 자동으로 분류하고 우선순위를 판단합니다
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Form Section */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-2">
                  문제 설명 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={6}
                  required
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors resize-none"
                  placeholder="예: 2층 남자 화장실 세면대 수도꼭지에서 물이 계속 새고 있습니다. 수압이 약하고 물이 뚝뚝 떨어지고 있어요."
                />
                <p className="mt-2 text-sm text-slate-500 flex items-center">
                  <svg className="w-4 h-4 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  구체적으로 작성할수록 AI가 정확하게 분류합니다
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="location" className="block text-sm font-semibold text-slate-900 mb-2">
                    위치
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="예: 2층 남자 화장실"
                  />
                </div>

                <div>
                  <label htmlFor="contact_info" className="block text-sm font-semibold text-slate-900 mb-2">
                    연락처
                  </label>
                  <input
                    type="text"
                    id="contact_info"
                    name="contact_info"
                    value={formData.contact_info}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                    placeholder="010-1234-5678"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary-600 text-white py-4 px-6 rounded-xl hover:bg-primary-700 disabled:bg-slate-300 disabled:cursor-not-allowed font-semibold text-lg transition-colors shadow-lg hover:shadow-xl flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    AI가 분석 중...
                  </>
                ) : (
                  <>
                    요청 제출하기
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {error && (
              <div className="mt-6 bg-red-50 border-2 border-red-200 text-red-800 px-5 py-4 rounded-xl flex items-start">
                <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold">오류가 발생했습니다</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </div>
            )}

            {result && (
              <div className="mt-6 bg-gradient-to-br from-primary-50 to-emerald-50 border-2 border-primary-200 rounded-2xl p-6">
                <div className="flex items-start mb-4">
                  <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-2xl font-bold text-slate-900 mb-1">
                      요청이 제출되었습니다!
                    </h2>
                    <p className="text-slate-600">AI가 자동으로 분류를 완료했습니다</p>
                  </div>
                </div>

                <div className="space-y-3 mb-5">
                  <div className="flex items-center justify-between bg-white/60 px-4 py-3 rounded-xl">
                    <span className="font-medium text-slate-700">요청 번호</span>
                    <span className="font-bold text-slate-900">#{result.id}</span>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 px-4 py-3 rounded-xl">
                    <span className="font-medium text-slate-700">카테고리</span>
                    <span className={`px-4 py-1.5 rounded-lg text-sm font-semibold border ${getCategoryBadgeColor(result.category)}`}>
                      {getCategoryLabel(result.category)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between bg-white/60 px-4 py-3 rounded-xl">
                    <span className="font-medium text-slate-700">우선순위</span>
                    <span className={`px-4 py-1.5 rounded-lg text-sm font-semibold border ${getPriorityBadgeColor(result.priority)}`}>
                      {getPriorityLabel(result.priority)}
                    </span>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="block w-full bg-slate-900 text-white text-center py-3 px-6 rounded-xl hover:bg-slate-800 transition-colors font-semibold"
                >
                  대시보드에서 확인하기 →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6 sticky top-24">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="font-bold text-blue-900 ml-3 text-lg">작성 팁</h3>
            </div>
            <ul className="space-y-3 text-sm text-blue-900">
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>구체적으로</strong> 문제 상황을 설명하세요</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>긴급한 경우 <strong>"긴급"</strong> 또는 <strong>"위험"</strong>을 포함하세요</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span><strong>위치 정보</strong>를 제공하면 빠른 대응이 가능합니다</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 mr-2 mt-0.5 flex-shrink-0 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>언제부터 문제가 발생했는지 알려주세요</span>
              </li>
            </ul>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
            <h3 className="font-bold text-slate-900 mb-3 text-lg">카테고리 안내</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="flex items-center">
                <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                <strong className="mr-2">전기:</strong> 조명, 콘센트, 스위치
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                <strong className="mr-2">배관:</strong> 수도, 하수, 누수
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                <strong className="mr-2">냉난방:</strong> 에어컨, 보일러
              </li>
              <li className="flex items-center">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                <strong className="mr-2">구조:</strong> 벽, 천장, 바닥, 문
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
