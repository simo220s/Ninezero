/**
 * Category Analytics Component
 * Display analytics and performance metrics for categories
 */

import React, { useState, useEffect } from 'react';
import { categoryService } from '../../../lib/services/category-service';
import type { CategoryAnalytics as CategoryAnalyticsType, CategoryStats, Category } from '../../../types/category';

export const CategoryAnalytics: React.FC = () => {
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryAnalytics, setCategoryAnalytics] = useState<CategoryAnalyticsType | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (selectedCategory) {
      loadCategoryAnalytics(selectedCategory);
    }
  }, [selectedCategory]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [statsData, categoriesData] = await Promise.all([
        categoryService.getCategoryStats(),
        categoryService.getCategories({ status: 'active' }),
      ]);
      setStats(statsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategoryAnalytics = async (categoryId: string) => {
    try {
      const analytics = await categoryService.getCategoryAnalytics(categoryId);
      setCategoryAnalytics(analytics);
    } catch (error) {
      console.error('Failed to load category analytics:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">تحليلات الفئات</h1>
        <p className="text-gray-600">مقاييس الأداء والإحصائيات لكل فئة</p>
      </div>

      {/* Overall Statistics */}
      {stats && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600 mb-1">إجمالي الفئات</div>
              <div className="text-3xl font-bold text-gray-900">{stats.total_categories}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600 mb-1">فئات المستوى</div>
              <div className="text-3xl font-bold text-blue-600">{stats.categories_by_type.level}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600 mb-1">فئات الفئة العمرية</div>
              <div className="text-3xl font-bold text-green-600">
                {stats.categories_by_type.age_group}
              </div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-600 mb-1">فئات المهارات</div>
              <div className="text-3xl font-bold text-purple-600">{stats.categories_by_type.skill}</div>
            </div>
          </div>

          {/* Most Popular Categories */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">الفئات الأكثر شعبية</h2>
              </div>
              <div className="p-4">
                {stats.most_popular_categories.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">لا توجد بيانات</div>
                ) : (
                  <div className="space-y-3">
                    {stats.most_popular_categories.map((cat, index) => (
                      <div
                        key={cat.category_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{cat.category_name}</div>
                            <div className="text-sm text-gray-600">{cat.student_count} طالب</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedCategory(cat.category_id)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          عرض التفاصيل
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Revenue by Category */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">الإيرادات حسب الفئة</h2>
              </div>
              <div className="p-4">
                {stats.revenue_by_category.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">لا توجد بيانات</div>
                ) : (
                  <div className="space-y-3">
                    {stats.revenue_by_category.map((cat, index) => (
                      <div
                        key={cat.category_id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{cat.category_name}</div>
                            <div className="text-sm text-gray-600">{formatCurrency(cat.revenue)}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedCategory(cat.category_id)}
                          className="text-sm text-blue-600 hover:text-blue-700"
                        >
                          عرض التفاصيل
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Category Selector */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">تحليلات تفصيلية للفئة</h2>
        </div>
        <div className="p-4">
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">اختر فئة...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_ar} ({cat.name}) - {cat.category_type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Detailed Category Analytics */}
      {categoryAnalytics && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {categoryAnalytics.category_name}
            </h2>
            <p className="text-sm text-gray-600">{categoryAnalytics.category_type}</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-blue-600 mb-1">إجمالي الدروس</div>
                <div className="text-2xl font-bold text-blue-900">
                  {categoryAnalytics.total_classes}
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-sm text-green-600 mb-1">إجمالي الطلاب</div>
                <div className="text-2xl font-bold text-green-900">
                  {categoryAnalytics.total_students}
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-purple-600 mb-1">إجمالي الإيرادات</div>
                <div className="text-2xl font-bold text-purple-900">
                  {formatCurrency(categoryAnalytics.total_revenue)}
                </div>
              </div>
              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="text-sm text-yellow-600 mb-1">متوسط التقييم</div>
                <div className="text-2xl font-bold text-yellow-900">
                  {categoryAnalytics.average_rating.toFixed(1)} ⭐
                </div>
              </div>
            </div>

            {/* Completion Rate */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">معدل الإكمال</span>
                <span className="text-sm font-bold text-gray-900">
                  {categoryAnalytics.completion_rate.toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${categoryAnalytics.completion_rate}%` }}
                />
              </div>
            </div>

            {/* Enrollment Trend */}
            {categoryAnalytics.enrollment_trend.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-3">اتجاه التسجيل</h3>
                <div className="flex items-end gap-2 h-40">
                  {categoryAnalytics.enrollment_trend.map((trend, index) => {
                    const maxCount = Math.max(
                      ...categoryAnalytics.enrollment_trend.map((t) => t.count)
                    );
                    const height = maxCount > 0 ? (trend.count / maxCount) * 100 : 0;

                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div className="w-full bg-blue-100 rounded-t relative group">
                          <div
                            className="w-full bg-blue-600 rounded-t transition-all"
                            style={{ height: `${height}%`, minHeight: '4px' }}
                          />
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            {trend.count} طالب
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 mt-2 text-center">{trend.month}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
