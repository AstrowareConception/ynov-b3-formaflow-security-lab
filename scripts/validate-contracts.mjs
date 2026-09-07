import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

function jsonFiles(root) {
  const result = [];
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) result.push(...jsonFiles(path));
    else if (entry.name.endsWith('.json')) result.push(path);
  }
  return result.sort((a, b) => relative('.', a).replaceAll('\\', '/').localeCompare(relative('.', b).replaceAll('\\', '/')));
}
const files = [...jsonFiles('packages/contracts'), ...jsonFiles('collections')];
for (const file of files) JSON.parse(readFileSync(file, 'utf8'));
const openapi = JSON.parse(readFileSync('packages/contracts/openapi/security-lab.openapi.json', 'utf8'));
if (openapi.openapi !== '3.1.0' || openapi.servers.some((server) => !server.url.startsWith('http://127.0.0.1'))) throw new Error('OpenAPI 3.1 local requis');
console.log(`OK contracts JSON=${files.length} OpenAPI=${openapi.openapi} servers=local-only`);
