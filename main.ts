import { copyFileSync, existsSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });

const here = dirname(fileURLToPath(import.meta.url));
const dest = join(outDir, "entry.png");
copyFileSync(join(here, "entry.png"), dest);

// Verify the written entry: it must exist, be non-empty, and start with a
// PNG or JPEG magic header (the competition judges the file by its header).
if (!existsSync(dest)) {
  throw new Error(`entry image missing after copy: ${dest}`);
}
const size = statSync(dest).size;
if (size === 0) {
  throw new Error(`entry image is empty: ${dest}`);
}
const head = readFileSync(dest).subarray(0, 8);
const isPng =
  head[0] === 0x89 && head[1] === 0x50 && head[2] === 0x4e && head[3] === 0x47 &&
  head[4] === 0x0d && head[5] === 0x0a && head[6] === 0x1a && head[7] === 0x0a;
const isJpeg = head[0] === 0xff && head[1] === 0xd8 && head[2] === 0xff;
if (!isPng && !isJpeg) {
  throw new Error(`entry image is neither PNG nor JPEG (bad magic header): ${dest}`);
}

console.log(`Wrote ${dest} (${size} bytes, ${isPng ? "PNG" : "JPEG"})`);
