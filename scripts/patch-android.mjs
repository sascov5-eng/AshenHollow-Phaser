import { readFile, writeFile } from 'node:fs/promises';

const path = 'android/app/src/main/AndroidManifest.xml';
let manifest = await readFile(path, 'utf8');
if (!manifest.includes('android:screenOrientation="landscape"')) {
  manifest = manifest.replace(
    '<activity',
    '<activity android:screenOrientation="landscape"',
  );
}
await writeFile(path, manifest, 'utf8');
