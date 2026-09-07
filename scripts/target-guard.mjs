const LOOPBACK = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);
const DOCKER_INTERNAL = new Set(['postgres', 'rabbitmq', 'api-vulnerable', 'api-remediated', 'api-cookie', 'enrollment-vulnerable', 'enrollment-remediated', 'enrollment-cookie']);

export function assertLocalTarget(value) {
  let url;
  try { url = new URL(value); } catch { throw new Error(`Cible invalide: ${value}`); }
  if (!['http:', 'https:', 'amqp:', 'postgresql:'].includes(url.protocol)) throw new Error(`Protocole interdit: ${url.protocol}`);
  if (!LOOPBACK.has(url.hostname) && !DOCKER_INTERNAL.has(url.hostname)) throw new Error(`Cible extérieure interdite: ${url.hostname}`);
  return url;
}

if (process.argv[1]?.endsWith('target-guard.mjs') && process.argv[2]) {
  assertLocalTarget(process.argv[2]);
  console.log(`OK cible locale: ${process.argv[2]}`);
}
