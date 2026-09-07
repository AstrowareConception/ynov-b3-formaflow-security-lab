const SENSITIVE_KEYS = /^(authorization|cookie|set-cookie|password|accessToken|csrfToken|aesKey)$/i;
const EMAIL_KEYS = /^(email|userEmail)$/i;

function redactEmail(value: string) {
  const separator = value.lastIndexOf('@');
  return separator > 0 ? `${value.slice(0, 1)}***${value.slice(separator)}` : '[REDACTED-EMAIL]';
}

export function redactLog(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(redactLog);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [
      key,
      SENSITIVE_KEYS.test(key) ? '[REDACTED]' : EMAIL_KEYS.test(key) && typeof item === 'string' ? redactEmail(item) : redactLog(item),
    ]));
  }
  return value;
}
