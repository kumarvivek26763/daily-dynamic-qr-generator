const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// Standard CRC32 table
const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = chunk.subarray(4, 8 + len);
  chunk.writeUInt32BE(crc32(typeAndData), 8 + len);
  return chunk;
}

function createPng(width, height, pixelFn) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // bit depth
  ihdrData[9] = 6; // color type: RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdr = makeChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const scanlineLen = 1 + width * 4;
  const rawData = Buffer.alloc(scanlineLen * height);

  for (let y = 0; y < height; y++) {
    const rowOffset = y * scanlineLen;
    rawData[rowOffset] = 0; // filter None
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = pixelFn(x, y, width, height);
      const pixelOffset = rowOffset + 1 + x * 4;
      rawData[pixelOffset] = r;
      rawData[pixelOffset + 1] = g;
      rawData[pixelOffset + 2] = b;
      rawData[pixelOffset + 3] = a;
    }
  }

  const deflated = zlib.deflateSync(rawData, { level: 9 });
  const idat = makeChunk('IDAT', deflated);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdr, idat, iend]);
}

// Icon Drawer
function renderIconPixel(x, y, w, h, isMaskable) {
  // Normalize to 512 space
  const scale = 512 / w;
  const px = x * scale;
  const py = y * scale;

  // Background
  const bgR = 28, bgG = 25, bgB = 23; // stone-900 (#1c1917)
  const amberR = 245, amberG = 158, amberB = 11; // amber-500 (#f59e0b)
  const darkAmberR = 217, darkAmberG = 119, darkAmberB = 6; // amber-600
  const whiteR = 250, whiteG = 250, whiteB = 249; // stone-50 (#fafaf9)

  if (isMaskable) {
    // Solid background all the way to edge for maskable
    // Within safe circle: center (256, 256), radius ~190 (80% safe zone)
  }

  // Corner radius check for non-maskable (squircle)
  if (!isMaskable) {
    const cornerR = 100;
    let dx = 0, dy = 0;
    if (px < cornerR) dx = cornerR - px;
    else if (px > 512 - cornerR) dx = px - (512 - cornerR);
    if (py < cornerR) dy = cornerR - py;
    else if (py > 512 - cornerR) dy = py - (512 - cornerR);
    if (dx > 0 && dy > 0 && (dx * dx + dy * dy > cornerR * cornerR)) {
      return [0, 0, 0, 0]; // transparent outside rounded corner
    }
  }

  // Draw QR corner blocks (Top-Left: 96..204, 96..204)
  function inBox(cx, cy, bx, by, bw, bh) {
    return cx >= bx && cx < bx + bw && cy >= by && cy < by + bh;
  }
  function inRing(cx, cy, bx, by, bw, bh, thick) {
    if (!inBox(cx, cy, bx, by, bw, bh)) return false;
    return !inBox(cx, cy, bx + thick, by + thick, bw - thick * 2, bh - thick * 2);
  }

  // Top-left target
  if (inRing(px, py, 96, 96, 108, 108, 22)) return [amberR, amberG, amberB, 255];
  if (inBox(px, py, 134, 134, 32, 32)) return [amberR, amberG, amberB, 255];

  // Top-right target
  if (inRing(px, py, 308, 96, 108, 108, 22)) return [amberR, amberG, amberB, 255];
  if (inBox(px, py, 346, 134, 32, 32)) return [amberR, amberG, amberB, 255];

  // Bottom-left target
  if (inRing(px, py, 96, 308, 108, 108, 22)) return [amberR, amberG, amberB, 255];
  if (inBox(px, py, 134, 346, 32, 32)) return [amberR, amberG, amberB, 255];

  // Center QR cells
  if (inBox(px, py, 236, 104, 40, 40)) return [whiteR, whiteG, whiteB, 255];
  if (inBox(px, py, 236, 164, 40, 40)) return [amberR, amberG, amberB, 255];
  if (inBox(px, py, 104, 236, 40, 40)) return [whiteR, whiteG, whiteB, 255];
  if (inBox(px, py, 164, 236, 40, 40)) return [darkAmberR, darkAmberG, darkAmberB, 255];
  if (inBox(px, py, 236, 236, 40, 40)) return [whiteR, whiteG, whiteB, 255];
  if (inBox(px, py, 308, 236, 40, 40)) return [amberR, amberG, amberB, 255];
  if (inBox(px, py, 368, 236, 48, 40)) return [whiteR, whiteG, whiteB, 255];
  if (inBox(px, py, 236, 308, 40, 40)) return [amberR, amberG, amberB, 255];
  if (inBox(px, py, 236, 368, 40, 48)) return [whiteR, whiteG, whiteB, 255];

  // Bottom-right calendar badge (296, 296, 130, 130)
  if (inBox(px, py, 296, 296, 130, 130)) {
    if (py < 296 + 36) {
      // Header of calendar
      return [darkAmberR, darkAmberG, darkAmberB, 255];
    }
    // Border
    if (px < 302 || px >= 420 || py >= 420) {
      return [darkAmberR, darkAmberG, darkAmberB, 255];
    }
    // Body of calendar
    // Draw digit "2" and "4"
    const cx = px - 296;
    const cy = py - 296;
    // Simple block numerals for 24
    if ((cx >= 35 && cx <= 55 && cy >= 55 && cy <= 62) || // top bar of 2
        (cx >= 48 && cx <= 55 && cy >= 62 && cy <= 75) || // right bar of 2
        (cx >= 35 && cx <= 55 && cy >= 75 && cy <= 82) || // mid bar of 2
        (cx >= 35 && cx <= 42 && cy >= 82 && cy <= 95) || // left bar of 2
        (cx >= 35 && cx <= 55 && cy >= 95 && cy <= 102) || // bot bar of 2
        (cx >= 70 && cx <= 77 && cy >= 55 && cy <= 85) || // left bar of 4
        (cx >= 70 && cx <= 95 && cy >= 80 && cy <= 87) || // cross bar of 4
        (cx >= 88 && cx <= 95 && cy >= 55 && cy <= 102)) { // right bar of 4
      return [bgR, bgG, bgB, 255];
    }
    return [whiteR, whiteG, whiteB, 255];
  }

  // Base background
  return [bgR, bgG, bgB, 255];
}

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 192x192
const png192 = createPng(192, 192, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

// 512x512
const png512 = createPng(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

// 512x512 maskable (with background full-bleed)
const pngMaskable = createPng(512, 512, (x, y, w, h) => renderIconPixel(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), pngMaskable);

// apple-touch-icon 180x180
const pngApple = createPng(180, 180, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), pngApple);

// favicon.ico (can be a 48x48 PNG renamed to ico or wrapped in ICO header)
// Valid ICO containing a 48x48 PNG:
const png48 = createPng(48, 48, (x, y, w, h) => renderIconPixel(x, y, w, h, false));
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // reserved
icoHeader.writeUInt16LE(1, 2); // ICO type
icoHeader.writeUInt16LE(1, 4); // 1 image

const icoEntry = Buffer.alloc(16);
icoEntry[0] = 48; // width
icoEntry[1] = 48; // height
icoEntry[2] = 0; // color palette
icoEntry[3] = 0; // reserved
icoEntry.writeUInt16LE(1, 4); // color planes
icoEntry.writeUInt16LE(32, 6); // bits per pixel
icoEntry.writeUInt32LE(png48.length, 8); // image size
icoEntry.writeUInt32LE(22, 12); // image offset

const faviconIco = Buffer.concat([icoHeader, icoEntry, png48]);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), faviconIco);

console.log('Successfully generated PWA icon assets:');
console.log(' - pwa-192x192.png');
console.log(' - pwa-512x512.png');
console.log(' - pwa-maskable-512x512.png');
console.log(' - apple-touch-icon.png');
console.log(' - favicon.ico');
