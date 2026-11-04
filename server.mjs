// Optional local / Render server. Opening index.html directly also works.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const root = new URL('./', import.meta.url);
const allowed = new Map([
  ['index.html', 'text/html; charset=utf-8'], ['style.css', 'text/css; charset=utf-8'],
  ['app.js', 'text/javascript; charset=utf-8'], ['engine.js', 'text/javascript; charset=utf-8'],
  ['artwork.js', 'text/javascript; charset=utf-8'], ['scenes.js', 'text/javascript; charset=utf-8'],
  ['favicon.svg', 'image/svg+xml'], ['README.md', 'text/plain; charset=utf-8'],
  ['tests/responsive.html', 'text/html; charset=utf-8']
]);
const portIndex = process.argv.indexOf('--port');
const port = Number(portIndex >= 0 ? process.argv[portIndex+1] : process.env.PORT) || 3000;
createServer(async (req, res) => {
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405, { Allow: 'GET, HEAD' });res.end();return;}
  let path;
  try {path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\//,'') || 'index.html';}
  catch {res.writeHead(400);res.end('Bad request');return;}
  if (!allowed.has(path)) {res.writeHead(404);res.end('Not found');return;}
  try {
    const body=await readFile(new URL(path,root));
    res.writeHead(200, { 'Content-Type':allowed.get(path), 'Cache-Control':'no-cache', 'X-Content-Type-Options':'nosniff' });
    res.end(req.method==='HEAD'?undefined:body);
  } catch {res.writeHead(500);res.end('Unable to read file');}
}).listen(port,'0.0.0.0',()=>console.log(`Edit Studio: http://0.0.0.0:${port} (${fileURLToPath(root)})`));
