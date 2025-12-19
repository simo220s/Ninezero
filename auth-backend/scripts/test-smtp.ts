/**
 * SMTP Configuration Test Script
 * 
 * This script tests the SMTP configuration by:
 * 1. Verifying SMTP connection
 * 2. Sending a test email
 * 
 * Usage:
 *   npm run test:smtp
 *   or
 *   ts-node scripts/test-smtp.ts
 */

import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import path from 'path';

// Load environment variables
const envFile = process.env.NODE_ENV === 'production' 
  ? '.env.production' 
  : '.env';

dotenv.config({ path: path.join(__dirname, '..', envFile) });

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  password: string;
  fromName: string;
  fromEmail: string;
}

/**
 * Get SMTP configuration from environment
 */
const getSMTPConfig = (): SMTPConfig => {
  const config: SMTPConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    password: process.env.SMTP_PASSWORD || '',
    fromName: process.env.SMTP_FROM_NAME || 'Saudi English Club',
    fromEmail: process.env.SMTP_FROM_EMAIL || 'noreply@saudienglishclub.com',
  };

  return config;
};

/**
 * Test SMTP connection
 */
const testConnection = async (config: SMTPConfig): Promise<boolean> => {
  console.log('\n🔍 Testing SMTP connection...\n');
  console.log('Configuration:');
  console.log(`  Host: ${config.host}`);
  console.log(`  Port: ${config.port}`);
  console.log(`  Secure: ${config.secure}`);
  console.log(`  User: ${config.user}`);
  console.log(`  From: ${config.fromName} <${config.fromEmail}>\n`);

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });

  try {
    await transporter.verify();
    console.log('✅ SMTP connection successful!\n');
    return true;
  } catch (error) {
    console.error('❌ SMTP connection failed:');
    console.error(error);
    return false;
  }
};

/**
 * Send test email
 */
const sendTestEmail = async (config: SMTPConfig, recipient: string): Promise<boolean> => {
  console.log(`📧 Sending test email to ${recipient}...\n`);

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.password,
    },
  });

  const mailOptions = {
    from: `${config.fromName} <${config.fromEmail}>`,
    to: recipient,
    subject: 'SMTP Configuration Test - Saudi English Club',
    text: `This is a test email from Saudi English Club LMS.

If you received this email, your SMTP configuration is working correctly!

Configuration Details:
- SMTP Host: ${config.host}
- SMTP Port: ${config.port}
- Secure: ${config.secure}
- Environment: ${process.env.NODE_ENV || 'development'}

Timestamp: ${new Date().toISOString()}

---
Saudi English Club
https://saudienglishclub.com`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
    .success { background: #22c55e; color: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .details { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; margin-top: 30px; color: #64748b; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ SMTP Test Successful</h1>
    </div>
    <div class="content">
      <div class="success">
        <strong>Congratulations!</strong> Your SMTP configuration is working correctly.
      </div>
      
      <p>This is a test email from Saudi English Club LMS.</p>
      
      <div class="details">
        <h3>Configuration Details:</h3>
        <ul>
          <li><strong>SMTP Host:</strong> ${config.host}</li>
          <li><strong>SMTP Port:</strong> ${config.port}</li>
          <li><strong>Secure:</strong> ${config.secure}</li>
          <li><strong>Environment:</strong> ${process.env.NODE_ENV || 'development'}</li>
          <li><strong>Timestamp:</strong> ${new Date().toISOString()}</li>
        </ul>
      </div>
      
      <p>You can now use this SMTP configuration for sending:</p>
      <ul>
        <li>Class reminder notifications</li>
        <li>Welcome emails</li>
        <li>Password reset emails</li>
        <li>System notifications</li>
      </ul>
      
      <div class="footer">
        <p>Saudi English Club<br>
        <a href="https://saudienglishclub.com">https://saudienglishclub.com</a></p>
      </div>
    </div>
  </div>
</body>
</html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log(`   Message ID: ${info.messageId}`);
    console.log(`   Response: ${info.response}\n`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send test email:');
    console.error(error);
    return false;
  }
};

/**
 * Main test function
 */
const main = async () => {
  console.log('='.repeat(60));
  console.log('SMTP Configuration Test');
  console.log('Saudi English Club LMS');
  console.log('='.repeat(60));

  // Get configuration
  const config = getSMTPConfig();

  // Validate configuration
  if (!config.user || !config.password) {
    console.error('\n❌ Error: SMTP credentials not configured');
    console.error('Please set SMTP_USER and SMTP_PASSWORD in your .env file\n');
    process.exit(1);
  }

  // Test connection
  const connectionSuccess = await testConnection(config);
  
  if (!connectionSuccess) {
    console.error('\n❌ SMTP connection test failed');
    console.error('Please check your SMTP configuration and try again\n');
    process.exit(1);
  }

  // Ask for recipient email
  const recipient = process.argv[2] || config.user;
  
  if (!recipient) {
    console.error('\n❌ Error: No recipient email provided');
    console.error('Usage: npm run test:smtp <recipient-email>\n');
    process.exit(1);
  }

  // Send test email
  const emailSuccess = await sendTestEmail(config, recipient);
  
  if (emailSuccess) {
    console.log('='.repeat(60));
    console.log('✅ All tests passed!');
    console.log('Your SMTP configuration is ready for production.');
    console.log('='.repeat(60));
    process.exit(0);
  } else {
    console.error('\n❌ Email test failed');
    console.error('Please check your SMTP configuration and try again\n');
    process.exit(1);
  }
};

// Run tests
main().catch((error) => {
  console.error('\n❌ Unexpected error:');
  console.error(error);
  process.exit(1);
});
