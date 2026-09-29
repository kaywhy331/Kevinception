# Windows first-run helper. Stops at the first failing step.
$ErrorActionPreference = 'Stop'

function Invoke-Step([string]$Label, [scriptblock]$Command) {
  Write-Host "`n> $Label"
  & $Command
  # $ErrorActionPreference does not cover native commands, so check the exit code.
  if ($LASTEXITCODE -ne 0) {
    Write-Error "$Label failed with exit code $LASTEXITCODE."
    exit $LASTEXITCODE
  }
}

if (-not (Test-Path -LiteralPath '.\package.json')) {
  Write-Error 'package.json is missing. Open PowerShell in the Kevinception folder (the one that contains package.json).'
}

Invoke-Step 'Project check' { node scripts/doctor.mjs }
Invoke-Step 'Install locked dependencies' { npm ci }
Invoke-Step 'Verify' { npm run verify }
npm run dev
