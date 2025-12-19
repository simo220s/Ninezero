/**
 * Category Manager Component
 * Admin interface for managing categories (CRUD operations)
 */

import React, { useState, useEffect } from 'react';
import { categoryService } from '../../../lib/services/category-service';
import type {
  Category,
  CategoryTree,
  CategoryType,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategoryStats,
} from '../../../types/category';

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
  const [stats, setStats] = useState<CategoryStats | null>(null);
  const [selectedType, setSelectedType] = useState<CategoryType | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form state
  const [formData, setFormData] = useState<Partial<CreateCategoryInput>>({
    name: '',
    name_ar: '',
    slug: '',
    description: '',
    description_ar: '',
    category_type: 'level',
    parent_id: undefined,
    display_order: 0,
    status: 'active',
  });

  useEffect(() => {
    loadCategories();
    loadStats();
  }, [selectedType]);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const filter = selectedType !== 'all' ? { category_type: selectedType } : undefined;
      const data = await categoryService.getCategories(filter);
      setCategories(data);

      // Load tree view
      const tree = await categoryService.getCategoryTree();
      setCategoryTree(tree);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await categoryService.getCategoryStats();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingCategory) {
        await categoryService.updateCategory({
          id: editingCategory.id,
          ...formData,
        } as UpdateCategoryInput);
      } else {
        await categoryService.createCategory(formData as CreateCategoryInput);
      }

      setShowAddModal(false);
      setEditingCategory(null);
      resetForm();
      loadCategories();
      loadStats();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert('فشل في حفظ الفئة');
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      name_ar: category.name_ar,
      slug: category.slug,
      description: category.description,
      description_ar: category.description_ar,
      category_type: category.category_type,
      parent_id: category.parent_id,
      display_order: category.display_order,
      status: category.status,
    });
    setShowAddModal(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) {
      return;
    }

    try {
      await categoryService.deleteCategory(categoryId);
      loadCategories();
      loadStats();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert('فشل في حذف الفئة');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      name_ar: '',
      slug: '',
      description: '',
      description_ar: '',
      category_type: 'level',
      parent_id: undefined,
      display_order: 0,
      status: 'active',
    });
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');
  };

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.name_ar.includes(searchTerm) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderCategoryTree = (trees: CategoryTree[], level: number = 0) => {
    return trees.map((tree) => (
      <div key={tree.category.id} style={{ marginRight: `${level * 20}px` }}>
        <div className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg mb-2 hover:bg-gray-50">
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-900">{tree.category.name}</span>
            <span className="text-sm text-gray-600">{tree.category.name_ar}</span>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
              {tree.category.category_type}
            </span>
            {tree.category.status === 'inactive' && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">غير نشط</span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(tree.category)}
              className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
            >
              تعديل
            </button>
            <button
              onClick={() => handleDelete(tree.category.id)}
              className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
            >
              حذف
            </button>
          </div>
        </div>
        {tree.children.length > 0 && renderCategoryTree(tree.children, level + 1)}
      </div>
    ));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto" dir="rtl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الفئات</h1>
        <p className="text-gray-600">إدارة فئات الدروس والتنظيم الهرمي</p>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">إجمالي الفئات</div>
            <div className="text-2xl font-bold text-gray-900">{stats.total_categories}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">فئات المستوى</div>
            <div className="text-2xl font-bold text-blue-600">{stats.categories_by_type.level}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">فئات الفئة العمرية</div>
            <div className="text-2xl font-bold text-green-600">{stats.categories_by_type.age_group}</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow">
            <div className="text-sm text-gray-600 mb-1">فئات المهارات</div>
            <div className="text-2xl font-bold text-purple-600">{stats.categories_by_type.skill}</div>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedType('all')}
              className={`px-4 py-2 rounded-lg ${
                selectedType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              الكل
            </button>
            <button
              onClick={() => setSelectedType('level')}
              className={`px-4 py-2 rounded-lg ${
                selectedType === 'level'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              المستوى
            </button>
            <button
              onClick={() => setSelectedType('age_group')}
              className={`px-4 py-2 rounded-lg ${
                selectedType === 'age_group'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              الفئة العمرية
            </button>
            <button
              onClick={() => setSelectedType('skill')}
              className={`px-4 py-2 rounded-lg ${
                selectedType === 'skill'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              المهارة
            </button>
            <button
              onClick={() => setSelectedType('course_type')}
              className={`px-4 py-2 rounded-lg ${
                selectedType === 'course_type'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              نوع الدرس
            </button>
          </div>

          <div className="flex gap-2 w-full md:w-auto">
            <input
              type="text"
              placeholder="بحث في الفئات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={() => {
                setEditingCategory(null);
                resetForm();
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 whitespace-nowrap"
            >
              + إضافة فئة
            </button>
          </div>
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">الفئات ({filteredCategories.length})</h2>
        </div>
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-3 py-8">
              <div className="animate-pulse space-y-3">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="text-center py-8 text-gray-500">لا توجد فئات</div>
          ) : (
            <div className="space-y-2">{renderCategoryTree(categoryTree)}</div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الاسم (English) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (!editingCategory) {
                          setFormData((prev) => ({ ...prev, slug: generateSlug(e.target.value) }));
                        }
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الاسم (العربية) *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name_ar}
                      onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input
                    type="text"
                    required
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نوع الفئة *</label>
                    <select
                      required
                      value={formData.category_type}
                      onChange={(e) =>
                        setFormData({ ...formData, category_type: e.target.value as CategoryType })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="level">المستوى</option>
                      <option value="age_group">الفئة العمرية</option>
                      <option value="skill">المهارة</option>
                      <option value="course_type">نوع الدرس</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
                    <select
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">نشط</option>
                      <option value="inactive">غير نشط</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف (English)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف (العربية)
                  </label>
                  <textarea
                    value={formData.description_ar}
                    onChange={(e) => setFormData({ ...formData, description_ar: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setEditingCategory(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingCategory ? 'حفظ التغييرات' : 'إضافة الفئة'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
