/**
 * Category System Types
 * Hierarchical category system for organizing English teaching classes
 * Supports level-based, age group, skill-based, and course type categories
 */

export type CategoryType = 'level' | 'age_group' | 'skill' | 'course_type';

export type LevelCategory = 'Beginner' | 'Elementary' | 'Intermediate' | 'Advanced';
export type AgeGroupCategory = 'Kids 10-12' | 'Teens 13-15' | 'Young Adults 16-18';
export type SkillCategory = 'Speaking' | 'Listening' | 'Reading' | 'Writing' | 'Grammar' | 'Vocabulary' | 'Pronunciation';
export type CourseTypeCategory = 'Trial' | 'Regular' | 'Intensive' | 'Assessment' | 'Group';

export interface Category {
  id: string;
  name: string;
  name_ar: string;
  slug: string;
  description?: string;
  description_ar?: string;
  parent_id?: string;
  category_type: CategoryType;
  image_url?: string;
  display_order: number;
  status: 'active' | 'inactive';
  created_at: Date;
  updated_at: Date;
}

export interface CategoryWithChildren extends Category {
  children: Category[];
  parent?: Category;
}

export interface CategoryTree {
  category: Category;
  children: CategoryTree[];
  depth: number;
}

export interface CategoryFilter {
  category_type?: CategoryType;
  parent_id?: string | null;
  status?: 'active' | 'inactive';
  search?: string;
}

export interface CategoryAnalytics {
  category_id: string;
  category_name: string;
  category_type: CategoryType;
  total_classes: number;
  total_students: number;
  total_revenue: number;
  average_rating: number;
  completion_rate: number;
  enrollment_trend: {
    month: string;
    count: number;
  }[];
}

export interface CategoryStats {
  total_categories: number;
  categories_by_type: {
    [key in CategoryType]: number;
  };
  most_popular_categories: {
    category_id: string;
    category_name: string;
    student_count: number;
  }[];
  revenue_by_category: {
    category_id: string;
    category_name: string;
    revenue: number;
  }[];
}

export interface CreateCategoryInput {
  name: string;
  name_ar: string;
  slug: string;
  description?: string;
  description_ar?: string;
  parent_id?: string;
  category_type: CategoryType;
  image_url?: string;
  display_order?: number;
  status?: 'active' | 'inactive';
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {
  id: string;
}

export interface CategorySearchResult {
  categories: Category[];
  total_count: number;
  page: number;
  page_size: number;
}

// Predefined category structures for English teaching
export const LEVEL_CATEGORIES: { name: string; name_ar: string; slug: string }[] = [
  { name: 'Beginner', name_ar: 'مبتدئ', slug: 'beginner' },
  { name: 'Elementary', name_ar: 'ابتدائي', slug: 'elementary' },
  { name: 'Intermediate', name_ar: 'متوسط', slug: 'intermediate' },
  { name: 'Advanced', name_ar: 'متقدم', slug: 'advanced' },
];

export const AGE_GROUP_CATEGORIES: { name: string; name_ar: string; slug: string }[] = [
  { name: 'Kids 10-12', name_ar: 'أطفال 10-12', slug: 'kids-10-12' },
  { name: 'Teens 13-15', name_ar: 'مراهقون 13-15', slug: 'teens-13-15' },
  { name: 'Young Adults 16-18', name_ar: 'شباب 16-18', slug: 'young-adults-16-18' },
];

export const SKILL_CATEGORIES: { name: string; name_ar: string; slug: string }[] = [
  { name: 'Speaking', name_ar: 'التحدث', slug: 'speaking' },
  { name: 'Listening', name_ar: 'الاستماع', slug: 'listening' },
  { name: 'Reading', name_ar: 'القراءة', slug: 'reading' },
  { name: 'Writing', name_ar: 'الكتابة', slug: 'writing' },
  { name: 'Grammar', name_ar: 'القواعد', slug: 'grammar' },
  { name: 'Vocabulary', name_ar: 'المفردات', slug: 'vocabulary' },
  { name: 'Pronunciation', name_ar: 'النطق', slug: 'pronunciation' },
];

export const COURSE_TYPE_CATEGORIES: { name: string; name_ar: string; slug: string }[] = [
  { name: 'Trial', name_ar: 'تجريبي', slug: 'trial' },
  { name: 'Regular', name_ar: 'عادي', slug: 'regular' },
  { name: 'Intensive', name_ar: 'مكثف', slug: 'intensive' },
  { name: 'Assessment', name_ar: 'تقييم', slug: 'assessment' },
  { name: 'Group', name_ar: 'مجموعة', slug: 'group' },
];
