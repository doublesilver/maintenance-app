'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

interface User {
  id: number
  email: string
  full_name: string | null
  role: string
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (!token) {
      router.push('/login')
      return
    }

    fetchUsers()
  }, [router])

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token')
      const response = await axios.get(`${API_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(response.data)
      setLoading(false)
    } catch (err: any) {
      if (err.response?.status === 401) {
        router.push('/login')
      } else if (err.response?.status === 403) {
        setError('최고 관리자 권한이 필요합니다.')
        setLoading(false)
      } else {
        setError('사용자 목록을 불러오는데 실패했습니다.')
        setLoading(false)
      }
    }
  }

  const updateRole = async (userId: number, newRole: string) => {
    if (!confirm(`이 사용자를 ${newRole === 'admin' ? '관리자' : '일반 사용자'}로 변경하시겠습니까?`)) {
      return
    }

    try {
      const token = localStorage.getItem('access_token')
      await axios.patch(
        `${API_URL}/api/admin/users/${userId}/role?new_role=${newRole}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('역할이 변경되었습니다.')
      fetchUsers()
    } catch (err: any) {
      if (err.response?.status === 403) {
        alert('자기 자신의 역할은 변경할 수 없습니다.')
      } else {
        alert('역할 변경에 실패했습니다: ' + (err.response?.data?.detail || '알 수 없는 오류'))
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
          <p className="mt-4 text-slate-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">오류</h2>
          <p className="text-slate-600 mb-6">{error}</p>
          <button
            onClick={() => router.push('/admin/dashboard')}
            className="w-full bg-primary-600 text-white px-6 py-3 rounded-xl hover:bg-primary-700 transition-colors"
          >
            대시보드로 돌아가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 px-8 py-6">
            <h1 className="text-3xl font-bold text-white">사용자 관리</h1>
            <p className="text-primary-100 mt-2">모든 사용자의 역할을 관리할 수 있습니다</p>
          </div>

          {/* Users Table */}
          <div className="p-8">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="text-left py-4 px-4 font-semibold text-slate-700">ID</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700">이메일</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700">이름</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700">역할</th>
                    <th className="text-left py-4 px-4 font-semibold text-slate-700">작업</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 text-slate-600">{user.id}</td>
                      <td className="py-4 px-4 text-slate-800 font-medium">{user.email}</td>
                      <td className="py-4 px-4 text-slate-600">{user.full_name || '-'}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === 'super_admin'
                              ? 'bg-red-100 text-red-800'
                              : user.role === 'admin'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          {user.role === 'super_admin' ? '⭐ 최고 관리자' : user.role === 'admin' ? '👑 관리자' : '👤 사용자'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {user.role === 'super_admin' ? (
                          <span className="text-slate-400 text-sm italic">변경 불가</span>
                        ) : (
                          <div className="flex gap-2">
                            {user.role === 'admin' ? (
                              <button
                                onClick={() => updateRole(user.id, 'user')}
                                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
                              >
                                사용자로 변경
                              </button>
                            ) : (
                              <button
                                onClick={() => updateRole(user.id, 'admin')}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
                              >
                                관리자로 승격
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {users.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-500">등록된 사용자가 없습니다.</p>
              </div>
            )}

            <div className="mt-8 flex justify-between items-center">
              <p className="text-slate-600">
                총 <span className="font-bold text-primary-600">{users.length}</span>명의 사용자
              </p>
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-6 py-3 bg-slate-200 text-slate-700 rounded-xl hover:bg-slate-300 transition-colors font-medium"
              >
                대시보드로 돌아가기
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
