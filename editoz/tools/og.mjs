// Generates editoz/og.png (1200×630 link preview) from js/content.js using
// headless Chrome. Run after changing the recipient: `node editoz/tools/og.mjs`.
// Set CHROME_PATH if Chrome isn't in the default macOS location.
import { execFileSync } from 'node:child_process';
import { writeFileSync, mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import content from '../js/content.js';

const chrome = process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const { recipient, sender, site } = content;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const html = `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@125,800&family=JetBrains+Mono:wght@500&display=block" rel="stylesheet">
<style>
  html,body{margin:0;width:1200px;height:630px;background:#0B0B0C;color:#F2F0EB;overflow:hidden}
  body{position:relative;font-family:'JetBrains Mono',monospace}
  .top{position:absolute;left:72px;right:72px;top:60px;display:flex;justify-content:space-between;font-size:20px;letter-spacing:.12em;color:#A6A39C}
  .top b{color:${site.accent};font-weight:500}
  .dot{display:inline-block;width:14px;height:14px;border-radius:50%;background:${site.accent};margin-right:14px;vertical-align:1px}
  h1{position:absolute;left:72px;right:300px;top:150px;margin:0;font:800 84px/0.98 Archivo,sans-serif;font-stretch:125%;letter-spacing:-.02em}
  h1 span{color:${site.accent};display:block}
  .phone{position:absolute;right:84px;top:118px;width:176px;height:316px;border:2px solid #2C2C31;border-radius:26px;padding:7px;background:#050506}
  .phone i{display:block;height:100%;border-radius:19px;background:#F3EEE6;position:relative}
  .phone i::before{content:'';position:absolute;left:14px;right:40px;top:30px;height:16px;background:#141414;border-radius:3px;box-shadow:0 26px 0 -2px #141414}
  .phone i::after{content:'';position:absolute;left:14px;right:14px;bottom:18px;height:30px;border-radius:99px;background:${site.accent}}
  .track{position:absolute;left:72px;right:72px;bottom:72px;height:4px;background:#2A2A2F}
  .track::before{content:'';position:absolute;left:0;top:0;bottom:0;width:62%;background:${site.accent}}
  .head{position:absolute;left:calc(72px + (1200px - 144px) * .62);bottom:56px;width:3px;height:36px;background:#F2F0EB}
  .ticks{position:absolute;left:72px;right:72px;bottom:100px;display:flex;justify-content:space-between;font-size:16px;color:#A6A39C}
</style></head><body>
  <div class="top"><span><span class="dot"></span>FOR: ${esc(recipient.agency.toUpperCase())}</span><span>FROM: <b>${esc(sender.name.toUpperCase())}</b></span></div>
  <h1>For ${esc(recipient.agency)}<span>— from ${esc(sender.firstName)}</span></h1>
  <div class="phone"><i></i></div>
  <div class="ticks"><span>WEB</span><span>MOTION</span><span>EDIT</span><span>00:02:30:00</span></div>
  <div class="track"></div><div class="head"></div>
</body></html>`;

const dir = mkdtempSync(join(tmpdir(), 'og-'));
const file = join(dir, 'og.html');
writeFileSync(file, html);
const out = fileURLToPath(new URL('../og.png', import.meta.url));
execFileSync(chrome, [
  '--headless=new', '--hide-scrollbars', '--disable-gpu', '--force-device-scale-factor=1',
  '--window-size=1200,630', '--virtual-time-budget=6000', `--screenshot=${out}`, `file://${file}`,
], { stdio: 'ignore' });
console.log('wrote', out);
