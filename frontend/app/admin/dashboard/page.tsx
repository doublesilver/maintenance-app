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
  location: string | null
  contact_info: string | null
  image_url?: string
  created_at: string
  updated_at: string
}

interface Stats {
  total: number
  by_status: { [key: string]: number }
  by_category: { [key: string]: number }
  by_priority: { [key: string]: number }
}

export default function AdminDashboard() {
  const router = useRouter()
  const [requests, setRequests] = useState<Request[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }
    fetchData()
  }, [filter])

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('access_token')
      const headers = {
        'Authorization': `Bearer ${token}`
      }

      const [requestsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/requests${filter !== 'all' ? `?status=${filter}` : ''}`, { headers }),
        axios.get(`${API_URL}/api/stats`, { headers }),
      ])
      setRequests(requestsRes.data)
      setStats(statsRes.data)
      setError('')
    } catch (error: any) {
      console.error('데이터 로딩 실패:', error)
      if (error.response?.status === 401) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_email')
        router.push('/login')
      } else if (error.response?.status === 403) {
        setError('관리자 권한이 필요합니다')
      } else {
        setError('데이터를 불러올 수 없습니다')
      }
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('access_token')
      await axios.patch(
        `${API_URL}/api/requests/${id}`,
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      fetchData()
      setSelectedRequest(null)
    } catch (error: any) {
      console.error('상태 업데이트 실패:', error)
      alert('상태 업데이트 실패: ' + (error.response?.data?.detail || '알 수 없는 오류'))
    }
  }

  const deleteRequest = async (id: number) => {
    if (!confirm('정말 이 요청을 삭제하시겠습니까?')) return

    try {
      const token = localStorage.getItem('access_token')
      await axios.delete(
        `${API_URL}/api/requests/${id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      fetchData()
      setSelectedRequest(null)
    } catch (error: any) {
      console.error('삭제 실패:', error)
      alert('삭제 실패: ' + (error.response?.data?.detail || '알 수 없는 오류'))
    }
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

  const getStatusBadgeColor = (status: string) => {
    const colors: { [key: string]: string } = {
      pending: 'bg-gray-100 text-gray-800',
      in_progress: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
    }
    return colors[status] || colors.pending
  }

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      pending: '대기중',
      in_progress: '진행중',
      completed: '완료',
      processing: '처리중',
    }
    return texts[status] || status
  }

  const getCategoryText = (category: string) => {
    const texts: { [key: string]: string } = {
      electrical: '전기',
      plumbing: '배관',
      hvac: '냉난방',
      structural: '구조',
      other: '기타',
    }
    return texts[category] || category
  }

  const getPriorityText = (priority: string) => {
    const texts: { [key: string]: string } = {
      urgent: '긴급',
      high: '높음',
      medium: '보통',
      low: '낮음',
    }
    return texts[priority] || priority
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ko-KR')
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">관리 대시보드</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-primary-600">{stats.total}</div>
            <div className="text-gray-600 mt-1">전체 요청</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-gray-600">
              {stats.by_status.pending || 0}
            </div>
            <div className="text-gray-600 mt-1">대기중</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-blue-600">
              {stats.by_status.in_progress || 0}
            </div>
            <div className="text-gray-600 mt-1">진행중</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-3xl font-bold text-green-600">
              {stats.by_status.completed || 0}
            </div>
            <div className="text-gray-600 mt-1">완료</div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-md ${
              filter === 'pending'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            대기중
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-4 py-2 rounded-md ${
              filter === 'in_progress'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            진행중
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-md ${
              filter === 'completed'
                ? 'bg-primary-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            완료
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  설명
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  카테고리
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  우선순위
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  상태
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  생성일
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  작업
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    요청이 없습니다
                  </td>
                </tr>
              ) : (
                requests.map((request) => (
                  <tr key={request.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      #{request.id}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {request.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getCategoryBadgeColor(
                          request.category
                        )}`}
                      >
                        {getCategoryText(request.category)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadgeColor(
                          request.priority
                        )}`}
                      >
                        {getPriorityText(request.priority)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(
                          request.status
                        )}`}
                      >
                        {getStatusText(request.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(request.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedRequest(request)}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        상세
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                요청 상세 정보 #{selectedRequest.id}
              </h2>
              <button
                onClick={() => setSelectedRequest(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">설명</h3>
                <p className="mt-1 text-gray-900">{selectedRequest.description}</p>
              </div>

              {selectedRequest.location && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">위치</h3>
                  <p className="mt-1 text-gray-900">{selectedRequest.location}</p>
                </div>
              )}

              {selectedRequest.contact_info && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">연락처</h3>
                  <p className="mt-1 text-gray-900">{selectedRequest.contact_info}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">카테고리</h3>
                  <span
                    className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold ${getCategoryBadgeColor(
                      selectedRequest.category
                    )}`}
                  >
                    {getCategoryText(selectedRequest.category)}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">우선순위</h3>
                  <span
                    className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold ${getPriorityBadgeColor(
                      selectedRequest.priority
                    )}`}
                  >
                    {getPriorityText(selectedRequest.priority)}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">현재 상태</h3>
                <span
                  className={`mt-1 inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeColor(
                    selectedRequest.status
                  )}`}
                >
                  {getStatusText(selectedRequest.status)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">생성일</h3>
                  <p className="mt-1 text-gray-900">{formatDate(selectedRequest.created_at)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500">수정일</h3>
                  <p className="mt-1 text-gray-900">{formatDate(selectedRequest.updated_at)}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-500 mb-3">상태 변경</h3>
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'pending')}
                  disabled={selectedRequest.status === 'pending'}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  대기중
                </button>
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'in_progress')}
                  disabled={selectedRequest.status === 'in_progress'}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  진행중
                </button>
                <button
                  onClick={() => updateStatus(selectedRequest.id, 'completed')}
                  disabled={selectedRequest.status === 'completed'}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed"
                >
                  완료
                </button>
              </div>

              <button
                onClick={() => deleteRequest(selectedRequest.id)}
                className="w-full px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
