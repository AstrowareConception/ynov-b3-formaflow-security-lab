import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const action = process.argv[2];
const allowed = new Set(['vulnerable', 'remediated', 'cookie', 'stop', 'reset']);
if (!allowed.has(action)) throw new Error('Action attendue: vulnerable, remediated, cookie, stop ou reset');
const base = ['compose', '-f', 'compose.yml', '-p', 'formaflow-security-lab'];
const run = (args, env = process.env) => execFileSync('docker', [...base, ...args], { stdio: 'inherit', env, timeout: 300_000 });
const allProfiles = ['--profile', 'vulnerable', '--profile', 'remediated', '--profile', 'cookie'];
if (action === 'stop') run([...allProfiles, 'down', '--remove-orphans']);
else if (action === 'reset') {
  run([...allProfiles, 'down', '--volumes', '--remove-orphans']);
  console.log('Données synthétiques supprimées uniquement pour le projet formaflow-security-lab. Relancer un profil explicite.');
} else {
  if (action === 'vulnerable' || action === 'cookie') console.warn('ATTENTION: démarrage explicite d’un profil VOLONTAIREMENT VULNÉRABLE, boucle locale uniquement.');
  const env = { ...process.env, AES_GCM_KEY_BASE64: process.env.AES_GCM_KEY_BASE64 || randomBytes(32).toString('base64') };
  run(['--profile', action, 'up', '--build', '-d', '--wait'], env);
  console.log(`Profil ${action} disponible sur http://127.0.0.1:3000`);
}
