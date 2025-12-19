/**
 * Wishlist Management Page
 * 
 * Manages student wishlist and favorites for:
 * - Course bookmarking
 * - Lesson planning
 * - Material organization
 * 
 * High Priority Task 4: Wishlist Management UI
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/lib/auth-context'
import { logger } from '@/lib/logger'
import { Heart, Search, Trash2, BookOpen, Clock } from 'lucide-react'
import { DashboardLayout } from '@/components/navigation'

export interface WishlistItem {
  id: string
  user_id: string
  item_type: 'course' | 'lesson' | 'material'
  item_id: string
  item_title: string
  item_title_ar: string
  item_description?: string
  item_description_ar?: string
  category?: string
  added_at: string
  notes?: string
}

export default function WishlistManagementPage() {
  const { user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'course' | 'lesson' | 'material'>('all')

  useEffect(() => {
    if (user?.id) {
      loadWishlist()
    }
  }, [user])

  const loadWishlist = async () => {
    try {
      setLoading(true)
      setError(null)

      // TODO: Implement real API call when backend is ready
      // For now, using mock data
      const mockItems: WishlistItem[] = [
        {
          id: '1',
          user_id: user?.id || '',
          item_type: 'course',
          item_id: 'c1',
          item_title: 'Advanced Grammar',
          item_title_ar: 'قواعد اللغة المتقدمة',
          item_description: 'Comprehensive grammar course',
          item_description_ar: 'دورة قواعد شاملة',
          category: 'Grammar',
          added_at: new Date().toISOString(),
          notes: 'For 16-18 age group',
        },
        {
          id: '2',
          user_id: user?.id || '',
          item_type: 'lesson',
          item_id: 'l1',
          item_title: 'Conversation Practice',
          item_title_ar: 'تمارين المحادثة',
          item_description: 'Interactive conversation exercises',
          item_description_ar: 'تمارين محادثة تفاعلية',
          category: 'Speaking',
          added_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ]

      setWishlistItems(mockItems)
      logger.log('Wishlist loaded', { count: mockItems.length })
    } catch (err) {
      setError('حدث خطأ في تحميل قائمة الأمنيات')
      logger.error('Wishlist loading error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleRemoveItem = async (itemId: string) => {
    try {
      // TODO: Implement API call to remove item
      setWishlistItems(items => items.filter(item => item.id !== itemId))
      logger.log('Item removed from wishlist', { itemId })
    } catch (err) {
      logger.error('Error removing item:', err)
      setError('فشل حذف العنصر')
    }
  }

  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = 
      item.item_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_title_ar.includes(searchTerm) ||
      (item.item_description_ar && item.item_description_ar.includes(searchTerm))
    
    const matchesFilter = filter === 'all' || item.item_type === filter

    return matchesSearch && matchesFilter
  })

  const getItemTypeLabel = (type: string): string => {
    const labels = {
      course: 'دورة',
      lesson: 'درس',
      material: 'مادة تعليمية',
    }
    return labels[type as keyof typeof labels] || type
  }

  const getItemTypeIcon = (type: string) => {
    switch (type) {
      case 'course':
        return <BookOpen className="w-5 h-5" />
      case 'lesson':
        return <Clock className="w-5 h-5" />
      case 'material':
        return <BookOpen className="w-5 h-5" />
      default:
        return <Heart className="w-5 h-5" />
    }
  }

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
            قائمة الأمنيات
          </h1>
          <p className="text-gray-600 arabic-text">
            الدورات والدروس المحفوظة لديك
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

        {/* Search and Filter Bar */}
        <Card className="mb-6">
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="البحث في قائمة الأمنيات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full arabic-text"
                  icon={<Search className="w-4 h-4" />}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                  className="arabic-text"
                >
                  الكل
                </Button>
                <Button
                  variant={filter === 'course' ? 'default' : 'outline'}
                  onClick={() => setFilter('course')}
                  className="arabic-text"
                >
                  الدورات
                </Button>
                <Button
                  variant={filter === 'lesson' ? 'default' : 'outline'}
                  onClick={() => setFilter('lesson')}
                  className="arabic-text"
                >
                  الدروس
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Wishlist Items */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        {getItemTypeIcon(item.item_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="arabic-text text-lg truncate">
                          {item.item_title_ar}
                        </CardTitle>
                        <p className="text-sm text-gray-500 truncate">
                          {item.item_title}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs arabic-text">
                          {getItemTypeLabel(item.item_type)}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 flex-shrink-0"
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.item_description_ar && (
                    <p className="text-sm text-gray-600 arabic-text mb-3 line-clamp-2">
                      {item.item_description_ar}
                    </p>
                  )}
                  
                  {item.category && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                      <span className="arabic-text">التصنيف:</span>
                      <span className="font-medium">{item.category}</span>
                    </div>
                  )}

                  {item.notes && (
                    <div className="mb-3 p-2 bg-gray-50 rounded text-sm arabic-text text-gray-600">
                      {item.notes}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                    <span className="text-xs text-gray-500 arabic-text">
                      أُضيف {new Date(item.added_at).toLocaleDateString('ar-SA')}
                    </span>
                    <Button size="sm" className="arabic-text">
                      عرض التفاصيل
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 arabic-text mb-2">
                قائمة الأمنيات فارغة
              </h3>
              <p className="text-gray-600 arabic-text">
                {searchTerm || filter !== 'all'
                  ? 'لم يتم العثور على عناصر مطابقة'
                  : 'ابدأ بإضافة دورات ودروس إلى قائمة الأمنيات'}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Summary Card */}
        {wishlistItems.length > 0 && (
          <Card className="mt-6">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 arabic-text text-sm">
                  <span>إجمالي العناصر: <strong>{wishlistItems.length}</strong></span>
                  <span>الدورات: <strong>{wishlistItems.filter(i => i.item_type === 'course').length}</strong></span>
                  <span>الدروس: <strong>{wishlistItems.filter(i => i.item_type === 'lesson').length}</strong></span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

