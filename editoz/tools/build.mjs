// Writes editoz/index.html from js/content.js. No dependencies, just Node.
// Run after editing content: `node editoz/tools/build.mjs`
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import content from '../js/content.js';
import { createRenderer } from '../js/render.js';

const here = (p) => fileURLToPath(new URL(p, import.meta.url));
const r = createRenderer(content);
const html = readFileSync(here('./index.template.html'), 'utf8')
  .replace('{{lang}}', content.site.lang)
  .replace('<!--head-->', r.head())
  .replace('<!--app-->', r.body());

writeFileSync(here('../index.html'), html);
console.log('wrote editoz/index.html');
