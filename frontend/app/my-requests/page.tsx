'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface Request {
  id: number
  user_id?: number
  description: string
  category: string
  priority: string
  status: string
  location?: string
  contact_info?: string
  image_url?: string
  created_at: string
  updated_at: string
}

export default function MyRequestsPage() {
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchMyRequests()
  }, [statusFilter])

  const fetchMyRequests = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('access_token')
      const url = statusFilter === 'all'
        ? `${API_URL}/api/my-requests`
        : `${API_URL}/api/my-requests?status=${statusFilter}`

      const response = await axios.get(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      setRequests(response.data)
      setError('')
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_email')
        router.push('/login')
      } else {
        setError('요청 목록을 불러올 수 없습니다')
      }
    } finally {
      setLoading(false)
    }
  }

  const deleteRequest = async (id: number) => {
    if (!confirm('정말 이 요청을 삭제하시겠습니까?')) return

    try {
      const token = localStorage.getItem('access_token')
      await axios.delete(`${API_URL}/api/requests/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      fetchMyRequests()
    } catch (err: any) {
      alert('삭제 실패: ' + (err.response?.data?.detail || '알 수 없는 오류'))
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    const colors: Record<string, string> = {
      electrical: 'bg-yellow-100 text-yellow-800',
      plumbing: 'bg-blue-100 text-blue-800',
      hvac: 'bg-green-100 text-green-800',
      structural: 'bg-red-100 text-red-800',
      other: 'bg-gray-100 text-gray-800',
      processing: 'bg-purple-100 text-purple-800'
    }
    return colors[category] || 'bg-gray-100 text-gray-800'
  }

  const getPriorityBadgeColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'bg-red-100 text-red-800',
      high: 'bg-orange-100 text-orange-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-green-100 text-green-800',
      processing: 'bg-purple-100 text-purple-800'
    }
    return colors[priority] || 'bg-gray-100 text-gray-800'
  }

  const getStatusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      processing: 'bg-purple-100 text-purple-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      electrical: '전기',
      plumbing: '배관',
      hvac: 'HVAC',
      structural: '구조',
      other: '기타',
      processing: '처리중'
    }
    return labels[category] || category
  }

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      urgent: '긴급',
      high: '높음',
      medium: '보통',
      low: '낮음',
      processing: '처리중'
    }
    return labels[priority] || priority
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: '대기중',
      in_progress: '진행중',
      completed: '완료',
      processing: '처리중'
    }
    return labels[status] || status
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">내 요청 목록</h1>
          <p className="mt-2 text-sm text-gray-600">
            제출한 유지보수 요청을 확인하고 관리할 수 있습니다
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 필터 */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              statusFilter === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium ${
              statusFilter === 'pending'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            대기중
          </button>
          <button
            onClick={() => setStatusFilter('in_progress')}
            className={`px-4 py-2 rounded-lg font-medium ${
              statusFilter === 'in_progress'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            진행중
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium ${
              statusFilter === 'completed'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            완료
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">로딩 중...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-500">요청이 없습니다</p>
            <button
              onClick={() => router.push('/submit')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              새 요청 작성
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      설명
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      우선순위
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작성일
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      작업
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{request.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-md truncate">
                        {request.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeColor(request.category)}`}>
                          {getCategoryLabel(request.category)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(request.priority)}`}>
                          {getPriorityLabel(request.priority)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(request.status)}`}>
                          {getStatusLabel(request.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.created_at).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => setSelectedRequest(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          상세
                        </button>
                        <button
                          onClick={() => deleteRequest(request.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 상세보기 모달 */}
        {selectedRequest && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    요청 상세 #{selectedRequest.id}
                  </h2>
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                    <p className="text-gray-900">{selectedRequest.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getCategoryBadgeColor(selectedRequest.category)}`}>
                        {getCategoryLabel(selectedRequest.category)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">우선순위</label>
                      <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getPriorityBadgeColor(selectedRequest.priority)}`}>
                        {getPriorityLabel(selectedRequest.priority)}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                    <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${getStatusBadgeColor(selectedRequest.status)}`}>
                      {getStatusLabel(selectedRequest.status)}
                    </span>
                  </div>

                  {selectedRequest.location && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">위치</label>
                      <p className="text-gray-900">{selectedRequest.location}</p>
                    </div>
                  )}

                  {selectedRequest.contact_info && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                      <p className="text-gray-900">{selectedRequest.contact_info}</p>
                    </div>
                  )}

                  {selectedRequest.image_url && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">첨부 이미지</label>
                      <img
                        src={selectedRequest.image_url}
                        alt="첨부 이미지"
                        className="max-w-full h-auto rounded-lg border"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <label className="block font-medium">작성일</label>
                      <p>{new Date(selectedRequest.created_at).toLocaleString('ko-KR')}</p>
                    </div>
                    <div>
                      <label className="block font-medium">수정일</label>
                      <p>{new Date(selectedRequest.updated_at).toLocaleString('ko-KR')}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    닫기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
