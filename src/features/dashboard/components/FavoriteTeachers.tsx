/**
 * Favorite Teachers Component
 * 
 * Component for managing favorite teachers
 * Task 13: Implement Wishlist and Favorites System
 */

import React, { useState, useEffect } from 'react'
import { Heart, Star, Calendar, MessageCircle, Bell, BellOff, Trash2 } from 'lucide-react'
import { wishlistService } from '@/lib/services/wishlist-service'
import type { FavoriteTeacherWithDetails } from '@/types/wishlist'
import { useAuth } from '@/hooks/useAuth'

export const FavoriteTeachers: React.FC = () => {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteTeacherWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadFavorites()
    }
  }, [user])

  const loadFavorites = async () => {
    if (!user) return

    setLoading(true)
    const { data, error } = await wishlistService.getFavoriteTeachers(user.id)

    if (!error && data) {
      setFavorites(data)
    }

    setLoading(false)
  }

  const handleRemoveFavorite = async (teacherId: string) => {
    if (!user) return

    const { success } = await wishlistService.removeFavoriteTeacher(user.id, teacherId)

    if (success) {
      setFavorites(favorites.filter(fav => fav.teacher_id !== teacherId))
    }
  }

  const handleToggleNotifications = async (favorite: FavoriteTeacherWithDetails) => {
    // TODO: Implement notification toggle
    alert('سيتم تفعيل/تعطيل الإشعارات')
  }

  const handleBookClass = (teacherId: string) => {
    // TODO: Navigate to booking page
    alert(`حجز حصة مع المعلم ${teacherId}`)
  }

  const handleSendMessage = (teacherId: string) => {
    // TODO: Open messaging interface
    alert(`إرسال رسالة للمعلم ${teacherId}`)
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
          <h2 className="text-2xl font-bold text-gray-900">المعلمون المفضلون</h2>
          <p className="text-gray-600 mt-1">
            {favorites.length} معلم في قائمتك المفضلة
          </p>
        </div>
      </div>

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <div className="text-center py-12">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            لا يوجد معلمون مفضلون
          </h3>
          <p className="text-gray-600">
            ابدأ بإضافة معلميك المفضلين للوصول السريع إليهم
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Teacher Header */}
              <div className="relative">
                <div className="h-32 bg-gradient-to-br from-blue-500 to-purple-600"></div>
                <div className="absolute -bottom-12 right-6">
                  <div className="w-24 h-24 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                    {favorite.teacher_avatar ? (
                      <img
                        src={favorite.teacher_avatar}
                        alt={favorite.teacher_name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 text-2xl font-bold">
                        {favorite.teacher_name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>
                {favorite.is_online && (
                  <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    متصل الآن
                  </div>
                )}
              </div>

              {/* Teacher Info */}
              <div className="pt-14 px-6 pb-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      {favorite.teacher_name}
                    </h3>
                    {favorite.teacher_specialization && (
                      <p className="text-sm text-gray-600">
                        {favorite.teacher_specialization}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => handleRemoveFavorite(favorite.teacher_id)}
                    className="text-red-600 hover:text-red-700"
                    title="إزالة من المفضلة"
                  >
                    <Heart className="w-5 h-5" fill="currentColor" />
                  </button>
                </div>

                {/* Rating and Stats */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" fill="currentColor" />
                    <span className="text-sm font-semibold text-gray-900">
                      {favorite.teacher_rating?.toFixed(1) || '0.0'}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {favorite.teacher_total_classes || 0} حصة
                  </div>
                  {favorite.teacher_available_slots > 0 && (
                    <div className="text-sm text-green-600">
                      {favorite.teacher_available_slots} وقت متاح
                    </div>
                  )}
                </div>

                {/* Notes */}
                {favorite.notes && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                    {favorite.notes}
                  </p>
                )}

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={() => handleBookClass(favorite.teacher_id)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Calendar className="w-4 h-4" />
                    حجز حصة
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleSendMessage(favorite.teacher_id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <MessageCircle className="w-4 h-4" />
                      رسالة
                    </button>

                    <button
                      onClick={() => handleToggleNotifications(favorite)}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 border rounded-lg ${
                        favorite.notification_enabled
                          ? 'border-blue-600 text-blue-600 bg-blue-50'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                      title={favorite.notification_enabled ? 'تعطيل الإشعارات' : 'تفعيل الإشعارات'}
                    >
                      {favorite.notification_enabled ? (
                        <Bell className="w-4 h-4" />
                      ) : (
                        <BellOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Added Date */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    أضيف في {new Date(favorite.created_at).toLocaleDateString('ar-SA')}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FavoriteTeachers
