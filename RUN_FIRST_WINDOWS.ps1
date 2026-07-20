$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath '.\package.json')) {
  Write-Error 'package.json is missing. Open PowerShell in the extracted Kevinception folder.'
}

$pkg = Get-Content -Raw '.\package.json' | ConvertFrom-Json
if ($pkg.name -ne 'kevinception-v7-r3f') {
  Write-Error "Wrong package root. Detected: $($pkg.name)"
}

node scripts/doctor.mjs
npm ci
npm run verify
npm run dev
