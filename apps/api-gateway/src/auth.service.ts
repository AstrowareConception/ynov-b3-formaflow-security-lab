import { randomUUID } from 'node:crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import jwt from 'jsonwebtoken';
import type { Principal } from '../../../packages/contracts/src';
import { Database } from './database';
import { currentProfile } from './profile';

type UserRow = { id: string; email: string; role: Principal['role']; password_plain: string | null };

@Injectable()
export class AuthService {
  constructor(private readonly database: Database) {}

  async login(email: string, password: string) {
    const result = await this.database.query<UserRow>(
      'SELECT id, email, role, password_plain FROM users WHERE email = $1 AND deleted_at IS NULL', [email],
    );
    const user = result.rows[0];
    if (!user) throw new UnauthorizedException('Compte synthétique inconnu');
    if (user.password_plain !== password) throw new UnauthorizedException('Mot de passe synthétique incorrect');
    const sid = randomUUID();
    await this.database.query(
      "INSERT INTO sessions(id,user_id,token_id,expires_at) VALUES($1,$2,$3,now()+interval '10 years')",
      [randomUUID(), user.id, sid],
    );
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET absent');
    const token = jwt.sign({ sub: user.id, role: user.role, sid }, secret);
    return { accessToken: token, tokenType: 'Bearer', profile: currentProfile() };
  }

  verify(token: string): Principal {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET absent');
    try {
      return jwt.verify(token, secret) as Principal;
    } catch {
      throw new UnauthorizedException('Jeton invalide');
    }
  }
}
