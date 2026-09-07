import { execFileSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';

const action = process.argv[2];
const allowed = new Set(['vulnerable', 'remediated', 'cookie', 'stop', 'reset']);
if (!allowed.has(action)) throw new Error('Action attendue: vulnerable, remediated, cookie, stop ou reset');
const base = ['compose', '-f', 'compose.yml', '-p', 'formaflow-security-lab'];
const run = (args, env = process.env) => execFileSync('docker', [...base, ...args], { stdio: 'inherit', env, timeout: 300_000 });
const allProfiles = ['--profile', 'vulnerable', '--profile', 'remediated', '--profile', 'cookie', '--profile', 'tls'];
const startProfile = (profile) => {
  if (profile === 'vulnerable' || profile === 'cookie') console.warn('ATTENTION: démarrage explicite d’un profil VOLONTAIREMENT VULNÉRABLE, boucle locale uniquement.');
  const env = { ...process.env, AES_GCM_KEY_BASE64: process.env.AES_GCM_KEY_BASE64 || randomBytes(32).toString('base64') };
  run(['--profile', profile, 'up', '--build', '-d', '--wait'], env);
  console.log(`Profil ${profile} disponible sur http://127.0.0.1:3000`);
};
if (action === 'stop') run([...allProfiles, 'down', '--volumes', '--remove-orphans']);
else if (action === 'reset') {
  const serviceOutput = execFileSync('docker', ['ps', '--filter', 'label=com.docker.compose.project=formaflow-security-lab', '--format', '{{.Label "com.docker.compose.service"}}'], { encoding: 'utf8', timeout: 10_000 });
  const apiService = serviceOutput.split(/\r?\n/).find((service) => service.startsWith('api-'));
  const activeProfile = apiService?.slice(4);
  run([...allProfiles, 'down', '--volumes', '--remove-orphans']);
  console.log('Données synthétiques supprimées uniquement pour le projet formaflow-security-lab.');
  if (activeProfile && ['vulnerable', 'remediated', 'cookie'].includes(activeProfile)) startProfile(activeProfile);
} else {
  startProfile(action);
}
