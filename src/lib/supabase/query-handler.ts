/**
 * Supabase Query Error Handler
 *
 * Provides error handling wrapper for all Supabase queries with:
 * - Automatic error categorization
 * - Retry logic for transient failures
 * - User-friendly error messages
 * - Logging and monitoring
 */

import {
  type PostgrestError,
  type PostgrestResponse,
  type PostgrestSingleResponse,
} from "@supabase/postgrest-js";
import { logger } from "../utils/logger";
import {
  errorService,
  ErrorCategoryEnum,
  ErrorSeverityEnum,
  type CategorizedError,
  type ErrorCategory,
  type ErrorSeverity,
} from "../services/error-service";

// Use enums for runtime values
const ErrorCategory = ErrorCategoryEnum;
const ErrorSeverity = ErrorSeverityEnum;
import {
  connectionManager,
  ConnectionStatusEnum,
  type ConnectionStatus,
} from "./connection-manager";

/**
 * Query result with error handling
 */
export interface QueryResult<T> {
  data: T | null;
  error: CategorizedError | null;
  success: boolean;
}

/**
 * Query options
 */
export interface QueryOptions {
  retryOnFailure?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  showErrorToast?: boolean;
  logError?: boolean;
  context?: Record<string, unknown>;
}

/**
 * Default query options
 */
const DEFAULT_OPTIONS: Required<QueryOptions> = {
  retryOnFailure: true,
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  showErrorToast: true,
  logError: true,
  context: {},
};

/**
 * Check if error is retryable
 */
function isRetryableError(error: PostgrestError | Error): boolean {
  const errorStr = error.message.toLowerCase();

  // Network errors are retryable
  if (
    errorStr.includes("network") ||
    errorStr.includes("fetch") ||
    errorStr.includes("timeout") ||
    errorStr.includes("connection")
  ) {
    return true;
  }

  // Specific PostgreSQL error codes that are retryable
  const retryableCodes = [
    "08000", // connection_exception
    "08003", // connection_does_not_exist
    "08006", // connection_failure
    "08001", // sqlclient_unable_to_establish_sqlconnection
    "08004", // sqlserver_rejected_establishment_of_sqlconnection
    "40001", // serialization_failure
    "40P01", // deadlock_detected
    "53300", // too_many_connections
    "57P03", // cannot_connect_now
  ];

  if ("code" in error && typeof error.code === "string") {
    return retryableCodes.includes(error.code);
  }

  return false;
}

/**
 * Categorize Supabase error
 */
function categorizeSupabaseError(
  error: PostgrestError | Error,
): CategorizedError {
  const message = error.message;

  // Check for specific error patterns
  if ("code" in error && typeof error.code === "string") {
    const code = error.code;

    // Authentication errors
    if (code === "PGRST301" || code === "42501") {
      return errorService.errors.auth(error);
    }

    // Authorization errors
    if (code === "PGRST116" || code === "42501") {
      return errorService.errors.unauthorized(error);
    }

    // Constraint violations
    if (code.startsWith("23")) {
      return errorService.createError(
        ErrorCategory.VALIDATION,
        "Data validation failed",
        {
          code,
          userMessage:
            "البيانات المدخلة غير صحيحة. يرجى التحقق والمحاولة مرة أخرى.",
          originalError: error,
          severity: ErrorSeverity.MEDIUM,
          recoverable: false,
        },
      );
    }

    // Connection errors
    if (code.startsWith("08") || code.startsWith("57")) {
      return errorService.errors.network(error);
    }
  }

  // Check message patterns
  if (
    message.includes("JWT") ||
    message.includes("token") ||
    message.includes("unauthorized")
  ) {
    return errorService.errors.auth(error);
  }

  if (message.includes("permission") || message.includes("forbidden")) {
    return errorService.errors.unauthorized(error);
  }

  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("connection")
  ) {
    return errorService.errors.network(error);
  }

  // Default to database error
  return errorService.errors.database(error);
}

/**
 * Execute query with error handling and retry logic
 */
export async function executeQuery<T>(
  queryFn: () => Promise<PostgrestResponse<T> | PostgrestSingleResponse<T>>,
  options?: QueryOptions,
): Promise<QueryResult<T>> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: CategorizedError | null = null;
  let attempt = 0;

  // Check connection status
  if (!connectionManager.isConnected()) {
    logger.warn("Query attempted while disconnected", {
      component: "QueryHandler",
      metadata: { status: connectionManager.getStatus() },
    });

    // Wait for connection if connecting
    if (connectionManager.getStatus() === ConnectionStatus.CONNECTING) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }

    // If still not connected, return error
    if (!connectionManager.isConnected()) {
      const error = errorService.errors.network();
      if (opts.showErrorToast) {
        errorService.showError(error.userMessage);
      }
      return {
        data: null,
        error,
        success: false,
      };
    }
  }

  while (attempt <= opts.maxRetries) {
    try {
      // Execute the query
      const response = await queryFn();

      // Check for errors in response
      if (response.error) {
        const categorizedError = categorizeSupabaseError(response.error);
        lastError = categorizedError;

        // Log the error
        if (opts.logError) {
          logger.error("Query error", response.error, {
            component: "QueryHandler",
            metadata: {
              attempt: attempt + 1,
              maxRetries: opts.maxRetries,
              code: "code" in response.error ? response.error.code : undefined,
              ...opts.context,
            },
          });
        }

        // Check if we should retry
        if (
          opts.retryOnFailure &&
          attempt < opts.maxRetries &&
          isRetryableError(response.error)
        ) {
          attempt++;
          logger.info("Retrying query", {
            component: "QueryHandler",
            metadata: {
              attempt: attempt + 1,
              maxRetries: opts.maxRetries,
              delay: opts.retryDelay,
            },
          });

          // Wait before retrying
          await new Promise((resolve) => setTimeout(resolve, opts.retryDelay));
          continue;
        }

        // No more retries, return error
        if (opts.showErrorToast) {
          errorService.showError(categorizedError.userMessage);
        }

        return {
          data: null,
          error: categorizedError,
          success: false,
        };
      }

      // Success!
      logger.debug("Query successful", {
        component: "QueryHandler",
        metadata: {
          attempt: attempt + 1,
          ...opts.context,
        },
      });

      return {
        data: response.data as T,
        error: null,
        success: true,
      };
    } catch (error) {
      const categorizedError = categorizeSupabaseError(error as Error);
      lastError = categorizedError;

      // Log the error
      if (opts.logError) {
        logger.error("Query exception", error as Error, {
          component: "QueryHandler",
          metadata: {
            attempt: attempt + 1,
            maxRetries: opts.maxRetries,
            ...opts.context,
          },
        });
      }

      // Check if we should retry
      if (
        opts.retryOnFailure &&
        attempt < opts.maxRetries &&
        isRetryableError(error as Error)
      ) {
        attempt++;
        logger.info("Retrying query after exception", {
          component: "QueryHandler",
          metadata: {
            attempt: attempt + 1,
            maxRetries: opts.maxRetries,
            delay: opts.retryDelay,
          },
        });

        // Wait before retrying
        await new Promise((resolve) => setTimeout(resolve, opts.retryDelay));
        continue;
      }

      // No more retries, return error
      if (opts.showErrorToast) {
        errorService.showError(categorizedError.userMessage);
      }

      return {
        data: null,
        error: categorizedError,
        success: false,
      };
    }
  }

  // Should never reach here, but just in case
  return {
    data: null,
    error: lastError || errorService.errors.unknown(),
    success: false,
  };
}

/**
 * Execute mutation with error handling
 */
export async function executeMutation<T>(
  mutationFn: () => Promise<PostgrestResponse<T> | PostgrestSingleResponse<T>>,
  options?: Omit<QueryOptions, "retryOnFailure" | "maxRetries">,
): Promise<QueryResult<T>> {
  // Mutations should not be retried by default
  return executeQuery(mutationFn, {
    ...options,
    retryOnFailure: false,
    maxRetries: 0,
  });
}

/**
 * Execute query without error toast (for background operations)
 */
export async function executeSilentQuery<T>(
  queryFn: () => Promise<PostgrestResponse<T> | PostgrestSingleResponse<T>>,
  options?: Omit<QueryOptions, "showErrorToast">,
): Promise<QueryResult<T>> {
  return executeQuery(queryFn, {
    ...options,
    showErrorToast: false,
  });
}

/**
 * Batch execute multiple queries
 */
export async function executeBatch(
  queryFns: Array<
    () => Promise<PostgrestResponse<unknown> | PostgrestSingleResponse<unknown>>
  >,
  options?: QueryOptions,
): Promise<{
  results: QueryResult<unknown>[];
  allSuccessful: boolean;
  errors: CategorizedError[];
}> {
  const results = await Promise.all(
    queryFns.map((queryFn) => executeQuery(queryFn, options)),
  );

  const errors = results
    .filter((result) => result.error !== null)
    .map((result) => result.error!);

  return {
    results,
    allSuccessful: errors.length === 0,
    errors,
  };
}

/**
 * Helper to wrap Supabase query builders
 */
export function wrapQuery<T>(
  queryBuilder: {
    then: (
      onfulfilled?: ((value: PostgrestResponse<T>) => unknown) | null,
    ) => Promise<PostgrestResponse<T>>;
  },
  options?: QueryOptions,
): Promise<QueryResult<T>> {
  return executeQuery(
    () => queryBuilder as Promise<PostgrestResponse<T>>,
    options,
  );
}

// Export types
export type { PostgrestError, PostgrestResponse, PostgrestSingleResponse };
