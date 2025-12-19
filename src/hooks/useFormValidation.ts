/**
 * Form Validation Hook
 * Provides real-time validation feedback for forms
 */

import { useState, useCallback } from 'react'
import { z } from 'zod'
import { validateForm } from '@/lib/validation/form-validation'

interface ValidationState {
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
}

interface UseFormValidationOptions<T extends z.ZodRawShape> {
  schema: z.ZodObject<T>
  mode?: 'onChange' | 'onBlur' | 'onSubmit'
  reValidateMode?: 'onChange' | 'onBlur'
}

/**
 * Hook for form validation with real-time feedback
 */
export function useFormValidation<T extends z.ZodRawShape>({
  schema,
  mode = 'onBlur',
  reValidateMode = 'onChange',
}: UseFormValidationOptions<T>) {
  const [validationState, setValidationState] = useState<ValidationState>({
    errors: {},
    touched: {},
    isValid: false,
  })

  /**
   * Validate a single field
   */
  const validateSingleField = useCallback(
    (fieldName: string, value: unknown) => {
      // Create a partial schema with just this field
      const partialData = { [fieldName]: value }
      const result = schema.pick({ [fieldName]: true } as any).safeParse(partialData)

      setValidationState((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          [fieldName]: result.success ? '' : (result.error.issues[0]?.message || ''),
        },
      }))
    },
    [schema]
  )

  /**
   * Validate all fields
   */
  const validateAllFields = useCallback(
    (data: unknown) => {
      const result = validateForm(schema, data)

      setValidationState({
        errors: result.errors || {},
        touched: Object.keys(schema.shape).reduce(
          (acc, key) => ({ ...acc, [key]: true }),
          {}
        ),
        isValid: result.success,
      })

      return result.success
    },
    [schema]
  )

  /**
   * Mark field as touched
   */
  const touchField = useCallback((fieldName: string) => {
    setValidationState((prev) => ({
      ...prev,
      touched: {
        ...prev.touched,
        [fieldName]: true,
      },
    }))
  }, [])

  /**
   * Clear field error
   */
  const clearFieldError = useCallback((fieldName: string) => {
    setValidationState((prev) => ({
      ...prev,
      errors: {
        ...prev.errors,
        [fieldName]: '',
      },
    }))
  }, [])

  /**
   * Clear all errors
   */
  const clearAllErrors = useCallback(() => {
    setValidationState({
      errors: {},
      touched: {},
      isValid: false,
    })
  }, [])

  /**
   * Get error for a specific field (only if touched)
   */
  const getFieldError = useCallback(
    (fieldName: string): string | undefined => {
      if (!validationState.touched[fieldName]) return undefined
      return validationState.errors[fieldName] || undefined
    },
    [validationState]
  )

  /**
   * Check if field has error
   */
  const hasFieldError = useCallback(
    (fieldName: string): boolean => {
      return Boolean(
        validationState.touched[fieldName] && validationState.errors[fieldName]
      )
    },
    [validationState]
  )

  /**
   * Handle field blur
   */
  const handleBlur = useCallback(
    (fieldName: string, value: unknown) => {
      touchField(fieldName)
      if (mode === 'onBlur' || (validationState.touched[fieldName] && reValidateMode === 'onBlur')) {
        validateSingleField(fieldName, value)
      }
    },
    [mode, reValidateMode, touchField, validateSingleField, validationState.touched]
  )

  /**
   * Handle field change
   */
  const handleChange = useCallback(
    (fieldName: string, value: unknown) => {
      if (mode === 'onChange' || (validationState.touched[fieldName] && reValidateMode === 'onChange')) {
        validateSingleField(fieldName, value)
      }
    },
    [mode, reValidateMode, validateSingleField, validationState.touched]
  )

  return {
    errors: validationState.errors,
    touched: validationState.touched,
    isValid: validationState.isValid,
    validateField: validateSingleField,
    validateForm: validateAllFields,
    touchField,
    clearFieldError,
    clearAllErrors,
    getFieldError,
    hasFieldError,
    handleBlur,
    handleChange,
  }
}
