# Start Kevinception V7 on Windows

Open PowerShell in this folder.

## Development mode

```powershell
npm install
npm run verify
npm run dev
```

The command prints the local URL. If port 4321 is occupied, it automatically uses 4322 or the next available port.

## Production preview

```powershell
npm run build
npm run preview
```

Open the exact URL printed in PowerShell.

## Choose a port manually

```powershell
npm run dev -- --port=4400
```

For a static preview on a chosen port:

```powershell
node scripts/serve.mjs out 4400
```

## Optional browser runtime test

Keep the preview server running. In a second PowerShell window:

```powershell
$env:BASE_URL = "http://127.0.0.1:4321"
npm run test:runtime
```

Replace the URL when the preview selected a different port. Set `$env:CHROME_PATH` when Chrome, Edge, or Chromium is installed outside a common location.
