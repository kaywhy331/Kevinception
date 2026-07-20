import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import net from 'node:net';

const root = path.resolve(process.argv[2] ?? 'out');
const requested = Number(process.argv[3] ?? process.env.PORT ?? 4321);
const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.mp4': 'video/mp4', '.woff2': 'font/woff2'
};

function isFree(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.once('error', () => resolve(false));
    server.once('listening', () => server.close(() => resolve(true)));
    server.listen(port, '127.0.0.1');
  });
}

let port = requested;
while (!(await isFree(port))) port += 1;
if (port !== requested) console.log(`Port ${requested} is already in use; using ${port} instead.`);

const server = http.createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith('/')) pathname += 'index.html';
  let file = path.resolve(root, `.${pathname}`);
  if (!file.startsWith(root)) {
    res.writeHead(403).end('Forbidden'); return;
  }
  if (!fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    const htmlCandidate = `${file}.html`;
    if (fs.existsSync(htmlCandidate)) file = htmlCandidate;
    else file = path.join(root, '404.html');
  }
  const ext = path.extname(file).toLowerCase();
  res.writeHead(fs.existsSync(file) ? 200 : 404, {
    'Content-Type': mime[ext] ?? 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=3600'
  });
  fs.createReadStream(file).pipe(res);
});
server.listen(port, '127.0.0.1', () => console.log(`Kevinception V7 preview: http://127.0.0.1:${port}`));
