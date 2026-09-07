import { execFileSync } from 'node:child_process';
const kind = process.argv[2];
if (!['postgres', 'rabbitmq', 'e2e'].includes(kind)) throw new Error('test intégration attendu: postgres|rabbitmq|e2e');
const project = ['compose', '-f', 'compose.yml', '-p', 'formaflow-security-lab'];
if (kind === 'postgres') execFileSync('docker', [...project, 'exec', '-T', 'postgres', 'psql', '-U', 'formaflow_admin', '-d', 'formaflow', '-c', 'SELECT count(*) FROM users;'], { stdio: 'inherit', timeout: 30_000 });
if (kind === 'rabbitmq') execFileSync('docker', [...project, 'exec', '-T', 'rabbitmq', 'rabbitmq-diagnostics', '-q', 'ping'], { stdio: 'inherit', timeout: 30_000 });
if (kind === 'e2e') await import('./smoke.mjs');
console.log(`OK integration ${kind}`);
