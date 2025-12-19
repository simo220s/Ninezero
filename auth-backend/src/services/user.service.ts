import bcrypt from 'bcrypt';
import { getSupabaseClient } from '../config/supabase';

export interface CreateUserDTO {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  is_email_verified: boolean;
  is_trial: boolean;
  trial_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isEmailVerified: boolean;
  isTrial: boolean;
  trialCompleted: boolean;
}

class UserService {
  private readonly SALT_ROUNDS = 10;

  /**
   * Hash password using bcrypt with 10 salt rounds
   */
  async hashPassword(password: string): Promise<string> {
    try {
      const hash = await bcrypt.hash(password, this.SALT_ROUNDS);
      return hash;
    } catch (error) {
      console.error('Error hashing password:', error);
      throw new Error('Failed to hash password');
    }
  }

  /**
   * Verify password against stored hash
   */
  async verifyPassword(
    plainPassword: string,
    hashedPassword: string
  ): Promise<boolean> {
    try {
      const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
      return isMatch;
    } catch (error) {
      console.error('Error verifying password:', error);
      throw new Error('Failed to verify password');
    }
  }

  /**
   * Create new user in profiles table
   */
  async createUser(data: CreateUserDTO): Promise<User> {
    const supabase = getSupabaseClient();

    try {
      // Hash the password
      const passwordHash = await this.hashPassword(data.password);

      // Generate referral code
      const referralCode = this.generateReferralCode();

      // Insert user into profiles table
      const { data: user, error } = await supabase
        .from('profiles')
        .insert({
          email: data.email,
          password_hash: passwordHash,
          first_name: data.firstName,
          last_name: data.lastName,
          role: data.role || 'student',
          referral_code: referralCode,
          is_email_verified: false,
          is_trial: data.role === 'student' ? true : false,
          trial_completed: false,
        })
        .select()
        .single();

      if (error) {
        // Check for unique constraint violation (duplicate email)
        if (error.code === '23505') {
          throw new Error('EMAIL_EXISTS');
        }
        throw error;
      }

      if (!user) {
        throw new Error('Failed to create user');
      }

      return user as User;
    } catch (error) {
      if (error instanceof Error && error.message === 'EMAIL_EXISTS') {
        throw error;
      }
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  /**
   * Generate a unique referral code
   */
  private generateReferralCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }

  /**
   * Find user by email
   */
  async findUserByEmail(email: string): Promise<User | null> {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        // PGRST116 is "not found" error
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as User;
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Find user by ID
   */
  async findUserById(id: string): Promise<User | null> {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        // PGRST116 is "not found" error
        if (error.code === 'PGRST116') {
          return null;
        }
        throw error;
      }

      return data as User;
    } catch (error) {
      console.error('Error finding user by ID:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Update user profile
   */
  async updateUser(
    id: string,
    updates: Partial<Omit<User, 'id' | 'created_at'>>
  ): Promise<User> {
    const supabase = getSupabaseClient();

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('User not found');
      }

      return data as User;
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Failed to update user');
    }
  }

  /**
   * Convert database user to user profile (remove sensitive data)
   */
  toUserProfile(user: User): UserProfile {
    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      role: user.role,
      isEmailVerified: user.is_email_verified,
      isTrial: user.is_trial,
      trialCompleted: user.trial_completed,
    };
  }
}

// Export singleton instance
export const userService = new UserService();
