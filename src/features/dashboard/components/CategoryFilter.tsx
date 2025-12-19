/**
 * Category Filter Component
 * Filtering and search interface for classes by category
 */

import React, { useState, useEffect } from 'react';
import { categoryService } from '../../../lib/services/category-service';
import type { Category, CategoryType } from '../../../types/category';

interface CategoryFilterProps {
  onFilterChange: (selectedCategories: string[]) => void;
  selectedCategories?: string[];
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  onFilterChange,
  selectedCategories = [],
}) => {
  const [categories, setCategories] = useState<{
    level: Category[];
    age_group: Category[];
    skill: Category[];
    course_type: Category[];
  }>({
    level: [],
    age_group: [],
    skill: [],
    course_type: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Set<CategoryType>>(
    new Set(['level', 'age_group', 'skill', 'course_type'])
  );

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setIsLoading(true);
      const [level, age_group, skill, course_type] = await Promise.all([
        categoryService.getCategoriesByType('level'),
        categoryService.getCategoriesByType('age_group'),
        categoryService.getCategoriesByType('skill'),
        categoryService.getCategoriesByType('course_type'),
      ]);

      setCategories({
        level,
        age_group,
        skill,
        course_type,
      });
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: CategoryType) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    onFilterChange(newSelected);
  };

  const handleClearAll = () => {
    onFilterChange([]);
  };

  const handleSelectAllInType = (type: CategoryType) => {
    const typeCategories = categories[type].map((cat) => cat.id);
    const otherSelected = selectedCategories.filter(
      (id) => !typeCategories.includes(id)
    );
    const allTypeSelected = typeCategories.every((id) => selectedCategories.includes(id));

    if (allTypeSelected) {
      // Deselect all in this type
      onFilterChange(otherSelected);
    } else {
      // Select all in this type
      onFilterChange([...otherSelected, ...typeCategories]);
    }
  };

  const getSectionTitle = (type: CategoryType): string => {
    const titles: Record<CategoryType, string> = {
      level: 'المستوى',
      age_group: 'الفئة العمرية',
      skill: 'المهارة',
      course_type: 'نوع الدرس',
    };
    return titles[type];
  };

  const renderCategorySection = (type: CategoryType) => {
    const sectionCategories = categories[type];
    const isExpanded = expandedSections.has(type);
    const selectedInSection = sectionCategories.filter((cat) =>
      selectedCategories.includes(cat.id)
    ).length;

    return (
      <div key={type} className="border-b border-gray-200 last:border-b-0">
        <button
          onClick={() => toggleSection(type)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">{getSectionTitle(type)}</span>
            {selectedInSection > 0 && (
              <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                {selectedInSection}
              </span>
            )}
          </div>
          <svg
            className={`w-5 h-5 text-gray-500 transition-transform ${
              isExpanded ? 'transform rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="px-4 pb-4 space-y-2">
            <button
              onClick={() => handleSelectAllInType(type)}
              className="text-sm text-blue-600 hover:text-blue-700 mb-2"
            >
              {sectionCategories.every((cat) => selectedCategories.includes(cat.id))
                ? 'إلغاء تحديد الكل'
                : 'تحديد الكل'}
            </button>

            {sectionCategories.map((category) => (
              <label
                key={category.id}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category.id)}
                  onChange={() => handleCategoryToggle(category.id)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">{category.name_ar}</div>
                  <div className="text-xs text-gray-500">{category.name}</div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow" dir="rtl">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">تصفية حسب الفئة</h3>
          {selectedCategories.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-red-600 hover:text-red-700"
            >
              مسح الكل
            </button>
          )}
        </div>
        {selectedCategories.length > 0 && (
          <div className="text-sm text-gray-600">
            {selectedCategories.length} فئة محددة
          </div>
        )}
      </div>

      <div className="divide-y divide-gray-200">
        {renderCategorySection('level')}
        {renderCategorySection('age_group')}
        {renderCategorySection('skill')}
        {renderCategorySection('course_type')}
      </div>
    </div>
  );
};

// Compact version for inline filtering
export const CategoryFilterCompact: React.FC<CategoryFilterProps> = ({
  onFilterChange,
  selectedCategories = [],
}) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await categoryService.getCategories({ status: 'active' });
      setCategories(data);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    const newSelected = selectedCategories.includes(categoryId)
      ? selectedCategories.filter((id) => id !== categoryId)
      : [...selectedCategories, categoryId];
    onFilterChange(newSelected);
  };

  const getSelectedCategoryNames = () => {
    return categories
      .filter((cat) => selectedCategories.includes(cat.id))
      .map((cat) => cat.name_ar)
      .join(', ');
  };

  return (
    <div className="relative" dir="rtl">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
      >
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
          />
        </svg>
        <span className="text-sm font-medium text-gray-700">
          {selectedCategories.length > 0
            ? `${selectedCategories.length} فئة محددة`
            : 'تصفية حسب الفئة'}
        </span>
      </button>

      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-20 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-900">اختر الفئات</div>
              {selectedCategories.length > 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  {getSelectedCategoryNames()}
                </div>
              )}
            </div>
            <div className="p-2 space-y-1">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">{category.name_ar}</div>
                    <div className="text-xs text-gray-500">
                      {category.name} • {category.category_type}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
