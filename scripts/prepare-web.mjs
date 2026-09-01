import { cp, copyFile, mkdir, readFile, rm, writeFile } from 'node:fs/promises';

await rm('www', { recursive: true, force: true });
await mkdir('www/vendor', { recursive: true });
await cp('src', 'www/src', { recursive: true });
await cp('assets', 'www/assets', { recursive: true });
await copyFile('node_modules/phaser/dist/phaser.min.js', 'www/vendor/phaser.min.js');

const html = await readFile('index.html', 'utf8');
const offlineHtml = html.replace(
  'https://cdn.jsdelivr.net/npm/phaser@3.90.0/dist/phaser.min.js',
  'vendor/phaser.min.js',
);
await writeFile('www/index.html', offlineHtml, 'utf8');
