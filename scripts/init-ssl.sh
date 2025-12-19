#!/bin/bash

# ============================================
# SSL Certificate Initialization Script
# ============================================
# This script obtains SSL certificates from Let's Encrypt
# for production deployment
#
# Usage:
#   ./init-ssl.sh <domain> <email>
#
# Example:
#   ./init-ssl.sh saudienglishclub.com admin@saudienglishclub.com
#
# Prerequisites:
#   - Domain DNS configured and pointing to server
#   - Nginx installed
#   - Port 80 accessible from internet
# ============================================

set -e  # Exit on error

# ============================================
# Configuration
# ============================================

DOMAIN=$1
EMAIL=$2
STAGING=${3:-0}  # Use staging by default for testing

# Validate arguments
if [ -z "$DOMAIN" ] || [ -z "$EMAIL" ]; then
    echo "Usage: $0 <domain> <email> [staging]"
    echo ""
    echo "Example:"
    echo "  $0 saudienglishclub.com admin@saudienglishclub.com"
    echo ""
    echo "Options:"
    echo "  staging: Set to 1 to use Let's Encrypt staging server (for testing)"
    exit 1
fi

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

log "Starting SSL certificate initialization for $DOMAIN..."

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    error "This script must be run as root (use sudo)"
    exit 1
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    log "Certbot not found. Installing..."
    apt update
    apt install -y certbot python3-certbot-nginx
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    error "Nginx is not installed. Please install nginx first."
    exit 1
fi

# Check if nginx is running
if ! systemctl is-active --quiet nginx; then
    log "Starting Nginx..."
    systemctl start nginx
fi

# ============================================
# Obtain Certificate
# ============================================

log "Obtaining SSL certificate from Let's Encrypt..."

# Build certbot command
CERTBOT_CMD="certbot --nginx"

# Add domain
CERTBOT_CMD="$CERTBOT_CMD -d $DOMAIN -d www.$DOMAIN"

# Add email
CERTBOT_CMD="$CERTBOT_CMD --email $EMAIL"

# Non-interactive
CERTBOT_CMD="$CERTBOT_CMD --non-interactive --agree-tos"

# Redirect HTTP to HTTPS
CERTBOT_CMD="$CERTBOT_CMD --redirect"

# Use staging server if requested
if [ "$STAGING" = "1" ]; then
    log "Using Let's Encrypt staging server (for testing)"
    CERTBOT_CMD="$CERTBOT_CMD --staging"
fi

# Run certbot
if $CERTBOT_CMD; then
    log "SSL certificate obtained successfully!"
else
    error "Failed to obtain SSL certificate"
    exit 1
fi

# ============================================
# Configure Auto-Renewal
# ============================================

log "Configuring automatic certificate renewal..."

# Test renewal
if certbot renew --dry-run; then
    log "Certificate renewal test successful"
else
    error "Certificate renewal test failed"
    exit 1
fi

# Certbot automatically sets up a systemd timer for renewal
# Verify it's enabled
if systemctl is-enabled certbot.timer &> /dev/null; then
    log "Automatic renewal is configured (certbot.timer)"
else
    log "Enabling certbot.timer for automatic renewal..."
    systemctl enable certbot.timer
    systemctl start certbot.timer
fi

# ============================================
# Verify Certificate
# ============================================

log "Verifying SSL certificate..."

# Check certificate files
CERT_PATH="/etc/letsencrypt/live/$DOMAIN"

if [ -f "$CERT_PATH/fullchain.pem" ] && [ -f "$CERT_PATH/privkey.pem" ]; then
    log "Certificate files found:"
    log "  - $CERT_PATH/fullchain.pem"
    log "  - $CERT_PATH/privkey.pem"
else
    error "Certificate files not found"
    exit 1
fi

# Check certificate expiry
EXPIRY=$(openssl x509 -enddate -noout -in "$CERT_PATH/fullchain.pem" | cut -d= -f2)
log "Certificate expires: $EXPIRY"

# ============================================
# Update Nginx Configuration
# ============================================

log "Updating Nginx configuration..."

# Test nginx configuration
if nginx -t; then
    log "Nginx configuration is valid"
else
    error "Nginx configuration test failed"
    exit 1
fi

# Reload nginx
if systemctl reload nginx; then
    log "Nginx reloaded successfully"
else
    error "Failed to reload Nginx"
    exit 1
fi

# ============================================
# Test HTTPS
# ============================================

log "Testing HTTPS connection..."

# Wait for nginx to reload
sleep 2

# Test HTTPS
if curl -s -o /dev/null -w "%{http_code}" "https://$DOMAIN" | grep -q "200\|301\|302"; then
    log "HTTPS is working!"
else
    error "HTTPS test failed"
    exit 1
fi

# ============================================
# Summary
# ============================================

log "=========================================="
log "✅ SSL certificate setup completed!"
log "=========================================="
log ""
log "Certificate Details:"
log "  Domain: $DOMAIN"
log "  Email: $EMAIL"
log "  Expires: $EXPIRY"
log "  Location: $CERT_PATH"
log ""
log "Next Steps:"
log "  1. Test your site: https://$DOMAIN"
log "  2. Check SSL rating: https://www.ssllabs.com/ssltest/analyze.html?d=$DOMAIN"
log "  3. Monitor renewal: sudo certbot renew --dry-run"
log ""
log "Automatic Renewal:"
log "  Certbot will automatically renew certificates before expiry"
log "  Check status: sudo systemctl status certbot.timer"
log ""
log "=========================================="

exit 0
