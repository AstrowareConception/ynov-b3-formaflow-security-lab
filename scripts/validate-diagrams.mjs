import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

function files(root) {
  const result = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory() && !['node_modules', '.git', '_inputs', 'inputs'].includes(entry.name)) result.push(...files(path));
    else if (entry.isFile() && entry.name.endsWith('.mmd')) result.push(path);
  }
  return result;
}
const sources = files('.').sort((a, b) => relative('.', a).replaceAll('\\', '/').localeCompare(relative('.', b).replaceAll('\\', '/')));
if (sources.length < 4) throw new Error('Au moins quatre diagrammes Mermaid sont requis');
for (const source of sources) {
  const render = source.replace(/\.mmd$/, '.svg');
  const text = readFileSync(source, 'utf8');
  const svg = readFileSync(render, 'utf8');
  if (!/^(flowchart|sequenceDiagram|C4Context|stateDiagram)/m.test(text)) throw new Error(`Source Mermaid non reconnue: ${source}`);
  if (!svg.includes('<svg') || statSync(render).mtimeMs < statSync(source).mtimeMs) throw new Error(`SVG absent ou périmé: ${render}`);
}
console.log(`OK diagrams sources=${sources.length} SVG=fresh`);
