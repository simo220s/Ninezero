// Core User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  referralCode: string;
  role: 'student' | 'teacher';
}

export interface Student {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone?: string;
  age: number;
  level: string;
  isTrial: boolean;
  trialExpiresAt?: Date;
}

export interface ClassCredits {
  id: string;
  userId: string;
  credits: number;
  updatedAt: Date;
}

// Referral System Types
export interface Referral {
  id: string;
  referrerUserId: string;
  referredUserId: string;
  referralCode: string;
  status: 'pending' | 'completed';
  creditsAwarded: number;
  createdAt: Date;
}

export interface ReferralStats {
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalCreditsEarned: number;
  referralCode: string;
  shareableLink: string;
}

// Booking System Types
export interface ClassSession {
  id: string;
  userId: string;
  studentName: string;
  appointmentType: 'trial' | 'regular';
  status: 'scheduled' | 'completed' | 'cancelled';
  appointmentDate: Date;
  duration: number;
  notes?: string;
}
