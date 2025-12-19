/**
 * Script to get all regular student emails
 * Run this with: npx tsx scripts/get-regular-students.ts
 */

import { supabase } from '../src/lib/supabase'

async function getRegularStudents() {
  console.log('🔍 Fetching regular students...\n')

  try {
    // Query profiles where is_trial is false or null (regular students)
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, is_trial, role, created_at')
      .eq('role', 'student')
      .or('is_trial.is.null,is_trial.eq.false')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching regular students:', error)
      return
    }

    if (!profiles || profiles.length === 0) {
      console.log('📭 No regular students found.')
      return
    }

    console.log(`✅ Found ${profiles.length} regular student(s):\n`)
    console.log('=' .repeat(80))
    
    profiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. ${profile.first_name || ''} ${profile.last_name || ''}`)
      console.log(`   📧 Email: ${profile.email}`)
      console.log(`   🆔 ID: ${profile.id}`)
      console.log(`   📅 Joined: ${new Date(profile.created_at).toLocaleDateString()}`)
      console.log(`   🎓 Type: ${profile.is_trial === false ? 'Regular (Confirmed)' : 'Regular (Default)'}`)
    })

    console.log('\n' + '='.repeat(80))
    console.log('\n📋 Email List (copy-paste ready):')
    console.log(profiles.map(p => p.email).join(', '))
    
    console.log('\n📋 Email List (one per line):')
    profiles.forEach(p => console.log(p.email))

  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

// Also get trial students for comparison
async function getTrialStudents() {
  console.log('\n\n🔍 Fetching trial students for comparison...\n')

  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, is_trial, role, created_at')
      .eq('role', 'student')
      .eq('is_trial', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching trial students:', error)
      return
    }

    if (!profiles || profiles.length === 0) {
      console.log('📭 No trial students found.')
      return
    }

    console.log(`✅ Found ${profiles.length} trial student(s):\n`)
    console.log('=' .repeat(80))
    
    profiles.forEach((profile, index) => {
      console.log(`\n${index + 1}. ${profile.first_name || ''} ${profile.last_name || ''}`)
      console.log(`   📧 Email: ${profile.email}`)
      console.log(`   🆔 ID: ${profile.id}`)
      console.log(`   📅 Joined: ${new Date(profile.created_at).toLocaleDateString()}`)
    })

    console.log('\n' + '='.repeat(80))
  } catch (err) {
    console.error('❌ Unexpected error:', err)
  }
}

// Run both queries
async function main() {
  console.log('🚀 Starting student type analysis...\n')
  await getRegularStudents()
  await getTrialStudents()
  console.log('\n✨ Done!\n')
}

main()
