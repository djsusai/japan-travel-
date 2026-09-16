#!/usr/bin/env node
/*
 * Rasterises site/icons/*.svg into the PNGs the web app manifest points at.
 * The SVGs are the source of truth; the PNGs are committed so that nobody needs
 * a toolchain just to serve the site.
 *
 *   npm install --no-save playwright && node tools/build-icons.mjs
 *
 * Any SVG rasteriser does the same job — this one uses headless Chromium
 * because it is already around for the checks.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const ICONS = join(ROOT, "site", "icons");

/* target file ← source svg, at this pixel size */
const TARGETS = [
  ["icon-192.png", "icon.svg", 192],
  ["icon-512.png", "icon.svg", 512],
  ["icon-maskable-512.png", "icon-maskable.svg", 512],
  /* iOS ignores the manifest icons and uses this one for the home screen. */
  ["apple-touch-icon.png", "icon.svg", 180],
];

let chromium;
try {
  ({ chromium } = await import("playwright"));
} catch {
  console.error("playwright is not installed — run: npm install --no-save playwright");
  process.exit(1);
}

const browser = await chromium.launch(
  process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}
);

await mkdir(ICONS, { recursive: true });
for (const [out, src, size] of TARGETS) {
  const svg = await readFile(join(ICONS, src), "utf8");
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(
    `<!doctype html><meta charset="utf-8">
     <style>html,body{margin:0;width:${size}px;height:${size}px;overflow:hidden}
     svg{display:block;width:${size}px;height:${size}px}</style>${svg}`,
    { baseURL: pathToFileURL(join(ICONS, "/")).href }
  );
  const png = await page.screenshot({ omitBackground: false });
  await writeFile(join(ICONS, out), png);
  await page.close();
  console.log(`→ icons/${out}  (${src} at ${size}px)`);
}
await browser.close();
