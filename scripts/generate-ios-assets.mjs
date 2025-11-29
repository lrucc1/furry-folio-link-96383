import { mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const assetBase = join(__dirname, '..', 'ios', 'App', 'App', 'Assets.xcassets');
const sourcesBase = join(__dirname, '..', 'ios', 'assets');

const targets = [
  {
    source: join(sourcesBase, 'AppIcon-512@2x.b64'),
    dest: join(assetBase, 'AppIcon.appiconset', 'AppIcon-512@2x.png'),
  },
  {
    source: join(sourcesBase, 'splash-2732x2732.b64'),
    dest: join(assetBase, 'Splash.imageset', 'splash-2732x2732.png'),
  },
  {
    source: join(sourcesBase, 'splash-2732x2732-1.b64'),
    dest: join(assetBase, 'Splash.imageset', 'splash-2732x2732-1.png'),
  },
  {
    source: join(sourcesBase, 'splash-2732x2732-2.b64'),
    dest: join(assetBase, 'Splash.imageset', 'splash-2732x2732-2.png'),
  },
];

for (const { source, dest } of targets) {
  const data = readFileSync(source, 'utf8');
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, Buffer.from(data, 'base64'));
  console.log(`Wrote ${dest}`);
}
