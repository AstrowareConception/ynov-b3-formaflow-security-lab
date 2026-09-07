const SENSITIVE_KEYS = /^(authorization|cookie|set-cookie|password|accessToken|csrfToken|aesKey)$/i;

export function redactLog(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactLog);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, SENSITIVE_KEYS.test(key) ? '[REDACTED]' : redactLog(item)]));
  }
  return value;
}
