<#
.SYNOPSIS
    Install offline packages on an offline machine and verify basic readiness.

.DESCRIPTION
    Run this on the offline machine after copying the `offline-packages` folder and the project source to the machine.
    It will:
    - extract frontend and backend node_modules archives
    - perform a quick verification `npm list --depth=0`
    - prompt next steps for creating .env.local files and starting services
#>

Param()

Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $root

if (-Not (Test-Path .\offline-packages)) {
    Write-Error "offline-packages not found. Copy the offline-packages folder into the project root first."
    Pop-Location
    exit 1
}

# Extract frontend node_modules
if (Test-Path .\offline-packages\frontend_node_modules.zip) {
    Write-Host "Extracting frontend node_modules..."
    Expand-Archive -Path .\offline-packages\frontend_node_modules.zip -DestinationPath . -Force
} else {
    Write-Warning "frontend_node_modules.zip not found in offline-packages."
}

# Extract backend node_modules
if (Test-Path .\offline-packages\backend_node_modules.zip) {
    Write-Host "Extracting backend node_modules into auth-backend..."
    if (-Not (Test-Path .\auth-backend)) {
        Write-Warning "auth-backend folder not found in project root. Ensure project source copied correctly."
    } else {
        Expand-Archive -Path .\offline-packages\backend_node_modules.zip -DestinationPath .\auth-backend -Force
    }
} else {
    Write-Warning "backend_node_modules.zip not found in offline-packages."
}

Write-Host "Verifying installed packages (frontend):"
try { npm list --depth=0 } catch { Write-Warning "npm list failed — node/npm may be missing or package metadata unavailable." }

Write-Host "Verifying installed packages (backend):"
if (Test-Path .\auth-backend) {
    Push-Location .\auth-backend
    try { npm list --depth=0 } catch { Write-Warning "npm list failed in auth-backend — node/npm may be missing or package metadata unavailable." }
    Pop-Location
}

Write-Host "Next steps:"
Write-Host " 1) Create .env.local and auth-backend\.env.local from provided examples and set credentials."
Write-Host " 2) Run scripts\start-local.ps1 to start frontend and backend in separate windows."

Pop-Location
Write-Host "Install finished (or partial). Review warnings above if any."
