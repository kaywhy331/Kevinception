import net from 'node:net';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const nextCli = require.resolve('next/dist/bin/next');

const requested = Number(process.argv.find((arg) => arg.startsWith('--port='))?.split('=')[1] ?? process.env.PORT ?? 4321);

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
console.log(`Kevinception V8 dev: http://127.0.0.1:${port}`);

const child = spawn(process.execPath, [nextCli, 'dev', '-H', '127.0.0.1', '-p', String(port)], {
  stdio: 'inherit',
  shell: false
});
child.on('exit', (code) => process.exit(code ?? 0));
