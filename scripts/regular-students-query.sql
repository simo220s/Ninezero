-- Query to get all REGULAR students
-- Regular students are those where is_trial is FALSE or NULL

SELECT 
  id,
  email,
  first_name,
  last_name,
  role,
  is_trial,
  created_at,
  CASE 
    WHEN is_trial = false THEN 'Regular (Confirmed)'
    WHEN is_trial IS NULL THEN 'Regular (Default)'
    ELSE 'Unknown'
  END as student_type
FROM profiles
WHERE role = 'student'
  AND (is_trial IS NULL OR is_trial = false)
ORDER BY created_at DESC;

-- Query to get just the emails of regular students
SELECT email 
FROM profiles
WHERE role = 'student'
  AND (is_trial IS NULL OR is_trial = false)
ORDER BY created_at DESC;

-- Query to get count of each student type
SELECT 
  CASE 
    WHEN is_trial = true THEN 'Trial'
    WHEN is_trial = false THEN 'Regular (Confirmed)'
    WHEN is_trial IS NULL THEN 'Regular (Default)'
    ELSE 'Unknown'
  END as student_type,
  COUNT(*) as count
FROM profiles
WHERE role = 'student'
GROUP BY is_trial
ORDER BY count DESC;
