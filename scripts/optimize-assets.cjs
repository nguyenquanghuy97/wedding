// Run with the bundled runtime: node scripts/optimize-assets.cjs <sharp-module-path>
// Originals stay outside public and the site checkout; reruns never recompress a derivative.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require(process.argv[2] || 'sharp');

async function main() {
  const project = path.resolve(__dirname, '..');
  const assets = path.join(project, 'public/assets');
  const originals = path.resolve(project, '../wedding-asset-originals');
  await fs.mkdir(originals, { recursive: true });
  const results = [];
  for (const name of (await fs.readdir(assets)).filter(name => name.endsWith('.webp'))) {
    const target = path.join(assets, name);
    const backup = path.join(originals, name);
    try { await fs.copyFile(target, backup, require('node:fs').constants.COPYFILE_EXCL); }
    catch (error) { if (error.code !== 'EEXIST') throw error; }
    const input = await fs.readFile(backup);
    const metadata = await sharp(input).metadata();
    let pipeline = sharp(input);
    if (name.startsWith('floral-')) pipeline = pipeline.resize({ height: 900, withoutEnlargement: true });
    if (name === 'hero-monogram.webp') pipeline = pipeline.resize({ width: 440, withoutEnlargement: true });
    if (name === 'invitation-monogram.webp') pipeline = pipeline.resize({ width: 160, withoutEnlargement: true });
    const output = await pipeline.webp({ quality: 85, alphaQuality: 100, effort: 6 }).toBuffer();
    const chosen = output.length < input.length ? output : input;
    const after = await sharp(chosen).metadata();
    if (metadata.hasAlpha && !after.hasAlpha) throw new Error(`Lost transparency: ${name}`);
    await fs.writeFile(target, chosen);
    results.push({ name, before: input.length, after: chosen.length, width: after.width, height: after.height });
    console.log(`${name}: ${input.length} -> ${chosen.length}`);
  }
  const before = results.reduce((sum, item) => sum + item.before, 0);
  const after = results.reduce((sum, item) => sum + item.after, 0);
  await fs.writeFile(path.join(originals, 'optimization-report.json'), JSON.stringify({ before, after, results }, null, 2));
  console.log(JSON.stringify({ before, after, savedPercent: Math.round((1 - after / before) * 100) }));
}
main().catch(error => { console.error(error); process.exitCode = 1; });
