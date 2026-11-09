import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const root = path.resolve('assets');

const jobs = [
  { file: '83 logo (4).png', width: 640, type: 'png' },
  { file: 'white logo.png', width: 640, type: 'png' },
  { file: 'hero img2.png', width: 1800, type: 'jpeg', out: 'hero img2.jpg' },
  { file: 'prakash ghagare.png', width: 900, type: 'jpeg', out: 'prakash ghagare.jpg' },
  { file: 'abhilash_amula.jpg', width: 900, type: 'jpeg' },
  { file: 'par360.jpg', width: 1200, type: 'jpeg' },
  { file: 'reeferon.jpg', width: 1200, type: 'jpeg' },
  { file: 'ten_foods.jpg', width: 1200, type: 'jpeg' },
];

async function run() {
  for (const job of jobs) {
    const input = path.join(root, job.file);
    if (!fs.existsSync(input)) {
      console.log('skip missing', job.file);
      continue;
    }

    const before = fs.statSync(input).size;
    const outName = job.out || job.file;
    const output = path.join(root, outName);
    const tmp = output + '.tmp';

    let pipeline = sharp(input).rotate().resize({
      width: job.width,
      withoutEnlargement: true,
      fit: 'inside',
    });

    if (job.type === 'png') {
      await pipeline.png({ compressionLevel: 9, palette: true, quality: 80 }).toFile(tmp);
    } else {
      await pipeline.jpeg({ quality: 78, mozjpeg: true }).toFile(tmp);
    }

    fs.renameSync(tmp, output);
    if (output !== input && fs.existsSync(input)) fs.unlinkSync(input);

    const after = fs.statSync(output).size;
    console.log(`${job.file} -> ${outName}: ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`);
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
