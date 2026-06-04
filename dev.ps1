$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$pythonExe = Join-Path $root 'venv\Scripts\python.exe'
$frontendDir = Join-Path $root 'Frontend'

if (-not (Test-Path $pythonExe)) {
    throw "Python executable not found at $pythonExe"
}

if (-not (Test-Path (Join-Path $frontendDir 'package.json'))) {
    throw "Frontend package.json not found at $frontendDir"
}

if (-not (Test-Path (Join-Path $frontendDir 'node_modules'))) {
    Write-Host 'Installing frontend dependencies...'
    Push-Location $frontendDir
    npm install
    Pop-Location
}

Start-Process -FilePath $pythonExe -WorkingDirectory $root -ArgumentList @('-m', 'uvicorn', 'api_server:app', '--reload', '--port', '8000')
Start-Process -FilePath 'npm' -WorkingDirectory $frontendDir -ArgumentList @('run', 'dev')

Write-Host 'Started backend on http://localhost:8000'
Write-Host 'Started frontend on http://localhost:5173'
Write-Host 'Use Ctrl+C in the separate terminals/windows to stop them.'
