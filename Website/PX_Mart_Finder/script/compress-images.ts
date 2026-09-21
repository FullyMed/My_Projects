import { readdirSync, statSync, unlinkSync } from "fs";
import { join, extname, basename, dirname } from "path";
import sharp from "sharp";

const IMAGES_DIR = join(process.cwd(), "client", "public", "Images");
const MAX_WIDTH = 800;
const SKIP_BELOW_BYTES = 10 * 1024; // already-tiny assets (e.g. small icons) aren't worth touching

function walk(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

async function run() {
  const targets = walk(IMAGES_DIR).filter(
    (f) => extname(f).toLowerCase() === ".png" && statSync(f).size >= SKIP_BELOW_BYTES
  );

  let beforeTotal = 0;
  let afterTotal = 0;

  for (const file of targets) {
    const before = statSync(file).size;
    const outPath = join(dirname(file), basename(file, extname(file)) + ".webp");

    await sharp(file)
      .resize({ width: MAX_WIDTH, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outPath);

    const after = statSync(outPath).size;
    beforeTotal += before;
    afterTotal += after;
    unlinkSync(file);

    console.log(
      `${file.replace(IMAGES_DIR, "Images")} — ${(before / 1024).toFixed(0)}KB -> ${(after / 1024).toFixed(0)}KB`
    );
  }

  console.log(
    `\nTotal: ${(beforeTotal / 1024 / 1024).toFixed(2)}MB -> ${(afterTotal / 1024 / 1024).toFixed(2)}MB ` +
      `(${(100 - (afterTotal / beforeTotal) * 100).toFixed(0)}% smaller)`
  );
}

run();
