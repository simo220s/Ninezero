# Documentation Cleanup Script
# Moves obsolete documentation to ARCHIVE folder

Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║           DOCUMENTATION CLEANUP UTILITY                       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Cyan

# Get script directory and project root
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$projectRoot = Split-Path -Parent $scriptDir

# Create archive directory
$archiveDir = Join-Path $projectRoot "ARCHIVE"
$archiveDocsDir = Join-Path $archiveDir "old-documentation"
if (-not (Test-Path $archiveDocsDir)) {
    New-Item -ItemType Directory -Path $archiveDocsDir -Force | Out-Null
    Write-Host "✅ Created archive directory: $archiveDocsDir`n" -ForegroundColor Green
}

# Files to KEEP (Essential Documentation)
$keepFiles = @(
    "README.md",                              # Main project documentation
    "API_DOCUMENTATION.md",                   # API reference
    "ADMIN_USER_GUIDE.md",                    # Admin guide
    "SECURITY.md",                            # Security documentation
    "SECURITY_AUDIT_REPORT.md",               # Security audit
    "QUICK_START.md",                         # Quick start guide
    "QUICK_REFERENCE.md",                     # Quick reference
    "OFFLINE_DEPLOYMENT_QUICK_START.md",      # Offline deployment
    "OFFLINE_DEPLOYMENT_TROUBLESHOOTING.md",  # Troubleshooting
    "DEPLOYMENT_GUIDE.md",                    # Deployment guide
    "PRODUCTION_SETUP_GUIDE.md",              # Production setup
    "PRODUCTION_CHECKLIST.md",                # Production checklist
    "LOCAL_DEPLOYMENT_GUIDE.md",              # Local deployment
    "AUTH_SYSTEM_FIX.md",                     # Auth system documentation
    "AUTH_QUICK_REFERENCE.md",                # Auth quick reference
    "LOGIN_LOADING_FIX.md",                   # Latest fix documentation
    "ARCHITECTURE_DIAGRAM.md",                # Architecture
    "GETTING_STARTED_CHECKLIST.md",           # Getting started
    "TESTING_INSTRUCTIONS.md",                # Testing guide
    "DOCUMENTATION_INDEX.md",                 # Documentation index
    "ENV_SETUP.md"                            # Environment setup
)

# Obsolete files to ARCHIVE (Old fix logs and summaries)
$obsoleteFiles = @(
    "ARROWS_AND_WHATSAPP_FIXES.md",
    "BEFORE_AFTER_COMPARISON.md",
    "BOOKED_CLASSES_DISPLAY_FIX.md",
    "BOOKING_PAGE_HEADER_UPDATE.md",
    "BOOKING_ROUTE_CONNECTED.md",
    "BOTH_ISSUES_FIXED.md",
    "CLASS_VISIBILITY_FIX.md",
    "CLEANUP_SUMMARY.md",
    "CRITICAL_PACKAGES_INSTALLED.md",
    "DASHBOARD_STATUS_SUMMARY.md",
    "DEPLOYMENT_COMPLETE_SUMMARY.md",
    "DEPLOYMENT_STATUS.md",
    "DEPLOYMENT_INDEX.md",
    "ERROR_ANALYSIS_AND_FIXES.md",
    "FAQ_AND_NAVIGATION_FIXES.md",
    "FINAL_FIXES_SUMMARY.md",
    "FINAL_PROJECT_SUMMARY.md",
    "FIXES_APPLIED.md",
    "FIXES_COMPLETE.md",
    "IMPLEMENTATION_SUMMARY.md",
    "LOCAL_DEPLOYMENT_COMPLETE.md",
    "LOCAL_DEPLOYMENT_SUMMARY.md",
    "MOBILE_MENU_BUTTON_FIX.md",
    "OPEN_WEBSITE_NOW.md",
    "PRODUCTION_CONFIGURATION_SUMMARY.md",
    "PROJECT_COMPLETE.md",
    "REGISTRATION_FIX_CHECKLIST.md",
    "REGISTRATION_FIX_SUMMARY.md",
    "RTL_PROVIDER_FIX.md",
    "SAUDI_RIYAL_SYMBOL_ADDED.md",
    "SIGNUP_ISSUE_FIXED.md",
    "SIGNUP_FIX.md",
    "START_HERE.md",
    "START_HERE_OFFLINE.md",
    "START_HERE_REGISTRATION_FIX.md",
    "STUDENT_DASHBOARD_SEPARATION.md",
    "SUPABASE_SETUP_REPORT.md",
    "TRIAL_BOOKING_PAGE_REDESIGN.md",
    "TRIAL_CONVERSION.md",
    "TRIAL_CONVERSION_FIX.md",
    "TRIAL_DASHBOARD_ENHANCEMENT.md",
    "UI_UX_ENHANCEMENTS.md",
    "URGENT_FIX_APPLIED.md",
    "WHITE_SCREEN_FIX.md",
    "YOUR_WEBSITE_IS_LIVE.md",
    "PLATFORM_STACK_ANALYSIS.md",
    "AUTH_FIX_SUMMARY.md",
    "TESTING_AND_DEPLOYMENT.md",
    "REALTIME_FEATURES.md",
    "LARAVEL_INTEGRATION_GUIDE.md",
    "OFFLINE_DEMO_INSTRUCTIONS.md",
    "OFFLINE_FILES_INDEX.md",
    "QUICK_TEST_GUIDE.md"
)

# Other files to remove (demos, old scripts)
$removeOtherFiles = @(
    "demo-offline.html",
    "white-screen-diagnostic.html",
    "offline-deployment-guide.html",
    "add-logger-imports.ps1",
    "fix-student-dashboard.sql",
    "fix-trial-conversion.sql",
    "DEPLOY_OFFLINE.bat",
    "START_WEBSITE.bat"
)

Write-Host "📊 CLEANUP SUMMARY:" -ForegroundColor Yellow
Write-Host "   Files to keep: $($keepFiles.Count)" -ForegroundColor Green
Write-Host "   Files to archive: $($obsoleteFiles.Count)" -ForegroundColor Cyan
Write-Host "   Other files to remove: $($removeOtherFiles.Count)" -ForegroundColor Magenta
Write-Host ""

# Count existing files
$movedCount = 0
$removedCount = 0
$notFoundCount = 0

# Archive obsolete documentation
Write-Host "`n📦 Archiving obsolete documentation..." -ForegroundColor Cyan
foreach ($file in $obsoleteFiles) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        $destPath = Join-Path $archiveDocsDir $file
        Move-Item -Path $filePath -Destination $destPath -Force
        Write-Host "   ✓ Archived: $file" -ForegroundColor Gray
        $movedCount++
    } else {
        $notFoundCount++
    }
}

# Remove other unnecessary files
Write-Host "`n🗑️  Removing other unnecessary files..." -ForegroundColor Magenta
foreach ($file in $removeOtherFiles) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        Remove-Item -Path $filePath -Force
        Write-Host "   ✓ Removed: $file" -ForegroundColor Gray
        $removedCount++
    }
}

# Display final summary
Write-Host "`n╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                    CLEANUP COMPLETE ✅                        ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝`n" -ForegroundColor Green

Write-Host "📊 Results:" -ForegroundColor Cyan
Write-Host "   ✓ Files archived: $movedCount" -ForegroundColor Green
Write-Host "   ✓ Files removed: $removedCount" -ForegroundColor Green
Write-Host "   ℹ Files not found: $notFoundCount" -ForegroundColor Yellow
Write-Host ""
Write-Host "📁 Archived files location:" -ForegroundColor Cyan
Write-Host "   $archiveDocsDir" -ForegroundColor White
Write-Host ""

# List remaining essential documentation
Write-Host "📚 Essential Documentation (Kept):" -ForegroundColor Green
foreach ($file in $keepFiles) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        Write-Host "   ✓ $file" -ForegroundColor White
    }
}

Write-Host "`n✨ Project is now cleaner and more organized!`n" -ForegroundColor Green
