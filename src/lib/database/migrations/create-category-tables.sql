-- Category System Database Schema
-- Hierarchical category system for organizing English teaching classes
-- Supports level-based, age group, skill-based, and course type categories

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for category types
CREATE TYPE category_type AS ENUM ('level', 'age_group', 'skill', 'course_type');

-- Create enum for category status
CREATE TYPE category_status AS ENUM ('active', 'inactive');

-- Main categories table with hierarchical support
CREATE TABLE IF NOT EXISTS class_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  name_ar VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  description_ar TEXT,
  parent_id UUID REFERENCES class_categories(id) ON DELETE SET NULL,
  category_type category_type NOT NULL,
  image_url TEXT,
  display_order INTEGER DEFAULT 0,
  status category_status DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT unique_slug_per_type UNIQUE (slug, category_type),
  CONSTRAINT no_self_reference CHECK (id != parent_id)
);

-- Create indexes for better query performance
CREATE INDEX idx_categories_type ON class_categories(category_type);
CREATE INDEX idx_categories_parent ON class_categories(parent_id);
CREATE INDEX idx_categories_status ON class_categories(status);
CREATE INDEX idx_categories_slug ON class_categories(slug);
CREATE INDEX idx_categories_display_order ON class_categories(display_order);

-- Junction table for class-category relationships (many-to-many)
CREATE TABLE IF NOT EXISTS class_category_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  class_id UUID NOT NULL,
  category_id UUID REFERENCES class_categories(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique class-category pairs
  CONSTRAINT unique_class_category UNIQUE (class_id, category_id)
);

CREATE INDEX idx_class_category_class ON class_category_assignments(class_id);
CREATE INDEX idx_class_category_category ON class_category_assignments(category_id);

-- Category analytics table for tracking performance metrics
CREATE TABLE IF NOT EXISTS category_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES class_categories(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_classes INTEGER DEFAULT 0,
  total_students INTEGER DEFAULT 0,
  total_revenue DECIMAL(10,2) DEFAULT 0,
  average_rating DECIMAL(3,2) DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  -- Ensure unique analytics per category per period
  CONSTRAINT unique_category_period UNIQUE (category_id, period_start, period_end)
);

CREATE INDEX idx_category_analytics_category ON category_analytics(category_id);
CREATE INDEX idx_category_analytics_period ON category_analytics(period_start, period_end);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_category_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trigger_update_category_timestamp
  BEFORE UPDATE ON class_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_category_updated_at();

CREATE TRIGGER trigger_update_category_analytics_timestamp
  BEFORE UPDATE ON category_analytics
  FOR EACH ROW
  EXECUTE FUNCTION update_category_updated_at();

-- Function to get category hierarchy path
CREATE OR REPLACE FUNCTION get_category_path(category_id UUID)
RETURNS TEXT AS $$
DECLARE
  path TEXT := '';
  current_id UUID := category_id;
  current_name VARCHAR(100);
  parent_id_val UUID;
BEGIN
  LOOP
    SELECT name, parent_id INTO current_name, parent_id_val
    FROM class_categories
    WHERE id = current_id;
    
    IF current_name IS NULL THEN
      EXIT;
    END IF;
    
    IF path = '' THEN
      path := current_name;
    ELSE
      path := current_name || ' > ' || path;
    END IF;
    
    IF parent_id_val IS NULL THEN
      EXIT;
    END IF;
    
    current_id := parent_id_val;
  END LOOP;
  
  RETURN path;
END;
$$ LANGUAGE plpgsql;

-- Function to get all child categories recursively
CREATE OR REPLACE FUNCTION get_child_categories(parent_category_id UUID)
RETURNS TABLE (
  id UUID,
  name VARCHAR(100),
  name_ar VARCHAR(100),
  slug VARCHAR(100),
  category_type category_type,
  depth INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH RECURSIVE category_tree AS (
    -- Base case: direct children
    SELECT 
      c.id,
      c.name,
      c.name_ar,
      c.slug,
      c.category_type,
      1 as depth
    FROM class_categories c
    WHERE c.parent_id = parent_category_id
    
    UNION ALL
    
    -- Recursive case: children of children
    SELECT 
      c.id,
      c.name,
      c.name_ar,
      c.slug,
      c.category_type,
      ct.depth + 1
    FROM class_categories c
    INNER JOIN category_tree ct ON c.parent_id = ct.id
  )
  SELECT * FROM category_tree
  ORDER BY depth, name;
END;
$$ LANGUAGE plpgsql;

-- Insert predefined categories for English teaching

-- Level-based categories
INSERT INTO class_categories (name, name_ar, slug, category_type, display_order, description, description_ar) VALUES
  ('Beginner', 'مبتدئ', 'beginner', 'level', 1, 'For students just starting their English learning journey', 'للطلاب الذين بدأوا للتو رحلة تعلم اللغة الإنجليزية'),
  ('Elementary', 'ابتدائي', 'elementary', 'level', 2, 'For students with basic English knowledge', 'للطلاب الذين لديهم معرفة أساسية باللغة الإنجليزية'),
  ('Intermediate', 'متوسط', 'intermediate', 'level', 3, 'For students with moderate English proficiency', 'للطلاب ذوي الكفاءة المتوسطة في اللغة الإنجليزية'),
  ('Advanced', 'متقدم', 'advanced', 'level', 4, 'For students with high English proficiency', 'للطلاب ذوي الكفاءة العالية في اللغة الإنجليزية');

-- Age group categories
INSERT INTO class_categories (name, name_ar, slug, category_type, display_order, description, description_ar) VALUES
  ('Kids 10-12', 'أطفال 10-12', 'kids-10-12', 'age_group', 1, 'English classes designed for children aged 10-12', 'دروس اللغة الإنجليزية المصممة للأطفال من سن 10-12'),
  ('Teens 13-15', 'مراهقون 13-15', 'teens-13-15', 'age_group', 2, 'English classes designed for teenagers aged 13-15', 'دروس اللغة الإنجليزية المصممة للمراهقين من سن 13-15'),
  ('Young Adults 16-18', 'شباب 16-18', 'young-adults-16-18', 'age_group', 3, 'English classes designed for young adults aged 16-18', 'دروس اللغة الإنجليزية المصممة للشباب من سن 16-18');

-- Skill-based categories
INSERT INTO class_categories (name, name_ar, slug, category_type, display_order, description, description_ar) VALUES
  ('Speaking', 'التحدث', 'speaking', 'skill', 1, 'Focus on verbal communication and conversation skills', 'التركيز على التواصل اللفظي ومهارات المحادثة'),
  ('Listening', 'الاستماع', 'listening', 'skill', 2, 'Improve comprehension and listening abilities', 'تحسين الفهم وقدرات الاستماع'),
  ('Reading', 'القراءة', 'reading', 'skill', 3, 'Enhance reading comprehension and speed', 'تعزيز فهم القراءة والسرعة'),
  ('Writing', 'الكتابة', 'writing', 'skill', 4, 'Develop writing skills and composition', 'تطوير مهارات الكتابة والتأليف'),
  ('Grammar', 'القواعد', 'grammar', 'skill', 5, 'Master English grammar rules and structures', 'إتقان قواعد اللغة الإنجليزية والهياكل'),
  ('Vocabulary', 'المفردات', 'vocabulary', 'skill', 6, 'Expand vocabulary and word usage', 'توسيع المفردات واستخدام الكلمات'),
  ('Pronunciation', 'النطق', 'pronunciation', 'skill', 7, 'Perfect pronunciation and accent', 'إتقان النطق واللهجة');

-- Course type categories
INSERT INTO class_categories (name, name_ar, slug, category_type, display_order, description, description_ar) VALUES
  ('Trial', 'تجريبي', 'trial', 'course_type', 1, 'Trial classes for new students', 'دروس تجريبية للطلاب الجدد'),
  ('Regular', 'عادي', 'regular', 'course_type', 2, 'Standard one-on-one or group classes', 'دروس فردية أو جماعية قياسية'),
  ('Intensive', 'مكثف', 'intensive', 'course_type', 3, 'Intensive courses for rapid progress', 'دورات مكثفة للتقدم السريع'),
  ('Assessment', 'تقييم', 'assessment', 'course_type', 4, 'Assessment and evaluation sessions', 'جلسات التقييم والتقويم'),
  ('Group', 'مجموعة', 'group', 'course_type', 5, 'Group classes with multiple students', 'دروس جماعية مع عدة طلاب');

-- Create view for category statistics
CREATE OR REPLACE VIEW category_stats_view AS
SELECT 
  c.id,
  c.name,
  c.name_ar,
  c.category_type,
  COUNT(DISTINCT cca.class_id) as total_classes,
  COALESCE(SUM(ca.total_students), 0) as total_students,
  COALESCE(SUM(ca.total_revenue), 0) as total_revenue,
  COALESCE(AVG(ca.average_rating), 0) as average_rating,
  COALESCE(AVG(ca.completion_rate), 0) as completion_rate
FROM class_categories c
LEFT JOIN class_category_assignments cca ON c.id = cca.category_id
LEFT JOIN category_analytics ca ON c.id = ca.category_id
WHERE c.status = 'active'
GROUP BY c.id, c.name, c.name_ar, c.category_type;

-- Grant permissions (adjust based on your RLS policies)
-- ALTER TABLE class_categories ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE class_category_assignments ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE category_analytics ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE class_categories IS 'Hierarchical category system for organizing English teaching classes';
COMMENT ON TABLE class_category_assignments IS 'Many-to-many relationship between classes and categories';
COMMENT ON TABLE category_analytics IS 'Analytics and performance metrics for each category';
COMMENT ON COLUMN class_categories.category_type IS 'Type of category: level, age_group, skill, or course_type';
COMMENT ON COLUMN class_categories.parent_id IS 'Parent category ID for hierarchical structure';
COMMENT ON FUNCTION get_category_path IS 'Returns the full hierarchical path of a category';
COMMENT ON FUNCTION get_child_categories IS 'Returns all child categories recursively';
