# Deployment Scripts

This directory contains scripts for local development, production deployment, maintenance, and monitoring.

## Available Scripts

### Local Development Scripts

#### deploy-local.sh / deploy-local.bat

Automates local development setup.

**Usage:**
```bash
# Linux/Mac
./deploy-local.sh

# Windows
deploy-local.bat
```

**What it does:**
1. Checks Node.js and npm installation
2. Installs frontend dependencies
3. Installs backend dependencies
4. Configures environment files
5. Builds backend
6. Runs database migrations

#### start-local.sh / start-local.bat

Starts both frontend and backend development servers.

**Usage:**
```bash
# Linux/Mac
./start-local.sh

# Windows
start-local.bat
```

**What it does:**
1. Validates environment setup
2. Starts backend server (http://localhost:3000)
3. Starts frontend server (http://localhost:5173)
4. Handles graceful shutdown on Ctrl+C

#### prepare-offline-package.sh

Creates a complete offline deployment package.

**Usage:**
```bash
./prepare-offline-package.sh
```

**What it does:**
1. Installs all dependencies
2. Packages source code
3. Creates compressed node_modules archives
4. Generates installation scripts
5. Creates final .tar.gz package

**Output:**
- `offline-packages/saudi-english-club-offline-YYYYMMDD.tar.gz`

### Production Scripts

### 1. deploy-production.sh

Automates the complete production deployment process.

**Usage:**
```bash
./deploy-production.sh [--skip-backup] [--skip-tests]
```

**Options:**
- `--skip-backup`: Skip database backup before deployment
- `--skip-tests`: Skip running tests before deployment

**What it does:**
1. Validates environment configuration
2. Creates database backup
3. Pulls latest code from repository
4. Installs dependencies
5. Runs tests
6. Builds application
7. Runs database migrations
8. Reloads backend with PM2 (zero-downtime)
9. Builds and deploys frontend
10. Reloads Nginx
11. Runs health checks

**Example:**
```bash
# Full deployment with all checks
./deploy-production.sh

# Quick deployment (skip backup and tests)
./deploy-production.sh --skip-backup --skip-tests
```

### 2. init-ssl.sh

Obtains and configures SSL certificates from Let's Encrypt.

**Usage:**
```bash
sudo ./init-ssl.sh <domain> <email> [staging]
```

**Parameters:**
- `domain`: Your domain name (e.g., saudienglishclub.com)
- `email`: Email for Let's Encrypt notifications
- `staging`: Set to 1 to use staging server for testing (optional)

**What it does:**
1. Installs Certbot if not present
2. Obtains SSL certificate from Let's Encrypt
3. Configures Nginx for HTTPS
4. Sets up automatic certificate renewal
5. Tests HTTPS connection

**Example:**
```bash
# Production certificate
sudo ./init-ssl.sh saudienglishclub.com admin@saudienglishclub.com

# Test with staging server first
sudo ./init-ssl.sh saudienglishclub.com admin@saudienglishclub.com 1
```

## Backend Scripts

Located in `auth-backend/scripts/`

### 3. backup-database.sh

Creates automated backups of the PostgreSQL database.

**Usage:**
```bash
./backup-database.sh [--s3]
```

**Options:**
- `--s3`: Upload backup to AWS S3 after creation

**Configuration:**
Edit environment variables in `.env.production`:
- `DB_BACKUP_DIR`: Backup directory (default: /var/backups/saudi-english-club)
- `DB_BACKUP_RETENTION_DAYS`: Days to keep backups (default: 30)
- `DB_BACKUP_STORAGE`: Storage type (local or s3)
- `AWS_S3_BACKUP_BUCKET`: S3 bucket name (if using S3)

**Setup Cron Job:**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * /var/www/saudi-english-club/auth-backend/scripts/backup-database.sh >> /var/log/db-backup.log 2>&1
```

**Example:**
```bash
# Local backup
./backup-database.sh

# Backup and upload to S3
./backup-database.sh --s3
```

### 4. test-smtp.ts

Tests SMTP configuration by sending a test email.

**Usage:**
```bash
npm run test:smtp <recipient-email>
```

**What it does:**
1. Loads SMTP configuration from environment
2. Tests SMTP connection
3. Sends test email to specified recipient
4. Verifies delivery

**Example:**
```bash
cd auth-backend
npm run test:smtp admin@saudienglishclub.com
```

### 5. health-check.ts

Performs comprehensive health checks on the production system.

**Usage:**
```bash
npm run health-check
```

**What it checks:**
1. Backend API health
2. Database connectivity
3. SMTP configuration
4. SSL certificate validity
5. Disk space usage
6. Memory usage

**Example:**
```bash
cd auth-backend
npm run health-check
```

**Exit Codes:**
- `0`: All checks passed
- `1`: One or more checks failed

### 6. run-migration.ts

Runs database migrations.

**Usage:**
```bash
npm run migrate
```

**What it does:**
1. Connects to Supabase database
2. Runs all pending migrations
3. Updates migration history

**Example:**
```bash
cd auth-backend
npm run migrate
```

## Setup Instructions

### 1. Make Scripts Executable

```bash
chmod +x scripts/*.sh
chmod +x auth-backend/scripts/*.sh
```

### 2. Configure Environment

Ensure all environment variables are set in:
- `auth-backend/.env.production`
- `.env.production`

### 3. Install Dependencies

```bash
# Backend
cd auth-backend
npm ci --production

# Frontend
cd ..
npm ci --production
```

### 4. Test Scripts

Before using in production, test each script:

```bash
# Test SMTP
cd auth-backend
npm run test:smtp your-email@example.com

# Test health checks
npm run health-check

# Test backup (dry run)
./scripts/backup-database.sh
```

## Automation

### Cron Jobs

Set up automated tasks:

```bash
# Edit crontab
crontab -e

# Add these lines:

# Daily database backup at 2 AM
0 2 * * * /var/www/saudi-english-club/auth-backend/scripts/backup-database.sh >> /var/log/db-backup.log 2>&1

# Daily health check at 6 AM
0 6 * * * cd /var/www/saudi-english-club/auth-backend && npm run health-check >> /var/log/health-check.log 2>&1

# Weekly SSL certificate renewal check (Sundays at 3 AM)
0 3 * * 0 certbot renew --quiet >> /var/log/certbot-renew.log 2>&1
```

### PM2 Process Management

```bash
# Start application
pm2 start auth-backend/ecosystem.config.js --env production

# Save PM2 configuration
pm2 save

# Configure PM2 to start on boot
pm2 startup

# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart saudi-english-club-api

# Reload application (zero-downtime)
pm2 reload saudi-english-club-api
```

## Troubleshooting

### Script Fails with Permission Error

```bash
# Make script executable
chmod +x script-name.sh

# Run with sudo if needed
sudo ./script-name.sh
```

### Database Backup Fails

```bash
# Check database connection
psql $DATABASE_URL -c "SELECT 1"

# Check disk space
df -h

# Check backup directory permissions
ls -la /var/backups/saudi-english-club
```

### SMTP Test Fails

```bash
# Verify SMTP credentials
echo $SMTP_USER
echo $SMTP_HOST

# Test SMTP connection manually
telnet smtp.gmail.com 587

# Check firewall
sudo ufw status
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Check Nginx configuration
sudo nginx -t

# View Certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

## Best Practices

1. **Always test scripts in staging first** before running in production
2. **Create backups** before running deployment scripts
3. **Monitor logs** after running scripts
4. **Use --dry-run** flags when available for testing
5. **Keep scripts updated** with latest configurations
6. **Document any custom modifications** to scripts
7. **Set up alerts** for script failures
8. **Review cron job logs** regularly

## Security Notes

- Never commit `.env` files to version control
- Use strong passwords for all services
- Restrict script execution to authorized users only
- Regularly update SSL certificates
- Monitor backup integrity
- Keep scripts and dependencies updated
- Use secure connections (HTTPS, SSH) for all operations

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review logs in `/var/log/`
3. Consult `DEPLOYMENT_GUIDE.md`
4. Contact system administrator

---

**Last Updated**: 2024
**Version**: 1.0.0
