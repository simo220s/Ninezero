/**
 * Error codes and their corresponding Arabic messages
 */
export const ERROR_MESSAGES: Record<string, string> = {
  // Authentication errors
  INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
  EMAIL_EXISTS: 'البريد الإلكتروني مستخدم بالفعل',
  USER_NOT_FOUND: 'المستخدم غير موجود',
  TOKEN_EXPIRED: 'انتهت صلاحية الجلسة',
  INVALID_TOKEN: 'رمز غير صحيح',
  TOKEN_BLACKLISTED: 'رمز غير صالح',
  MISSING_TOKEN: 'رمز المصادقة مطلوب',
  UNAUTHORIZED: 'يجب تسجيل الدخول أولاً',
  
  // Password errors
  WEAK_PASSWORD: 'كلمة المرور ضعيفة جداً',
  PASSWORD_MISMATCH: 'كلمات المرور غير متطابقة',
  
  // Rate limiting
  RATE_LIMIT_EXCEEDED: 'تم تجاوز عدد المحاولات المسموحة',
  
  // Validation errors
  VALIDATION_ERROR: 'خطأ في التحقق من البيانات',
  INVALID_EMAIL: 'البريد الإلكتروني غير صحيح',
  INVALID_INPUT: 'البيانات المدخلة غير صحيحة',
  
  // Permission errors
  FORBIDDEN: 'ليس لديك صلاحية للوصول إلى هذا المورد',
  INSUFFICIENT_PERMISSIONS: 'صلاحيات غير كافية',
  
  // Server errors
  SERVER_ERROR: 'حدث خطأ في الخادم',
  DATABASE_ERROR: 'خطأ في قاعدة البيانات',
  SERVICE_UNAVAILABLE: 'الخدمة غير متاحة حالياً',
  
  // Resource errors
  NOT_FOUND: 'المورد غير موجود',
  CONFLICT: 'تعارض في البيانات',
  
  // General errors
  BAD_REQUEST: 'طلب غير صحيح',
  INTERNAL_ERROR: 'خطأ داخلي',
};

/**
 * HTTP status codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * User roles
 */
export const USER_ROLES = {
  STUDENT: 'student',
  TEACHER: 'teacher',
  ADMIN: 'admin',
} as const;

/**
 * Token expiration times
 */
export const TOKEN_EXPIRATION = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
  PASSWORD_RESET: '1h',
  EMAIL_VERIFICATION: '24h',
} as const;
