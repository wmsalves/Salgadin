import { mkdir, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

const [, , inputArg = './public/og-image.svg', outputArg = './public/og-image.png'] = process.argv;

const inputPath = path.resolve(process.cwd(), inputArg);
const outputPath = path.resolve(process.cwd(), outputArg);
const fontCachePath = path.join(os.tmpdir(), 'salgadin-fontconfig-cache');
const fontConfigPath = path.join(fontCachePath, 'fonts.conf');

await mkdir(path.dirname(outputPath), { recursive: true });
await mkdir(fontCachePath, { recursive: true });

process.env.XDG_CACHE_HOME = fontCachePath;
process.env.FONTCONFIG_CACHE = fontCachePath;
process.env.FONTCONFIG_FILE = fontConfigPath;
process.env.FONTCONFIG_PATH = fontCachePath;

const normalizedFontCachePath = fontCachePath.replaceAll('\\', '/');

await writeFile(
  fontConfigPath,
  `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>/usr/share/fonts</dir>
  <dir>/usr/local/share/fonts</dir>
  <dir>C:/Windows/Fonts</dir>
  <cachedir>${normalizedFontCachePath}</cachedir>
</fontconfig>
`,
);

const { default: sharp } = await import('sharp');
const metadata = await sharp(inputPath).metadata();

if (metadata.width !== 1200 || metadata.height !== 630) {
  throw new Error(`OG source must be 1200x630. Found ${metadata.width}x${metadata.height}.`);
}

await sharp(inputPath, { density: 144 })
  .resize(1200, 630, { fit: 'fill' })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(outputPath);

console.log(`Generated ${path.relative(process.cwd(), outputPath)} from ${path.relative(process.cwd(), inputPath)}`);
