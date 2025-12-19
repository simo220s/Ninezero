<#
.SYNOPSIS
    Create offline package archives for frontend and backend node_modules.

.DESCRIPTION
    Run this on an online machine (with internet) from the project root. It will:
    - run `npm install` for frontend and backend
    - create ./offline-packages directory
    - compress frontend and backend node_modules into zip archives

.NOTES
    - Copy the resulting `offline-packages` folder and the project source to the offline machine (via USB, local network, etc.).
    - You may also include the Node.js installer for Windows in the same folder.
#>

Param()

Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $root

Write-Host "Creating offline packages in: $root\offline-packages"

if (-Not (Test-Path -Path .\offline-packages)) {
    New-Item -ItemType Directory -Path .\offline-packages | Out-Null
}

Write-Host "Installing frontend dependencies (this may take a while)..."
npm install

Write-Host "Compressing frontend node_modules to offline-packages\frontend_node_modules.zip"
if (Test-Path .\node_modules) {
    Compress-Archive -Path .\node_modules\* -DestinationPath .\offline-packages\frontend_node_modules.zip -Force
} else {
    Write-Warning "Frontend node_modules not found; run npm install first."
}

if (Test-Path .\auth-backend) {
    Push-Location .\auth-backend
    Write-Host "Installing backend dependencies (auth-backend)..."
    npm install

    Write-Host "Compressing backend node_modules to ..\offline-packages\backend_node_modules.zip"
    if (Test-Path .\node_modules) {
        Compress-Archive -Path .\node_modules\* -DestinationPath ..\offline-packages\backend_node_modules.zip -Force
    } else {
        Write-Warning "Backend node_modules not found; run npm install first in auth-backend."
    }
    Pop-Location
} else {
    Write-Warning "auth-backend folder not found; skipping backend packaging."
}

Write-Host "Optional: copy Node.js installer and any other artifacts into ./offline-packages before transferring to offline machine."

Pop-Location
Write-Host "Done. Copy './offline-packages' and the project source to the offline machine."
