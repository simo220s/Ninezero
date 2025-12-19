# Documentation Cleanup Script
# Moves obsolete documentation to ARCHIVE folder

Write-Host "`n=== DOCUMENTATION CLEANUP UTILITY ===" -ForegroundColor Cyan

$projectRoot = "c:\Users\Administrator\Downloads\My Code"
$archiveDir = Join-Path $projectRoot "ARCHIVE"
$archiveDocsDir = Join-Path $archiveDir "old-documentation"

if (-not (Test-Path $archiveDocsDir)) {
    New-Item -ItemType Directory -Path $archiveDocsDir -Force | Out-Null
    Write-Host "Created archive directory: $archiveDocsDir" -ForegroundColor Green
}

# Obsolete files to ARCHIVE
$obsoleteFiles = @(
    "ARROWS_AND_WHATSAPP_FIXES.md", "BEFORE_AFTER_COMPARISON.md", "BOOKED_CLASSES_DISPLAY_FIX.md",
    "BOOKING_PAGE_HEADER_UPDATE.md", "BOOKING_ROUTE_CONNECTED.md", "BOTH_ISSUES_FIXED.md",
    "CLASS_VISIBILITY_FIX.md", "CLEANUP_SUMMARY.md", "CRITICAL_PACKAGES_INSTALLED.md",
    "DASHBOARD_STATUS_SUMMARY.md", "DEPLOYMENT_COMPLETE_SUMMARY.md", "DEPLOYMENT_STATUS.md",
    "DEPLOYMENT_INDEX.md", "ERROR_ANALYSIS_AND_FIXES.md", "FAQ_AND_NAVIGATION_FIXES.md",
    "FINAL_FIXES_SUMMARY.md", "FINAL_PROJECT_SUMMARY.md", "FIXES_APPLIED.md", "FIXES_COMPLETE.md",
    "IMPLEMENTATION_SUMMARY.md", "LOCAL_DEPLOYMENT_COMPLETE.md", "LOCAL_DEPLOYMENT_SUMMARY.md",
    "MOBILE_MENU_BUTTON_FIX.md", "OPEN_WEBSITE_NOW.md", "PRODUCTION_CONFIGURATION_SUMMARY.md",
    "PROJECT_COMPLETE.md", "REGISTRATION_FIX_CHECKLIST.md", "REGISTRATION_FIX_SUMMARY.md",
    "RTL_PROVIDER_FIX.md", "SAUDI_RIYAL_SYMBOL_ADDED.md", "SIGNUP_ISSUE_FIXED.md", "SIGNUP_FIX.md",
    "START_HERE.md", "START_HERE_OFFLINE.md", "START_HERE_REGISTRATION_FIX.md",
    "STUDENT_DASHBOARD_SEPARATION.md", "SUPABASE_SETUP_REPORT.md", "TRIAL_BOOKING_PAGE_REDESIGN.md",
    "TRIAL_CONVERSION.md", "TRIAL_CONVERSION_FIX.md", "TRIAL_DASHBOARD_ENHANCEMENT.md",
    "UI_UX_ENHANCEMENTS.md", "URGENT_FIX_APPLIED.md", "WHITE_SCREEN_FIX.md",
    "YOUR_WEBSITE_IS_LIVE.md", "PLATFORM_STACK_ANALYSIS.md", "AUTH_FIX_SUMMARY.md",
    "TESTING_AND_DEPLOYMENT.md", "REALTIME_FEATURES.md", "LARAVEL_INTEGRATION_GUIDE.md",
    "OFFLINE_DEMO_INSTRUCTIONS.md", "OFFLINE_FILES_INDEX.md", "QUICK_TEST_GUIDE.md"
)

$removeOtherFiles = @(
    "demo-offline.html", "white-screen-diagnostic.html", "offline-deployment-guide.html",
    "add-logger-imports.ps1", "fix-student-dashboard.sql", "fix-trial-conversion.sql",
    "DEPLOY_OFFLINE.bat", "START_WEBSITE.bat"
)

$movedCount = 0
$removedCount = 0

Write-Host "`nArchiving obsolete documentation..." -ForegroundColor Cyan
foreach ($file in $obsoleteFiles) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        $destPath = Join-Path $archiveDocsDir $file
        Move-Item -Path $filePath -Destination $destPath -Force
        Write-Host "  Archived: $file" -ForegroundColor Gray
        $movedCount++
    }
}

Write-Host "`nRemoving other unnecessary files..." -ForegroundColor Magenta
foreach ($file in $removeOtherFiles) {
    $filePath = Join-Path $projectRoot $file
    if (Test-Path $filePath) {
        Remove-Item -Path $filePath -Force
        Write-Host "  Removed: $file" -ForegroundColor Gray
        $removedCount++
    }
}

Write-Host "`n=== CLEANUP COMPLETE ===" -ForegroundColor Green
Write-Host "Files archived: $movedCount" -ForegroundColor Green
Write-Host "Files removed: $removedCount" -ForegroundColor Green
Write-Host "Archive location: $archiveDocsDir" -ForegroundColor Cyan
Write-Host "`nProject is now cleaner!`n" -ForegroundColor Green
