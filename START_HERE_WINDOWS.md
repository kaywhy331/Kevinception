# Kevinception V7.1 — Windows Quick Start

This release is packaged with `package.json` at the project root. After extraction, open PowerShell directly in the extracted folder.

## Confirm that PowerShell is in the project root

```powershell
Get-Location
Get-Item .\package.json
npm run doctor
```

The doctor command must report:

```text
Package: kevinception-v7-r3f@0.8.0
```

## Clean installation and verification

```powershell
npm ci
npm run verify
npm run dev
```

Open the exact URL printed by the development server. When port 4321 is occupied, the script automatically selects 4322 or another available port.

## One-command setup

```powershell
powershell -ExecutionPolicy Bypass -File .\RUN_FIRST_WINDOWS.ps1
```

## Production preview

```powershell
npm run build
npm run preview
```

## Choose a development port

```powershell
npm run dev -- --port=4400
```

## Important: “Missing script: dev” or “Missing script: verify”

That message means PowerShell is not in the Kevinception project root or the wrong `package.json` was found.

Locate the correct file:

```powershell
Get-ChildItem -Recurse -Filter package.json |
  Where-Object { $_.FullName -notmatch 'node_modules' } |
  Select-Object FullName
```

Then change into the folder whose `package.json` contains:

```json
"name": "kevinception-v7-r3f"
```

Do not run `npm audit fix --force` against an unrelated parent or extraction folder.
