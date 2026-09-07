import { execFileSync } from 'node:child_process';
import { X509Certificate, createPrivateKey, createPublicKey } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { get as httpGet } from 'node:http';
import { get as httpsGet } from 'node:https';
import selfsigned from 'selfsigned';

const directory = new URL('../infra/tls/generated/', import.meta.url);
mkdirSync(directory, { recursive: true });
const generated = await selfsigned.generate(
  [{ name: 'commonName', value: 'localhost' }],
  {
    keySize: 2048, days: 30, algorithm: 'sha256',
    extensions: [{ name: 'subjectAltName', altNames: [
      { type: 2, value: 'localhost' }, { type: 7, ip: '127.0.0.1' }, { type: 7, ip: '::1' },
    ] }],
  },
);
writeFileSync(new URL('localhost.key', directory), generated.private, { mode: 0o600 });
writeFileSync(new URL('localhost.crt', directory), generated.cert, { mode: 0o644 });

const certificate = new X509Certificate(generated.cert);
if (!certificate.checkIP('127.0.0.1') || !certificate.checkHost('localhost')) throw new Error('SAN local incomplet');
const privatePublic = createPublicKey(createPrivateKey(generated.private)).export({ type: 'spki', format: 'der' });
const certificatePublic = certificate.publicKey.export({ type: 'spki', format: 'der' });
if (!privatePublic.equals(certificatePublic)) throw new Error('La clé privée ne correspond pas au certificat');
const tracked = execFileSync('git', ['ls-files', '--', 'infra/tls/generated'], { encoding: 'utf8' }).trim();
if (tracked) throw new Error(`Fichier TLS généré indexé: ${tracked}`);

execFileSync('docker', ['compose', '-f', 'compose.yml', '-p', 'formaflow-security-lab', '--profile', 'remediated', '--profile', 'tls', 'up', '-d', '--wait', 'tls-proxy'], { stdio: 'inherit', timeout: 180_000 });

const request = (get, options) => new Promise((resolve, reject) => {
  const call = get(options, (response) => {
    let body = '';
    response.on('data', (chunk) => { body += chunk; });
    response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body }));
  });
  call.setTimeout(5_000, () => call.destroy(new Error('Délai TLS dépassé')));
  call.on('error', reject);
});
const ca = readFileSync(new URL('localhost.crt', directory));
const secure = await request(httpsGet, { hostname: '127.0.0.1', port: 3443, path: '/health', ca, servername: 'localhost' });
if (secure.status !== 200 || !secure.body.includes('remediated')) throw new Error(`HTTPS local invalide: ${secure.status}`);
const redirect = await request(httpGet, { hostname: '127.0.0.1', port: 3080, path: '/health' });
if (redirect.status !== 308 || redirect.headers.location !== 'https://127.0.0.1:3443/health') throw new Error('Redirection HTTP vers HTTPS invalide');
console.log(`OK TLS local HTTPS=200 redirect=308 SAN=localhost,127.0.0.1,::1 validTo=${certificate.validTo}`);
