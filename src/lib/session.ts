/**
 * Server-side session store.
 *
 * Uses in-memory storage attached to globalThis so it survives
 * Next.js HMR in development. This avoids cookie-domain mismatches
 * when developing behind ngrok (localhost vs ngrok domain).
 *
 * In production with multiple users you'd swap this for a
 * database-backed session, but for a single-user tool this is fine.
 */

const g = globalThis as unknown as { _metaToken?: string | null };
if (g._metaToken === undefined) g._metaToken = null;

export function getMetaToken(): string | null {
  return g._metaToken ?? null;
}

export function setMetaToken(token: string): void {
  g._metaToken = token;
}

export function clearMetaToken(): void {
  g._metaToken = null;
}
