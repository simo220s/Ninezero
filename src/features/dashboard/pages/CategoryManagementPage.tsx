/**
 * Category Management Page
 * 
 * Comprehensive category organization system for:
 * - Course categorization
 * - Learning materials organization
 * - Skill taxonomy management
 * 
 * High Priority Task 4: Category Management UI
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/lib/auth-context'
import { logger } from '@/lib/logger'
import { Plus, Edit2, Trash2, FolderOpen, Tag } from 'lucide-react'
import { DashboardLayout } from '@/components/navigation'

export interface Category {
  id: string
  name: string
  name_ar: string
  description?: string
  description_ar?: string
  parent_id?: string
  order_index: number
  is_active: boolean
  created_at: string
  updated_at: string
  subcategories?: Category[]
  item_count?: number
}

export default function CategoryManagementPage() {
  const { user: _user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [_isAddModalOpen, _setIsAddModalOpen] = useState(false)
  const [_editingCategory, _setEditingCategory] = useState<Category | null>(null)

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
      setError(null)

      // TODO: Implement real API call when backend is ready
      // For now, using mock data structure
      const mockCategories: Category[] = [
        {
          id: '1',
          name: 'English Skills',
          name_ar: 'مهارات اللغة الإنجليزية',
          description: 'Core English language skills',
          description_ar: 'مهارات اللغة الإنجليزية الأساسية',
          order_index: 1,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          item_count: 12,
          subcategories: [
            {
              id: '1-1',
              name: 'Speaking',
              name_ar: 'المحادثة',
              parent_id: '1',
              order_index: 1,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              item_count: 5,
            },
            {
              id: '1-2',
              name: 'Listening',
              name_ar: 'الاستماع',
              parent_id: '1',
              order_index: 2,
              is_active: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              item_count: 4,
            },
          ],
        },
        {
          id: '2',
          name: 'Age Groups',
          name_ar: 'المجموعات العمرية',
          description: 'Student age classifications',
          description_ar: 'تصنيفات أعمار الطلاب',
          order_index: 2,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          item_count: 8,
        },
      ]

      setCategories(mockCategories)
      logger.log('Categories loaded', { count: mockCategories.length })
    } catch (err) {
      setError('حدث خطأ في تحميل التصنيفات')
      logger.error('Categories loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cat.name_ar.includes(searchTerm)
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 arabic-text mb-2">
            إدارة التصنيفات
          </h1>
          <p className="text-gray-600 arabic-text">
            تنظيم وإدارة تصنيفات المواد التعليمية والطلاب
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-300 bg-red-50">
            <CardContent className="py-4">
              <p className="text-red-700 arabic-text">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Actions Bar */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="البحث عن تصنيف..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full arabic-text"
                />
              </div>
              <Button
                onClick={() => setIsAddModalOpen(true)}
                className="arabic-text flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                إضافة تصنيف جديد
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <CardTitle className="arabic-text text-lg">
                        {category.name_ar}
                      </CardTitle>
                      <p className="text-sm text-gray-500">{category.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setEditingCategory(category)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {category.description_ar && (
                  <p className="text-sm text-gray-600 arabic-text mb-4">
                    {category.description_ar}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600 arabic-text">
                      {category.item_count || 0} عنصر
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    category.is_active 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {category.is_active ? 'نشط' : 'غير نشط'}
                  </span>
                </div>

                {category.subcategories && category.subcategories.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500 arabic-text mb-2">
                      التصنيفات الفرعية ({category.subcategories.length})
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {category.subcategories.map((sub) => (
                        <span
                          key={sub.id}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs arabic-text"
                        >
                          {sub.name_ar}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCategories.length === 0 && !loading && (
          <Card>
            <CardContent className="py-12 text-center">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 arabic-text mb-2">
                لا توجد تصنيفات
              </h3>
              <p className="text-gray-600 arabic-text">
                {searchTerm ? 'لم يتم العثور على تصنيفات مطابقة للبحث' : 'ابدأ بإنشاء تصنيف جديد'}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

