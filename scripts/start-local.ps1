<#
.SYNOPSIS
    Start frontend and backend development servers in separate PowerShell windows.

.DESCRIPTION
    Use this on a development (offline or online) machine after dependencies are installed
    and `.env.local` / `auth-backend\.env.local` have been created.

    It launches two new PowerShell windows (one for backend, one for frontend) and runs the dev commands.
#>

Param()

Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Definition
Push-Location $root

Write-Host "Starting backend in a new PowerShell window..."
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$($PWD)\\auth-backend' ; npm run dev" -WindowStyle Normal

Start-Sleep -Seconds 1

Write-Host "Starting frontend in a new PowerShell window..."
Start-Process -FilePath "powershell.exe" -ArgumentList "-NoExit", "-Command", "cd '$($PWD)' ; npm run dev" -WindowStyle Normal

Write-Host "Launched backend and frontend. Backend: http://localhost:3000 | Frontend: http://localhost:5173"

Pop-Location
