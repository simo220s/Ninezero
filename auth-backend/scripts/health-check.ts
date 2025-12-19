/**
 * Production Health Check Script
 * 
 * This script performs comprehensive health checks on the production system:
 * 1. Backend API health
 * 2. Database connectivity
 * 3. SMTP configuration
 * 4. SSL certificate validity
 * 5. Disk space
 * 6. Memory usage
 * 
 * Usage:
 *   npm run health-check
 *   or
 *   ts-node scripts/health-check.ts
 */

import dotenv from 'dotenv';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';
import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env';

dotenv.config({ path: path.join(__dirname, '..', envFile) });

interface HealthCheckResult {
  name: string;
  status: 'pass' | 'fail' | 'warn';
  message: string;
  details?: any;
}

const results: HealthCheckResult[] = [];

/**
 * Check Backend API Health
 */
const checkBackendHealth = async (): Promise<HealthCheckResult> => {
  const apiUrl = process.env.API_URL || 'http://localhost:3000';
  
  try {
    const response = await fetch(`${apiUrl}/health`);
    
    if (response.ok) {
      const data = await response.json();
      return {
        name: 'Backend API',
        status: 'pass',
        message: 'Backend API is healthy',
        details: data,
      };
    } else {
      return {
        name: 'Backend API',
        status: 'fail',
        message: `Backend API returned status ${response.status}`,
      };
    }
  } catch (error) {
    return {
      name: 'Backend API',
      status: 'fail',
      message: 'Failed to connect to backend API',
      details: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Check Database Connectivity
 */
const checkDatabase = async (): Promise<HealthCheckResult> => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return {
        name: 'Database',
        status: 'fail',
        message: 'Supabase credentials not configured',
      };
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test query
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      return {
        name: 'Database',
        status: 'fail',
        message: 'Database query failed',
        details: error.message,
      };
    }
    
    return {
      name: 'Database',
      status: 'pass',
      message: 'Database connection successful',
    };
  } catch (error) {
    return {
      name: 'Database',
      status: 'fail',
      message: 'Failed to connect to database',
      details: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Check SMTP Configuration
 */
const checkSMTP = async (): Promise<HealthCheckResult> => {
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPassword = process.env.SMTP_PASSWORD;
    
    if (!smtpHost || !smtpUser || !smtpPassword) {
      return {
        name: 'SMTP',
        status: 'warn',
        message: 'SMTP credentials not configured',
      };
    }
    
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
    });
    
    await transporter.verify();
    
    return {
      name: 'SMTP',
      status: 'pass',
      message: 'SMTP connection successful',
      details: { host: smtpHost, user: smtpUser },
    };
  } catch (error) {
    return {
      name: 'SMTP',
      status: 'fail',
      message: 'SMTP connection failed',
      details: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Check SSL Certificate
 */
const checkSSL = async (): Promise<HealthCheckResult> => {
  const domain = process.env.API_URL?.replace('https://', '').replace('http://', '');
  
  if (!domain || domain.includes('localhost')) {
    return {
      name: 'SSL Certificate',
      status: 'warn',
      message: 'SSL check skipped (localhost or not configured)',
    };
  }
  
  return new Promise((resolve) => {
    const options = {
      host: domain,
      port: 443,
      method: 'GET',
      rejectUnauthorized: true,
    };
    
    const req = https.request(options, (res) => {
      const cert = res.socket.getPeerCertificate();
      
      if (!cert || Object.keys(cert).length === 0) {
        resolve({
          name: 'SSL Certificate',
          status: 'fail',
          message: 'No SSL certificate found',
        });
        return;
      }
      
      const validTo = new Date(cert.valid_to);
      const daysUntilExpiry = Math.floor((validTo.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry < 0) {
        resolve({
          name: 'SSL Certificate',
          status: 'fail',
          message: 'SSL certificate has expired',
          details: { validTo: cert.valid_to },
        });
      } else if (daysUntilExpiry < 30) {
        resolve({
          name: 'SSL Certificate',
          status: 'warn',
          message: `SSL certificate expires in ${daysUntilExpiry} days`,
          details: { validTo: cert.valid_to, daysUntilExpiry },
        });
      } else {
        resolve({
          name: 'SSL Certificate',
          status: 'pass',
          message: `SSL certificate valid (expires in ${daysUntilExpiry} days)`,
          details: { validTo: cert.valid_to, daysUntilExpiry },
        });
      }
    });
    
    req.on('error', (error) => {
      resolve({
        name: 'SSL Certificate',
        status: 'fail',
        message: 'Failed to check SSL certificate',
        details: error.message,
      });
    });
    
    req.end();
  });
};

/**
 * Check Disk Space
 */
const checkDiskSpace = async (): Promise<HealthCheckResult> => {
  try {
    const { stdout } = await execAsync('df -h / | tail -1');
    const parts = stdout.trim().split(/\s+/);
    const usedPercent = parseInt(parts[4].replace('%', ''), 10);
    
    if (usedPercent >= 90) {
      return {
        name: 'Disk Space',
        status: 'fail',
        message: `Disk usage critical: ${usedPercent}%`,
        details: { usage: `${usedPercent}%` },
      };
    } else if (usedPercent >= 80) {
      return {
        name: 'Disk Space',
        status: 'warn',
        message: `Disk usage high: ${usedPercent}%`,
        details: { usage: `${usedPercent}%` },
      };
    } else {
      return {
        name: 'Disk Space',
        status: 'pass',
        message: `Disk usage normal: ${usedPercent}%`,
        details: { usage: `${usedPercent}%` },
      };
    }
  } catch (error) {
    return {
      name: 'Disk Space',
      status: 'warn',
      message: 'Failed to check disk space',
      details: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Check Memory Usage
 */
const checkMemory = async (): Promise<HealthCheckResult> => {
  try {
    const { stdout } = await execAsync('free -m | grep Mem');
    const parts = stdout.trim().split(/\s+/);
    const total = parseInt(parts[1], 10);
    const used = parseInt(parts[2], 10);
    const usedPercent = Math.floor((used / total) * 100);
    
    if (usedPercent >= 90) {
      return {
        name: 'Memory',
        status: 'fail',
        message: `Memory usage critical: ${usedPercent}%`,
        details: { usage: `${usedPercent}%`, used: `${used}MB`, total: `${total}MB` },
      };
    } else if (usedPercent >= 80) {
      return {
        name: 'Memory',
        status: 'warn',
        message: `Memory usage high: ${usedPercent}%`,
        details: { usage: `${usedPercent}%`, used: `${used}MB`, total: `${total}MB` },
      };
    } else {
      return {
        name: 'Memory',
        status: 'pass',
        message: `Memory usage normal: ${usedPercent}%`,
        details: { usage: `${usedPercent}%`, used: `${used}MB`, total: `${total}MB` },
      };
    }
  } catch (error) {
    return {
      name: 'Memory',
      status: 'warn',
      message: 'Failed to check memory usage',
      details: error instanceof Error ? error.message : String(error),
    };
  }
};

/**
 * Print results
 */
const printResults = (results: HealthCheckResult[]) => {
  console.log('\n' + '='.repeat(60));
  console.log('Production Health Check Results');
  console.log('Saudi English Club LMS');
  console.log('='.repeat(60) + '\n');
  
  results.forEach((result) => {
    const icon = result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌';
    console.log(`${icon} ${result.name}: ${result.message}`);
    
    if (result.details) {
      console.log(`   Details: ${JSON.stringify(result.details, null, 2)}`);
    }
    console.log('');
  });
  
  const passCount = results.filter(r => r.status === 'pass').length;
  const warnCount = results.filter(r => r.status === 'warn').length;
  const failCount = results.filter(r => r.status === 'fail').length;
  
  console.log('='.repeat(60));
  console.log(`Summary: ${passCount} passed, ${warnCount} warnings, ${failCount} failed`);
  console.log('='.repeat(60) + '\n');
  
  if (failCount > 0) {
    console.log('❌ Health check failed. Please address the issues above.\n');
    process.exit(1);
  } else if (warnCount > 0) {
    console.log('⚠️  Health check passed with warnings. Review the warnings above.\n');
    process.exit(0);
  } else {
    console.log('✅ All health checks passed!\n');
    process.exit(0);
  }
};

/**
 * Main function
 */
const main = async () => {
  console.log('Running health checks...\n');
  
  // Run all checks
  results.push(await checkBackendHealth());
  results.push(await checkDatabase());
  results.push(await checkSMTP());
  results.push(await checkSSL());
  results.push(await checkDiskSpace());
  results.push(await checkMemory());
  
  // Print results
  printResults(results);
};

// Run health checks
main().catch((error) => {
  console.error('\n❌ Unexpected error during health check:');
  console.error(error);
  process.exit(1);
});
