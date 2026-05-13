import sharp from "sharp";
import { writeFile } from "node:fs/promises";

const W = 1200, H = 630;

// 1) Resize hero-backdrop2.png to cover 1200x630, anchored to the bottom
//    so the Space Needle + Rainier silhouette stays in frame, then darken
//    slightly with a cream-tinted overlay so the title pops.
const cover = await sharp("public/hero-backdrop2.png")
  .resize(W, H, { fit: "cover", position: "bottom" })
  .toBuffer();

// 2) SVG overlay: title in editorial serif italic + small eyebrow + URL.
//    Using a system-serif fallback chain that librsvg resolves on macOS.
const overlay = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="paper" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#f6efe2" stop-opacity="0.92"/>
      <stop offset="55%" stop-color="#f6efe2" stop-opacity="0.62"/>
      <stop offset="100%" stop-color="#f6efe2" stop-opacity="0.0"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#paper)"/>
  <g font-family="'Iowan Old Style','Palatino Linotype',Palatino,Georgia,'Times New Roman',serif" fill="#1b2230">
    <text x="80" y="120" font-size="22" letter-spacing="6" font-family="'IBM Plex Mono',ui-monospace,monospace" fill="#4a4a44">
      MIKE PADDEN  ·  SEATTLE
    </text>
    <text x="80" y="270" font-size="96" font-weight="600">Practical AI tools,</text>
    <text x="80" y="380" font-size="96" font-style="italic" fill="#1f4140">built for real life.</text>
    <text x="80" y="475" font-size="26" fill="#3b3a35">
      Research, sports, weddings, and AI use case discovery — a small workshop.
    </text>
    <text x="80" y="565" font-size="20" letter-spacing="4" font-family="'IBM Plex Mono',ui-monospace,monospace" fill="#4a4a44">
      MPADDEN.COM
    </text>
  </g>
</svg>
`);

const out = await sharp(cover)
  .composite([{ input: overlay, top: 0, left: 0 }])
  .png({ compressionLevel: 9 })
  .toBuffer();

await writeFile("public/og-image.png", out);
const meta = await sharp(out).metadata();
console.log("wrote public/og-image.png", meta.width, "x", meta.height, `${(out.length/1024).toFixed(1)}KB`);
