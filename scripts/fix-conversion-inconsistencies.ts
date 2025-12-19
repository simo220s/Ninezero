/**
 * Data Sync Script: Fix Trial-to-Regular Student Conversion Inconsistencies
 * 
 * This script identifies and fixes students where the `students` table shows
 * is_trial=false but the `profiles` table still shows is_trial=true
 * 
 * Usage:
 *   tsx scripts/fix-conversion-inconsistencies.ts
 */

import { createClient } from '@supabase/supabase-js'

// Load environment variables
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing Supabase credentials')
  console.error('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

interface InconsistentStudent {
  student_id: string
  user_id: string
  name: string
  email: string
  student_is_trial: boolean
  profile_is_trial: boolean
  trial_completed: boolean
  converted_at: string | null
}

async function findInconsistentRecords(): Promise<InconsistentStudent[]> {
  console.log('\n🔍 Searching for inconsistent records...\n')
  
  const { data, error } = await supabase
    .from('students')
    .select(`
      id,
      user_id,
      name,
      email,
      is_trial,
      profiles!inner (
        is_trial,
        trial_completed,
        converted_at
      )
    `)
    .neq('is_trial', supabase.from('profiles').select('is_trial'))
  
  if (error) {
    console.error('❌ Error fetching records:', error)
    throw error
  }

  // Manual filtering since Supabase doesn't support cross-table comparisons directly
  const { data: allStudents, error: fetchError } = await supabase
    .from('students')
    .select(`
      id,
      user_id,
      name,
      email,
      is_trial
    `)
    .eq('is_trial', false)
  
  if (fetchError) {
    console.error('❌ Error fetching students:', fetchError)
    throw fetchError
  }

  const inconsistentRecords: InconsistentStudent[] = []

  for (const student of allStudents || []) {
    if (!student.user_id) continue

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_trial, trial_completed, converted_at')
      .eq('id', student.user_id)
      .single()

    if (profileError || !profile) continue

    // Check for inconsistency
    if (profile.is_trial === true) {
      inconsistentRecords.push({
        student_id: student.id,
        user_id: student.user_id,
        name: student.name,
        email: student.email,
        student_is_trial: student.is_trial,
        profile_is_trial: profile.is_trial,
        trial_completed: profile.trial_completed,
        converted_at: profile.converted_at
      })
    }
  }

  return inconsistentRecords
}

async function fixInconsistentRecord(record: InconsistentStudent): Promise<boolean> {
  console.log(`  → Fixing: ${record.email}`)
  console.log(`     User ID: ${record.user_id}`)
  console.log(`     Students table: is_trial=${record.student_is_trial}`)
  console.log(`     Profiles table: is_trial=${record.profile_is_trial}`)
  
  try {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_trial: false,
        trial_completed: true,
        converted_at: new Date().toISOString()
      })
      .eq('id', record.user_id)
    
    if (error) {
      console.error(`     ❌ Failed: ${error.message}`)
      return false
    }
    
    // Verify the fix
    const { data: verifiedProfile, error: verifyError } = await supabase
      .from('profiles')
      .select('is_trial, trial_completed')
      .eq('id', record.user_id)
      .single()
    
    if (verifyError || !verifiedProfile) {
      console.error(`     ❌ Verification failed`)
      return false
    }
    
    if (verifiedProfile.is_trial === false && verifiedProfile.trial_completed === true) {
      console.log(`     ✅ Fixed successfully`)
      return true
    } else {
      console.error(`     ❌ Fix verification failed - data still inconsistent`)
      return false
    }
  } catch (err) {
    console.error(`     ❌ Exception:`, err)
    return false
  }
}

async function main() {
  console.log('╔════════════════════════════════════════════════════════════════╗')
  console.log('║  Trial-to-Regular Conversion Inconsistency Fix                ║')
  console.log('╚════════════════════════════════════════════════════════════════╝')
  
  try {
    // Step 1: Find inconsistent records
    const inconsistentRecords = await findInconsistentRecords()
    
    if (inconsistentRecords.length === 0) {
      console.log('✅ No inconsistent records found! All data is synchronized.')
      return
    }
    
    console.log(`Found ${inconsistentRecords.length} inconsistent record(s):\n`)
    
    // Display all inconsistent records
    inconsistentRecords.forEach((record, index) => {
      console.log(`${index + 1}. ${record.email}`)
      console.log(`   Name: ${record.name}`)
      console.log(`   Student ID: ${record.student_id}`)
      console.log(`   User ID: ${record.user_id}`)
      console.log(`   Students.is_trial: ${record.student_is_trial}`)
      console.log(`   Profiles.is_trial: ${record.profile_is_trial} ❌`)
      console.log(`   Profiles.trial_completed: ${record.trial_completed}`)
      console.log(`   Profiles.converted_at: ${record.converted_at || 'null'}`)
      console.log()
    })
    
    // Step 2: Prompt for confirmation
    console.log('═══════════════════════════════════════════════════════════════')
    console.log(`\n⚠️  About to fix ${inconsistentRecords.length} record(s)`)
    console.log('This will update the profiles table to match the students table.\n')
    
    // For Node.js scripts, we'll auto-proceed (remove this in production)
    console.log('🔧 Starting automatic fix...\n')
    
    // Step 3: Fix each record
    let successCount = 0
    let failCount = 0
    
    for (let i = 0; i < inconsistentRecords.length; i++) {
      const record = inconsistentRecords[i]
      console.log(`\n[${i + 1}/${inconsistentRecords.length}] Processing ${record.email}`)
      
      const success = await fixInconsistentRecord(record)
      if (success) {
        successCount++
      } else {
        failCount++
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    // Step 4: Summary
    console.log('\n═══════════════════════════════════════════════════════════════')
    console.log('🎯 Fix Summary:')
    console.log(`   Total records found: ${inconsistentRecords.length}`)
    console.log(`   Successfully fixed: ${successCount}`)
    console.log(`   Failed: ${failCount}`)
    console.log('═══════════════════════════════════════════════════════════════\n')
    
    if (failCount === 0) {
      console.log('✅ All inconsistencies have been resolved!')
    } else {
      console.log('⚠️  Some records could not be fixed. Please review the errors above.')
    }
    
  } catch (error) {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  }
}

// Run the script
main()
  .then(() => {
    console.log('\n✅ Script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })

