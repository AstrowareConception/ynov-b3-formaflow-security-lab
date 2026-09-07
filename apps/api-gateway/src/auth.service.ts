import { randomUUID } from 'node:crypto';
import { HttpException, Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import type { Principal } from '../../../packages/contracts/src';
import { Database } from './database';
import { currentProfile } from './profile';

type UserRow = {
  id: string; email: string; role: Principal['role'];
  password_plain: string | null; password_hash: string | null;
};
type Attempt = { count: number; resetAt: number };
const BCRYPT_COST = 12;
const DUMMY_HASH = '$2b$12$oBZPL6PCkz0eTExT6BW9yuqlCSiiRk6VWqXok0mhzdTgoOFlwLW8a';

@Injectable()
export class AuthService implements OnModuleInit {
  private readonly attempts = new Map<string, Attempt>();

  constructor(private readonly database: Database) {}

  async onModuleInit() {
    if (currentProfile() !== 'vulnerable') {
      await this.database.query('UPDATE users SET password_plain=NULL WHERE password_plain IS NOT NULL');
    }
  }

  private secret() {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET absent');
    return secret;
  }

  private rateKey(email: string) { return email.trim().toLowerCase().slice(0, 160); }

  private assertRateLimit(key: string) {
    const attempt = this.attempts.get(key);
    if (attempt && attempt.resetAt > Date.now() && attempt.count >= 5) {
      throw new HttpException('Authentification temporairement limitée', 429);
    }
    if (attempt && attempt.resetAt <= Date.now()) this.attempts.delete(key);
  }

  private recordFailure(key: string) {
    const current = this.attempts.get(key);
    this.attempts.set(key, current && current.resetAt > Date.now()
      ? { ...current, count: current.count + 1 }
      : { count: 1, resetAt: Date.now() + 60_000 });
  }

  async login(email: string, password: string) {
    const profile = currentProfile();
    const normalized = this.rateKey(email);
    if (profile !== 'vulnerable') this.assertRateLimit(normalized);
    const result = await this.database.query<UserRow>(
      'SELECT id,email,role,password_plain,password_hash FROM users WHERE lower(email)=$1 AND deleted_at IS NULL', [normalized],
    );
    const user = result.rows[0];

    if (profile === 'vulnerable') {
      if (!user) throw new UnauthorizedException('Compte synthétique inconnu');
      if (user.password_plain !== password) throw new UnauthorizedException('Mot de passe synthétique incorrect');
      return this.issue(user, false);
    }

    const verified = await bcrypt.compare(password, user?.password_hash ?? DUMMY_HASH);
    if (!user || !verified) {
      this.recordFailure(normalized);
      throw new UnauthorizedException('Identifiants invalides');
    }
    this.attempts.delete(normalized);
    if (user.password_hash && bcrypt.getRounds(user.password_hash) < BCRYPT_COST) {
      await this.database.query('UPDATE users SET password_hash=$1 WHERE id=$2', [await bcrypt.hash(password, BCRYPT_COST), user.id]);
    }
    await this.database.query('UPDATE sessions SET revoked_at=now() WHERE user_id=$1 AND revoked_at IS NULL', [user.id]);
    return this.issue(user, true);
  }

  private async issue(user: UserRow, secure: boolean) {
    const sid = randomUUID();
    const lifetime = secure ? "interval '15 minutes'" : "interval '10 years'";
    await this.database.query(
      `INSERT INTO sessions(id,user_id,token_id,expires_at) VALUES($1,$2,$3,now()+${lifetime})`,
      [randomUUID(), user.id, sid],
    );
    const claims = { sub: user.id, role: user.role, sid };
    const token = secure ? jwt.sign(claims, this.secret(), { expiresIn: '15m' }) : jwt.sign(claims, this.secret());
    return { accessToken: token, tokenType: 'Bearer', expiresIn: secure ? 900 : null, profile: currentProfile() };
  }

  async verify(token: string): Promise<Principal> {
    let principal: Principal;
    try { principal = jwt.verify(token, this.secret()) as Principal; }
    catch { throw new UnauthorizedException('Jeton invalide ou expiré'); }
    if (currentProfile() === 'vulnerable') return principal;
    const session = await this.database.query(
      'SELECT 1 FROM sessions WHERE token_id=$1 AND user_id=$2 AND revoked_at IS NULL AND expires_at>now()',
      [principal.sid, principal.sub],
    );
    if (!session.rowCount) throw new UnauthorizedException('Session expirée ou révoquée');
    return principal;
  }

  async revoke(principal: Principal) {
    await this.database.query('UPDATE sessions SET revoked_at=now() WHERE token_id=$1 AND user_id=$2', [principal.sid, principal.sub]);
  }

  async reauthenticate(userId: string, password: string) {
    const result = await this.database.query<{ password_hash: string | null }>('SELECT password_hash FROM users WHERE id=$1', [userId]);
    return bcrypt.compare(password, result.rows[0]?.password_hash ?? DUMMY_HASH);
  }
}
