import { spawnSync } from 'node:child_process';

const index = process.argv.indexOf('--profile');
const profile = index >= 0 ? process.argv[index + 1] : process.env.LAB_PROFILE;
if (!['vulnerable', 'remediated', 'cookie'].includes(profile)) throw new Error('Profil ambigu: fournir --profile vulnerable|remediated|cookie');
const result = spawnSync(process.execPath, ['node_modules/jest/bin/jest.js', '--runInBand', 'tests/security'], {
  stdio: 'inherit', timeout: 120_000, env: { ...process.env, LAB_PROFILE_TEST: profile },
});
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);
console.log(`OK security-tests profil explicite=${profile}, cible externe=interdite, délai=120s`);
