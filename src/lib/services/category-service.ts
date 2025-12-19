/**
 * Category Service
 * Handles all category-related operations including CRUD, filtering, search, and analytics
 */

import { supabase } from '../supabase';
import type {
  Category,
  CategoryWithChildren,
  CategoryTree,
  CategoryFilter,
  CategoryAnalytics as CategoryAnalyticsType,
  CategoryStats,
  CreateCategoryInput,
  UpdateCategoryInput,
  CategorySearchResult,
  CategoryType,
} from '../../types/category';

export class CategoryService {
  /**
   * Create a new category
   */
  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const { data, error } = await supabase
      .from('class_categories')
      .insert({
        name: input.name,
        name_ar: input.name_ar,
        slug: input.slug,
        description: input.description,
        description_ar: input.description_ar,
        parent_id: input.parent_id,
        category_type: input.category_type,
        image_url: input.image_url,
        display_order: input.display_order ?? 0,
        status: input.status ?? 'active',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create category: ${error.message}`);
    }

    return data;
  }

  /**
   * Update an existing category
   */
  async updateCategory(input: UpdateCategoryInput): Promise<Category> {
    const { id, ...updates } = input;

    const { data, error } = await supabase
      .from('class_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`);
    }

    return data;
  }

  /**
   * Delete a category
   */
  async deleteCategory(categoryId: string): Promise<void> {
    const { error } = await supabase
      .from('class_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`);
    }
  }

  /**
   * Get a single category by ID
   */
  async getCategoryById(categoryId: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('class_categories')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw new Error(`Failed to get category: ${error.message}`);
    }

    return data;
  }

  /**
   * Get a category by slug
   */
  async getCategoryBySlug(slug: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('class_categories')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null;
      }
      throw new Error(`Failed to get category: ${error.message}`);
    }

    return data;
  }

  /**
   * Get all categories with optional filtering
   */
  async getCategories(filter?: CategoryFilter): Promise<Category[]> {
    let query = supabase.from('class_categories').select('*');

    if (filter?.category_type) {
      query = query.eq('category_type', filter.category_type);
    }

    if (filter?.parent_id !== undefined) {
      if (filter.parent_id === null || filter.parent_id === '') {
        query = query.is('parent_id', null);
      } else {
        query = query.eq('parent_id', filter.parent_id);
      }
    }

    if (filter?.status) {
      query = query.eq('status', filter.status);
    }

    if (filter?.search) {
      query = query.or(
        `name.ilike.%${filter.search}%,name_ar.ilike.%${filter.search}%,slug.ilike.%${filter.search}%`
      );
    }

    query = query.order('display_order', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get categories: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Get categories by type
   */
  async getCategoriesByType(categoryType: CategoryType): Promise<Category[]> {
    return this.getCategories({ category_type: categoryType, status: 'active' });
  }

  /**
   * Get root categories (categories without parents)
   */
  async getRootCategories(): Promise<Category[]> {
    return this.getCategories({ parent_id: '', status: 'active' });
  }

  /**
   * Get child categories of a parent
   */
  async getChildCategories(parentId: string): Promise<Category[]> {
    return this.getCategories({ parent_id: parentId, status: 'active' });
  }

  /**
   * Get category with its children
   */
  async getCategoryWithChildren(categoryId: string): Promise<CategoryWithChildren | null> {
    const category = await this.getCategoryById(categoryId);
    if (!category) {
      return null;
    }

    const children = await this.getChildCategories(categoryId);

    let parent: Category | undefined;
    if (category.parent_id) {
      const parentData = await this.getCategoryById(category.parent_id);
      if (parentData) {
        parent = parentData;
      }
    }

    return {
      ...category,
      children,
      parent,
    };
  }

  /**
   * Build category tree recursively
   */
  async buildCategoryTree(parentId: string | null = null, depth: number = 0): Promise<CategoryTree[]> {
    const categories = await this.getCategories({
      parent_id: parentId,
      status: 'active',
    });

    const trees: CategoryTree[] = [];

    for (const category of categories) {
      const children = await this.buildCategoryTree(category.id, depth + 1);
      trees.push({
        category,
        children,
        depth,
      });
    }

    return trees;
  }

  /**
   * Get full category tree
   */
  async getCategoryTree(): Promise<CategoryTree[]> {
    return this.buildCategoryTree(null, 0);
  }

  /**
   * Search categories with pagination
   */
  async searchCategories(
    searchTerm: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<CategorySearchResult> {
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const query = supabase
      .from('class_categories')
      .select('*', { count: 'exact' })
      .or(`name.ilike.%${searchTerm}%,name_ar.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`)
      .eq('status', 'active')
      .order('display_order', { ascending: true })
      .range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to search categories: ${error.message}`);
    }

    return {
      categories: data || [],
      total_count: count || 0,
      page,
      page_size: pageSize,
    };
  }

  /**
   * Assign categories to a class
   */
  async assignCategoriesToClass(classId: string, categoryIds: string[]): Promise<void> {
    // First, remove existing assignments
    await supabase
      .from('class_category_assignments')
      .delete()
      .eq('class_id', classId);

    // Then, insert new assignments
    if (categoryIds.length > 0) {
      const assignments = categoryIds.map((categoryId) => ({
        class_id: classId,
        category_id: categoryId,
      }));

      const { error } = await supabase
        .from('class_category_assignments')
        .insert(assignments);

      if (error) {
        throw new Error(`Failed to assign categories: ${error.message}`);
      }
    }
  }

  /**
   * Get categories assigned to a class
   */
  async getClassCategories(classId: string): Promise<Category[]> {
    const { data, error } = await supabase
      .from('class_category_assignments')
      .select('category_id, class_categories(*)')
      .eq('class_id', classId);

    if (error) {
      throw new Error(`Failed to get class categories: ${error.message}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data?.map((item: any) => item.class_categories as Category).filter(Boolean) || [];
  }

  /**
   * Get classes by category
   */
  async getClassesByCategory(categoryId: string): Promise<string[]> {
    const { data, error } = await supabase
      .from('class_category_assignments')
      .select('class_id')
      .eq('category_id', categoryId);

    if (error) {
      throw new Error(`Failed to get classes by category: ${error.message}`);
    }

    return data?.map((item: { class_id: string }) => item.class_id) || [];
  }

  /**
   * Get category analytics
   */
  async getCategoryAnalytics(categoryId: string): Promise<CategoryAnalyticsType | null> {
    // Get category info
    const category = await this.getCategoryById(categoryId);
    if (!category) {
      return null;
    }

    // Get analytics from the view
    const { data, error } = await supabase
      .from('category_stats_view')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No analytics yet, return default
        return {
          category_id: categoryId,
          category_name: category.name,
          category_type: category.category_type,
          total_classes: 0,
          total_students: 0,
          total_revenue: 0,
          average_rating: 0,
          completion_rate: 0,
          enrollment_trend: [],
        };
      }
      throw new Error(`Failed to get category analytics: ${error.message}`);
    }

    // Get enrollment trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: trendData } = await supabase
      .from('category_analytics')
      .select('period_start, total_students')
      .eq('category_id', categoryId)
      .gte('period_start', sixMonthsAgo.toISOString())
      .order('period_start', { ascending: true });

    const enrollment_trend = (trendData || []).map((item: { period_start: string; total_students: number }) => ({
      month: new Date(item.period_start).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      count: item.total_students,
    }));

    return {
      category_id: categoryId,
      category_name: category.name,
      category_type: category.category_type,
      total_classes: data.total_classes || 0,
      total_students: data.total_students || 0,
      total_revenue: data.total_revenue || 0,
      average_rating: data.average_rating || 0,
      completion_rate: data.completion_rate || 0,
      enrollment_trend,
    };
  }

  /**
   * Get overall category statistics
   */
  async getCategoryStats(): Promise<CategoryStats> {
    // Get total categories
    const { count: totalCount } = await supabase
      .from('class_categories')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    // Get categories by type
    const { data: typeData } = await supabase
      .from('class_categories')
      .select('category_type')
      .eq('status', 'active');

    const categories_by_type = {
      level: 0,
      age_group: 0,
      skill: 0,
      course_type: 0,
    };

    typeData?.forEach((item: { category_type: CategoryType }) => {
      categories_by_type[item.category_type]++;
    });

    // Get most popular categories
    const { data: popularData } = await supabase
      .from('category_stats_view')
      .select('id, name, total_students')
      .order('total_students', { ascending: false })
      .limit(5);

    const most_popular_categories = (popularData || []).map((item: { id: string; name: string; total_students: number }) => ({
      category_id: item.id,
      category_name: item.name,
      student_count: item.total_students || 0,
    }));

    // Get revenue by category
    const { data: revenueData } = await supabase
      .from('category_stats_view')
      .select('id, name, total_revenue')
      .order('total_revenue', { ascending: false })
      .limit(5);

    const revenue_by_category = (revenueData || []).map((item: { id: string; name: string; total_revenue: number }) => ({
      category_id: item.id,
      category_name: item.name,
      revenue: item.total_revenue || 0,
    }));

    return {
      total_categories: totalCount || 0,
      categories_by_type,
      most_popular_categories,
      revenue_by_category,
    };
  }

  /**
   * Update category analytics
   */
  async updateCategoryAnalytics(
    categoryId: string,
    periodStart: Date,
    periodEnd: Date,
    metrics: {
      total_classes: number;
      total_students: number;
      total_revenue: number;
      average_rating: number;
      completion_rate: number;
    }
  ): Promise<void> {
    const { error } = await supabase
      .from('category_analytics')
      .upsert({
        category_id: categoryId,
        period_start: periodStart.toISOString().split('T')[0],
        period_end: periodEnd.toISOString().split('T')[0],
        ...metrics,
      });

    if (error) {
      throw new Error(`Failed to update category analytics: ${error.message}`);
    }
  }

  /**
   * Reorder categories
   */
  async reorderCategories(categoryIds: string[]): Promise<void> {
    const updates = categoryIds.map((id, index) => ({
      id,
      display_order: index,
    }));

    for (const update of updates) {
      await supabase
        .from('class_categories')
        .update({ display_order: update.display_order })
        .eq('id', update.id);
    }
  }
}

// Export singleton instance
export const categoryService = new CategoryService();
