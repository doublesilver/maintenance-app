'use client'

import { useState } from 'react'
import axios from 'axios'

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

  const getCategoryBadgeColor = (category: string) => {
    const colors: { [key: string]: string } = {
      electrical: 'bg-yellow-100 text-yellow-800',
      plumbing: 'bg-blue-100 text-blue-800',
      hvac: 'bg-green-100 text-green-800',
      structural: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
    }
    return colors[category] || colors.other
  }

  const getPriorityBadgeColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
    }
    return colors[priority] || colors.medium
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          유지보수 요청 제출
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              문제 설명 <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              required
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 2층 화장실 수도꼭지에서 물이 새고 있습니다"
            />
            <p className="mt-1 text-sm text-gray-500">
              AI가 자동으로 카테고리와 우선순위를 분석합니다
            </p>
          </div>

          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              위치
            </label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 2층 화장실, A동 301호"
            />
          </div>

          <div>
            <label htmlFor="contact_info" className="block text-sm font-medium text-gray-700 mb-2">
              연락처
            </label>
            <input
              type="text"
              id="contact_info"
              name="contact_info"
              value={formData.contact_info}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="예: 010-1234-5678, hong@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-md hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? '제출 중...' : '요청 제출'}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {result && (
          <div className="mt-6 bg-green-50 border border-green-200 rounded-md p-6">
            <h2 className="text-xl font-semibold text-green-900 mb-4">
              ✓ 요청이 성공적으로 제출되었습니다!
            </h2>
            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">요청 ID:</span>{' '}
                <span className="text-gray-900">#{result.id}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">카테고리:</span>{' '}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadgeColor(result.category)}`}>
                  {result.category}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">우선순위:</span>{' '}
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadgeColor(result.priority)}`}>
                  {result.priority}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">상태:</span>{' '}
                <span className="text-gray-900">{result.status}</span>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-green-200">
              <p className="text-sm text-gray-600">
                대시보드에서 요청 상태를 확인할 수 있습니다.
              </p>
              <a
                href="/dashboard"
                className="inline-block mt-2 text-primary-600 hover:text-primary-700 font-medium"
              >
                대시보드로 이동 →
              </a>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-6">
        <h3 className="font-semibold text-blue-900 mb-2">💡 팁</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 문제를 구체적으로 설명할수록 AI가 더 정확하게 분류합니다</li>
          <li>• 긴급한 경우 설명에 "긴급" 또는 "위험"을 포함하세요</li>
          <li>• 위치 정보를 제공하면 더 빠른 대응이 가능합니다</li>
        </ul>
      </div>
    </div>
  )
}
