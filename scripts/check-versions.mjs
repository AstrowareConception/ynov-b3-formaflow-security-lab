import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url)));
const nvm = readFileSync(new URL('../.nvmrc', import.meta.url), 'utf8').trim();
const node = process.versions.node;
const npm = process.platform === 'win32'
  ? execFileSync('cmd.exe', ['/d', '/s', '/c', 'npm --version'], { encoding: 'utf8' }).trim()
  : execFileSync('npm', ['--version'], { encoding: 'utf8' }).trim();
if (node !== '24.13.0' && !(node.startsWith('24.') && Number(node.split('.')[1]) >= 13)) throw new Error(`Node >=24.13.0 <25 requis, reçu ${node}`);
if (Number(npm.split('.')[0]) !== 11 || Number(npm.split('.')[1]) < 6) throw new Error(`npm >=11.6.2 <12 requis, reçu ${npm}`);
if (nvm !== '24.13.0' || pkg.engines.node !== '>=24.13.0 <25' || pkg.engines.npm !== '>=11.6.2 <12' || pkg.packageManager !== 'npm@11.6.2') throw new Error('Déclarations de toolchain incohérentes');
console.log(`OK toolchain node=${node} npm=${npm} declarations=3/3`);
