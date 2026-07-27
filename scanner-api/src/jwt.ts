import { SignJWT, jwtVerify } from 'jose';
import type { ScannerRole, ScannerUser } from './auth.js';

export type AuthTokenPayload = {
  sub: string;
  username: string;
  displayName: string;
  role: ScannerRole;
  agenceId: string | null;
  agenceCode: string | null;
};

function secretKey() {
  const secret = process.env.JWT_SECRET || 'voyageur241-dev-secret-change-me';
  return new TextEncoder().encode(secret);
}

export async function signAuthToken(user: ScannerUser): Promise<string> {
  return new SignJWT({
    username: user.username,
    displayName: user.displayName,
    role: user.role,
    agenceId: user.agenceId,
    agenceCode: user.agenceCode,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRES_IN || '12h')
    .sign(secretKey());
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const sub = String(payload.sub || '');
    const username = String(payload.username || '');
    if (!sub || !username) return null;
    return {
      sub,
      username,
      displayName: String(payload.displayName || username),
      role: (payload.role === 'agence' ? 'agence' : 'admin') as ScannerRole,
      agenceId: (payload.agenceId as string | null) ?? null,
      agenceCode: (payload.agenceCode as string | null) ?? null,
    };
  } catch {
    return null;
  }
}
