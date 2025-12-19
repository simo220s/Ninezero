/**
 * Script to check and fix student conversion data inconsistencies
 * Run this with: npx tsx scripts/sync-conversion-data.ts
 */

import { checkConversionConsistency, fixAllConversionInconsistencies } from '../src/lib/sync-student-conversion'

async function main() {
  console.log('🔍 Checking for conversion inconsistencies...\n')

  try {
    // First, check for inconsistencies
    const statuses = await checkConversionConsistency()
    const inconsistencies = statuses.filter(s => !s.isConsistent)

    if (inconsistencies.length === 0) {
      console.log('✅ All conversion data is consistent! No action needed.\n')
      return
    }

    console.log(`\n⚠️  Found ${inconsistencies.length} inconsistencies:\n`)
    inconsistencies.forEach((inc, index) => {
      console.log(`${index + 1}. ${inc.email}`)
      console.log(`   Students table: is_trial = ${inc.studentsIsTrialStatus}`)
      console.log(`   Profiles table: is_trial = ${inc.profilesIsTrialStatus}`)
      console.log('')
    })

    // Ask for confirmation (in a real scenario, you'd use readline or similar)
    console.log('🔧 Attempting to fix inconsistencies...\n')

    // Fix all inconsistencies
    const result = await fixAllConversionInconsistencies()

    console.log('\n📊 Summary:')
    console.log(`   ✅ Fixed: ${result.fixed}`)
    console.log(`   ❌ Failed: ${result.failed}`)

    if (result.errors.length > 0) {
      console.log('\n❌ Errors:')
      result.errors.forEach((err, index) => {
        console.log(`   ${index + 1}. ${err.email}:`, err.error)
      })
    }

    console.log('\n✨ Done!\n')
  } catch (error) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  }
}

main()
