import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const posix = (path) => relative('.', path).replaceAll('\\', '/');
const walk = (root) => readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
  const path = join(root, entry.name);
  return entry.isDirectory() ? walk(path) : [path];
}).sort((left, right) => posix(left).localeCompare(posix(right)));

const required = [
  'docs/rgpd/data-map.md', 'docs/rgpd/data-map.mmd', 'docs/rgpd/data-map.svg',
  'docs/rgpd/register.md', 'docs/rgpd/privacy-backlog.md', 'docs/rgpd/requirements.md',
  'docs/rgpd/minimization-matrix.md', 'docs/rgpd/retention-matrix.md',
  'docs/rgpd/rights-procedures.md', 'docs/rgpd/erasure-propagation.mmd',
  'docs/rgpd/erasure-propagation.svg', 'docs/cdan/transfer.json',
];
for (const path of required) if (!existsSync(path)) throw new Error(`Fichier RGPD absent: ${path}`);

const requirements = readFileSync('docs/rgpd/requirements.md', 'utf8');
const ids = [...requirements.matchAll(/\bPBD-\d{2}\b/g)].map((match) => match[0]);
if (new Set(ids).size < 5) throw new Error('Moins de cinq exigences Privacy by Design identifiées');
if (!requirements.includes('automatisé')) throw new Error('Exigences RGPD automatisées non identifiées');

const dataMap = readFileSync('docs/rgpd/data-map.md', 'utf8');
for (const heading of ['Personne concernée', 'Source', 'Finalité', 'Base légale', 'Destinataire', 'Localisation', 'Durée', 'Protection', 'Droit', 'Propriétaire']) {
  if (!dataMap.includes(heading)) throw new Error(`Champ de cartographie absent: ${heading}`);
}

const transfer = JSON.parse(readFileSync('docs/cdan/transfer.json', 'utf8'));
if (transfer.kitVersion !== '1.0.0' || transfer.module !== 'security-rgpd' || transfer.status !== 'verified') throw new Error('Fiche CDAN incompatible');
if (!Array.isArray(transfer.evidence) || transfer.evidence.length < 2) throw new Error('Preuves CDAN insuffisantes');
for (const evidence of transfer.evidence) {
  for (const field of ['evidenceId', 'claim', 'location', 'verification', 'result', 'contributor', 'provenance', 'limitations', 'confidentiality']) {
    if (!evidence[field]) throw new Error(`Champ CDAN absent: ${field}`);
  }
}

for (const path of walk('packages/contracts/events')) {
  const schema = JSON.parse(readFileSync(path, 'utf8'));
  if (schema.additionalProperties !== false || schema.properties?.data?.additionalProperties !== false) throw new Error(`Événement non minimal: ${posix(path)}`);
}
console.log(`OK privacy requirements=${new Set(ids).size} evidence=${transfer.evidence.length} paths=POSIX`);
