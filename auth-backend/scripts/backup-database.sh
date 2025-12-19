#!/bin/bash

# ============================================
# Database Backup Script
# ============================================
# This script creates automated backups of the Supabase PostgreSQL database
# and optionally uploads them to AWS S3 for off-site storage
#
# Usage:
#   ./backup-database.sh [--s3]
#
# Options:
#   --s3    Upload backup to AWS S3 after creation
#
# Setup:
#   1. Make executable: chmod +x backup-database.sh
#   2. Configure environment variables below
#   3. Setup cron job: crontab -e
#      Add: 0 2 * * * /path/to/backup-database.sh >> /var/log/db-backup.log 2>&1
# ============================================

set -e  # Exit on error
set -u  # Exit on undefined variable

# ============================================
# Configuration
# ============================================

# Load environment variables
if [ -f "$(dirname "$0")/../.env.production" ]; then
    source "$(dirname "$0")/../.env.production"
fi

# Backup directory
BACKUP_DIR="${DB_BACKUP_DIR:-/var/backups/saudi-english-club}"

# Retention period (days)
RETENTION_DAYS="${DB_BACKUP_RETENTION_DAYS:-30}"

# S3 configuration
S3_ENABLED="${DB_BACKUP_STORAGE:-local}"
S3_BUCKET="${AWS_S3_BACKUP_BUCKET:-saudi-english-club-backups}"
S3_REGION="${AWS_REGION:-us-east-1}"

# Database connection (from Supabase)
# Format: postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
DATABASE_URL="${SUPABASE_URL}"

# Timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE=$(date +%Y-%m-%d)

# Backup filename
BACKUP_FILE="backup_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# ============================================
# Functions
# ============================================

log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" >&2
}

# ============================================
# Pre-flight Checks
# ============================================

log "Starting database backup..."

# Check if pg_dump is installed
if ! command -v pg_dump &> /dev/null; then
    error "pg_dump is not installed. Install PostgreSQL client tools."
    exit 1
fi

# Check if DATABASE_URL is set
if [ -z "${DATABASE_URL:-}" ]; then
    error "DATABASE_URL is not set. Please configure Supabase connection string."
    exit 1
fi

# Create backup directory if it doesn't exist
if [ ! -d "$BACKUP_DIR" ]; then
    log "Creating backup directory: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# ============================================
# Create Backup
# ============================================

log "Creating backup: $BACKUP_FILE"

# Perform backup with compression
if pg_dump "$DATABASE_URL" | gzip > "$BACKUP_PATH"; then
    BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
    log "Backup created successfully: $BACKUP_PATH (${BACKUP_SIZE})"
else
    error "Backup failed"
    exit 1
fi

# ============================================
# Upload to S3 (Optional)
# ============================================

if [ "$S3_ENABLED" = "s3" ] || [ "$1" = "--s3" ] 2>/dev/null; then
    log "Uploading backup to S3..."
    
    # Check if AWS CLI is installed
    if ! command -v aws &> /dev/null; then
        error "AWS CLI is not installed. Skipping S3 upload."
    else
        # Upload to S3
        S3_PATH="s3://${S3_BUCKET}/database/${DATE}/${BACKUP_FILE}"
        
        if aws s3 cp "$BACKUP_PATH" "$S3_PATH" --region "$S3_REGION"; then
            log "Backup uploaded to S3: $S3_PATH"
        else
            error "Failed to upload backup to S3"
        fi
    fi
fi

# ============================================
# Cleanup Old Backups
# ============================================

log "Cleaning up old backups (older than ${RETENTION_DAYS} days)..."

# Find and delete old backups
DELETED_COUNT=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete -print | wc -l)

if [ "$DELETED_COUNT" -gt 0 ]; then
    log "Deleted $DELETED_COUNT old backup(s)"
else
    log "No old backups to delete"
fi

# ============================================
# Summary
# ============================================

TOTAL_BACKUPS=$(find "$BACKUP_DIR" -name "backup_*.sql.gz" | wc -l)
TOTAL_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)

log "Backup completed successfully"
log "Total backups: $TOTAL_BACKUPS"
log "Total size: $TOTAL_SIZE"

# ============================================
# Health Check (Optional)
# ============================================

# Send notification on failure (implement your notification method)
# Example: curl -X POST https://your-monitoring-service.com/webhook \
#          -d "status=success&backup=$BACKUP_FILE"

exit 0
