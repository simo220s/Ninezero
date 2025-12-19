import { createClient, SupabaseClient } from '@supabase/supabase-js';

interface SupabaseConfig {
  url: string;
  serviceRoleKey: string;
}

class SupabaseConnection {
  private static instance: SupabaseClient | null = null;
  private static retryCount = 0;
  private static readonly MAX_RETRIES = 3;
  private static readonly RETRY_DELAY_MS = 1000;

  /**
   * Get or create Supabase client instance
   */
  public static getClient(): SupabaseClient {
    if (!this.instance) {
      this.instance = this.createClient();
    }
    return this.instance;
  }

  /**
   * Create Supabase client with service role key
   */
  private static createClient(): SupabaseClient {
    const config = this.getConfig();

    const client = createClient(config.url, config.serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    return client;
  }

  /**
   * Get Supabase configuration from environment variables
   */
  private static getConfig(): SupabaseConfig {
    const url = process.env.SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !serviceRoleKey) {
      throw new Error(
        'Missing required Supabase configuration. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables.'
      );
    }

    return { url, serviceRoleKey };
  }

  /**
   * Validate database connection with retry logic
   */
  public static async validateConnection(): Promise<boolean> {
    const client = this.getClient();

    try {
      // Simple query to test connection
      const { error } = await client.from('profiles').select('id').limit(1);

      if (error) {
        throw error;
      }

      this.retryCount = 0; // Reset retry count on success
      return true;
    } catch (error) {
      console.error('Database connection validation failed:', error);

      if (this.retryCount < this.MAX_RETRIES) {
        this.retryCount++;
        const delay = this.RETRY_DELAY_MS * Math.pow(2, this.retryCount - 1); // Exponential backoff

        console.log(
          `Retrying connection (${this.retryCount}/${this.MAX_RETRIES}) in ${delay}ms...`
        );

        await this.sleep(delay);
        return this.validateConnection();
      }

      throw new Error(
        `Failed to connect to database after ${this.MAX_RETRIES} attempts`
      );
    }
  }

  /**
   * Execute database operation with retry logic
   */
  public static async withRetry<T>(
    operation: () => Promise<T>,
    retries = 3
  ): Promise<T> {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        const delay = this.RETRY_DELAY_MS * Math.pow(2, 3 - retries);
        console.log(`Retrying operation in ${delay}ms... (${retries} retries left)`);
        await this.sleep(delay);
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }

  /**
   * Helper function to sleep for specified milliseconds
   */
  private static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Close connection (cleanup)
   */
  public static close(): void {
    this.instance = null;
    this.retryCount = 0;
  }
}

// Export singleton instance getter
export const getSupabaseClient = (): SupabaseClient => {
  return SupabaseConnection.getClient();
};

// Export validation function
export const validateDatabaseConnection = async (): Promise<boolean> => {
  return SupabaseConnection.validateConnection();
};

// Export retry helper
export const withRetry = <T>(
  operation: () => Promise<T>,
  retries = 3
): Promise<T> => {
  return SupabaseConnection.withRetry(operation, retries);
};

// Export close function
export const closeConnection = (): void => {
  SupabaseConnection.close();
};
