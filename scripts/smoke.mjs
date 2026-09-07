import { assertLocalTarget } from './target-guard.mjs';

const base = process.env.LAB_BASE_URL || 'http://127.0.0.1:3000';
assertLocalTarget(base);
const timeout = (ms) => AbortSignal.timeout(ms);
const health = await fetch(`${base}/health`, { signal: timeout(5_000) });
if (!health.ok) throw new Error(`health HTTP ${health.status}`);
const state = await health.json();
const catalog = await fetch(`${base}/api/catalog?q=${encodeURIComponent('Sécurité')}`, { signal: timeout(5_000) });
if (!catalog.ok || !(await catalog.json()).length) throw new Error('catalogue synthétique indisponible');
console.log(`OK smoke profile=${state.profile} health=200 catalog=non-empty target=${base}`);
