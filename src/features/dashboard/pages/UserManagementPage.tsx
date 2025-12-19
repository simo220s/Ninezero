/**
 * User Management Page with MCP Supabase Integration
 * Features: View, Edit, and Delete users
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { getAllStudents } from '@/lib/database'
import { logger } from '@/lib/logger'
import { Search, Trash2, Users, AlertTriangle } from 'lucide-react'
import { DashboardLayout } from '@/components/navigation'

interface User {
  id: string
  name: string
  email: string
  is_trial: boolean
  role: string
  created_at: string
  profiles?: {
    first_name: string
    last_name: string
    email: string
  }
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const { data } = await getAllStudents()
      setUsers(data || [])
    } catch (err) {
      logger.error('Error loading users:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    try {
      setDeleting(true)
      
      // Delete user and all related data using Supabase
      const { supabase } = await import('@/lib/supabase')
      
      // Delete in order to respect foreign key constraints
      await supabase.from('class_sessions').delete().or(`student_id.eq.${userId},teacher_id.eq.${userId}`)
      await supabase.from('class_credits').delete().eq('user_id', userId)
      await supabase.from('referrals').delete().or(`referrer_id.eq.${userId},referred_id.eq.${userId}`)
      await supabase.from('reviews').delete().or(`student_id.eq.${userId},teacher_id.eq.${userId}`)
      await supabase.from('notifications').delete().eq('user_id', userId)
      await supabase.from('profiles').delete().eq('id', userId)

      // Reload users
      await loadUsers()
      setDeleteConfirm(null)
      
      logger.log('User deleted successfully')
    } catch (err) {
      logger.error('Delete error:', err)
      alert('فشل حذف المستخدم')
    } finally {
      setDeleting(false)
    }
  }

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.profiles?.first_name + ' ' + u.profiles?.last_name).toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <DashboardLayout showBreadcrumbs>
        <div className="p-6 flex justify-center">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout showBreadcrumbs>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold arabic-text">إدارة المستخدمين</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 arabic-text">إجمالي المستخدمين</p>
                  <p className="text-3xl font-bold text-primary-600">{users.length}</p>
                </div>
                <Users className="w-12 h-12 text-primary-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 arabic-text">طلاب نشطون</p>
                  <p className="text-3xl font-bold text-green-600">
                    {users.filter(u => !u.is_trial).length}
                  </p>
                </div>
                <Users className="w-12 h-12 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 arabic-text">طلاب تجريبيون</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {users.filter(u => u.is_trial).length}
                  </p>
                </div>
                <Users className="w-12 h-12 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="ابحث عن مستخدم..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10 arabic-text"
              />
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="arabic-text">قائمة المستخدمين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-bold">
                        {user.profiles?.first_name?.charAt(0) || user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold arabic-text">
                        {user.profiles?.first_name} {user.profiles?.last_name} || user.name
                      </p>
                      <p className="text-sm text-gray-600">{user.profiles?.email || user.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          user.is_trial ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                        }`}>
                          {user.is_trial ? 'تجريبي' : 'نشط'}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(user.created_at).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {deleteConfirm === user.id ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDeleteConfirm(null)}
                          className="arabic-text"
                        >
                          إلغاء
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deleting}
                          className="bg-red-600 hover:bg-red-700 arabic-text"
                        >
                          {deleting ? <Spinner size="sm" /> : 'تأكيد الحذف'}
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setDeleteConfirm(user.id)}
                        className="text-red-600 hover:bg-red-50 arabic-text"
                      >
                        <Trash2 className="w-4 h-4 ms-1" />
                        حذف
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800 arabic-text">تحذير</p>
                <p className="text-sm text-red-700 arabic-text">
                  حذف المستخدم سيؤدي إلى حذف جميع بياناته بشكل نهائي ولا يمكن التراجع عن هذا الإجراء
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
