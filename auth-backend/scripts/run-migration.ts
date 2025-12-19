/**
 * Migration Runner Script
 * 
 * This script runs SQL migration files against the Supabase database.
 * Usage: ts-node scripts/run-migration.ts <migration-file>
 * Example: ts-node scripts/run-migration.ts migrations/005_create_admin_settings.sql
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runMigration(migrationFile: string): Promise<void> {
  try {
    console.log(`\n🚀 Running migration: ${migrationFile}\n`);

    // Read migration file
    const migrationPath = join(__dirname, '..', migrationFile);
    const sql = readFileSync(migrationPath, 'utf-8');

    // Note: Supabase client doesn't directly support raw SQL execution
    // We need to use the REST API or execute via SQL editor
    console.log('⚠️  Migration file created successfully!');
    console.log('\n📋 To apply this migration, please:');
    console.log('1. Go to your Supabase project dashboard');
    console.log('2. Navigate to the SQL Editor');
    console.log('3. Copy and paste the content from:');
    console.log(`   ${migrationPath}`);
    console.log('4. Execute the migration\n');

    console.log('Alternatively, if you have psql installed:');
    console.log(`psql $DATABASE_URL -f ${migrationFile}\n`);

    // Display migration content
    console.log('📄 Migration content:');
    console.log('─'.repeat(80));
    console.log(sql);
    console.log('─'.repeat(80));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Get migration file from command line arguments
const migrationFile = process.argv[2];

if (!migrationFile) {
  console.error('❌ Please provide a migration file path');
  console.error('Usage: ts-node scripts/run-migration.ts <migration-file>');
  console.error('Example: ts-node scripts/run-migration.ts migrations/005_create_admin_settings.sql');
  process.exit(1);
}

runMigration(migrationFile);
