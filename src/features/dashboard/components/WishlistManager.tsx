/**
 * Wishlist Manager Component
 * 
 * Main component for managing user wishlist
 * Task 13: Implement Wishlist and Favorites System
 */

import React, { useState, useEffect } from 'react'
import { Heart, Package, Clock, User, Gift, Share2, Trash2, ShoppingCart, Bell, Star } from 'lucide-react'
import { wishlistService } from '@/lib/services/wishlist-service'
import type { WishlistItemWithDetails, WishlistFilter, WishlistItemType } from '@/types/wishlist'
import { useAuth } from '@/hooks/useAuth'

export const WishlistManager: React.FC = () => {
  const { user } = useAuth()
  const [wishlistItems, setWishlistItems] = useState<WishlistItemWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<WishlistFilter>({})
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showShareModal, setShowShareModal] = useState(false)

  useEffect(() => {
    if (user) {
      loadWishlist()
    }
  }, [user, filter])

  const loadWishlist = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await wishlistService.getUserWishlist(user.id, filter)

    if (!error && data) {
      setWishlistItems(data)
    }

    setLoading(false)
  }

  const handleRemoveItem = async (itemType: WishlistItemType, itemId: string) => {
    if (!user) return

    const { success } = await wishlistService.removeFromWishlist(user.id, itemType, itemId)

    if (success) {
      setWishlistItems(wishlistItems.filter(item => !(item.item_type === itemType && item.item_id === itemId)))
    }
  }

  const handleToggleSelect = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === wishlistItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(wishlistItems.map(item => item.id))
    }
  }

  const handleAddToCart = async () => {
    if (!user || selectedItems.length === 0) return

    const { success, items } = await wishlistService.convertWishlistToCart(user.id, selectedItems)

    if (success) {
      // TODO: Add items to cart
      alert(`تم إضافة ${items.length} عنصر إلى السلة`)
      setSelectedItems([])
    }
  }

  const handleShareWishlist = () => {
    setShowShareModal(true)
  }

  const getItemIcon = (itemType: WishlistItemType) => {
    switch (itemType) {
      case 'teacher':
        return <User className="w-5 h-5" />
      case 'package':
        return <Package className="w-5 h-5" />
      case 'timeslot':
        return <Clock className="w-5 h-5" />
      default:
        return <Heart className="w-5 h-5" />
    }
  }

  const getItemTypeLabel = (itemType: WishlistItemType) => {
    switch (itemType) {
      case 'teacher':
        return 'معلم'
      case 'package':
        return 'باقة'
      case 'timeslot':
        return 'وقت محفوظ'
      case 'course':
        return 'دورة'
      default:
        return itemType
    }
  }

  const getPriorityColor = (priority: number) => {
    if (priority >= 4) return 'text-red-600'
    if (priority >= 2) return 'text-yellow-600'
    return 'text-gray-600'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">قائمة الأمنيات</h2>
          <p className="text-gray-600 mt-1">
            {wishlistItems.length} عنصر في قائمتك
          </p>
        </div>

        <div className="flex gap-2">
          {selectedItems.length > 0 && (
            <>
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <ShoppingCart className="w-5 h-5" />
                إضافة إلى السلة ({selectedItems.length})
              </button>

              <button
                onClick={handleShareWishlist}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <Share2 className="w-5 h-5" />
                مشاركة
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <select
          value={filter.item_type || ''}
          onChange={(e) => setFilter({ ...filter, item_type: e.target.value as WishlistItemType || undefined })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">جميع الأنواع</option>
          <option value="teacher">المعلمين</option>
          <option value="package">الباقات</option>
          <option value="timeslot">الأوقات المحفوظة</option>
          <option value="course">الدورات</option>
        </select>

        <select
          value={filter.is_gift !== undefined ? (filter.is_gift ? 'true' : 'false') : ''}
          onChange={(e) => setFilter({ ...filter, is_gift: e.target.value === 'true' ? true : e.target.value === 'false' ? false : undefined })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">جميع العناصر</option>
          <option value="false">عناصري</option>
          <option value="true">هدايا</option>
        </select>

        <select
          value={filter.priority_min || ''}
          onChange={(e) => setFilter({ ...filter, priority_min: e.target.value ? parseInt(e.target.value) : undefined })}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          <option value="">جميع الأولويات</option>
          <option value="4">أولوية عالية</option>
          <option value="2">أولوية متوسطة</option>
          <option value="0">جميع الأولويات</option>
        </select>

        {wishlistItems.length > 0 && (
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            {selectedItems.length === wishlistItems.length ? 'إلغاء التحديد' : 'تحديد الكل'}
          </button>
        )}
      </div>

      {/* Wishlist Items */}
      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            قائمة الأمنيات فارغة
          </h3>
          <p className="text-gray-600">
            ابدأ بإضافة المعلمين والباقات المفضلة لديك
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-lg shadow-md p-4 border-2 transition-all ${
                selectedItems.includes(item.id)
                  ? 'border-blue-500'
                  : 'border-transparent hover:border-gray-300'
              }`}
            >
              {/* Item Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleToggleSelect(item.id)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <div className="flex items-center gap-2">
                    {getItemIcon(item.item_type)}
                    <span className="text-sm text-gray-600">
                      {getItemTypeLabel(item.item_type)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {item.is_gift && (
                    <Gift className="w-4 h-4 text-pink-600" title="هدية" />
                  )}
                  {item.reminder_enabled && (
                    <Bell className="w-4 h-4 text-yellow-600" title="تذكير مفعل" />
                  )}
                  <Star
                    className={`w-4 h-4 ${getPriorityColor(item.priority)}`}
                    fill={item.priority >= 3 ? 'currentColor' : 'none'}
                    title={`الأولوية: ${item.priority}`}
                  />
                </div>
              </div>

              {/* Item Content */}
              <div className="mb-3">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {item.item_name_ar || item.item_name || 'بدون اسم'}
                </h3>

                {item.notes && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {item.notes}
                  </p>
                )}

                {item.current_price && (
                  <div className="mt-2">
                    <span className="text-lg font-bold text-blue-600">
                      {item.current_price} ر.س
                    </span>
                    {item.discount_available && (
                      <span className="text-xs text-green-600 mr-2">
                        خصم متاح!
                      </span>
                    )}
                  </div>
                )}

                {!item.is_available && (
                  <div className="mt-2 text-sm text-red-600">
                    غير متاح حالياً
                  </div>
                )}
              </div>

              {/* Item Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleRemoveItem(item.item_type, item.item_id)}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </button>

                {item.is_available && item.item_type === 'package' && (
                  <button
                    onClick={() => {
                      // TODO: Navigate to package details
                      alert('الانتقال إلى تفاصيل الباقة')
                    }}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    عرض التفاصيل
                  </button>
                )}
              </div>

              {/* Gift Info */}
              {item.is_gift && item.gift_recipient_name && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <p className="text-xs text-gray-600">
                    هدية لـ: <span className="font-semibold">{item.gift_recipient_name}</span>
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Share Modal */}
      {showShareModal && (
        <ShareWishlistModal
          selectedItems={selectedItems}
          onClose={() => setShowShareModal(false)}
          onSuccess={() => {
            setShowShareModal(false)
            setSelectedItems([])
          }}
        />
      )}
    </div>
  )
}

// Share Wishlist Modal Component
interface ShareWishlistModalProps {
  selectedItems: string[]
  onClose: () => void
  onSuccess: () => void
}

const ShareWishlistModal: React.FC<ShareWishlistModalProps> = ({
  selectedItems,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth()
  const [shareName, setShareName] = useState('')
  const [shareNameAr, setShareNameAr] = useState('')
  const [description, setDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [expiresDays, setExpiresDays] = useState<number | undefined>(30)
  const [loading, setLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(null)

  const handleShare = async () => {
    if (!user || !shareName || !shareNameAr) return

    setLoading(true)

    const { data, error } = await wishlistService.createWishlistShare({
      user_id: user.id,
      share_name: shareName,
      share_name_ar: shareNameAr,
      description,
      is_public: isPublic,
      expires_days: expiresDays,
      wishlist_item_ids: selectedItems,
    })

    setLoading(false)

    if (!error && data) {
      setShareUrl(window.location.origin + data.share_url)
    }
  }

  const handleCopyUrl = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl)
      alert('تم نسخ الرابط!')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" dir="rtl">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          مشاركة قائمة الأمنيات
        </h3>

        {!shareUrl ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم القائمة (بالإنجليزية) *
              </label>
              <input
                type="text"
                value={shareName}
                onChange={(e) => setShareName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="My Wishlist"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                اسم القائمة (بالعربية) *
              </label>
              <input
                type="text"
                value={shareNameAr}
                onChange={(e) => setShareNameAr(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="قائمة أمنياتي"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                وصف (اختياري)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="أضف وصفاً لقائمتك..."
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="text-sm text-gray-700">
                جعل القائمة عامة (يمكن لأي شخص رؤيتها)
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                صلاحية الرابط
              </label>
              <select
                value={expiresDays || ''}
                onChange={(e) => setExpiresDays(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">بدون انتهاء</option>
                <option value="7">7 أيام</option>
                <option value="30">30 يوم</option>
                <option value="90">90 يوم</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleShare}
                disabled={loading || !shareName || !shareNameAr}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'جاري الإنشاء...' : 'إنشاء رابط'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 font-semibold mb-2">
                تم إنشاء الرابط بنجاح!
              </p>
              <div className="bg-white p-3 rounded border border-green-300 break-all text-sm">
                {shareUrl}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleCopyUrl}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                نسخ الرابط
              </button>
              <button
                onClick={onSuccess}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                إغلاق
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default WishlistManager
