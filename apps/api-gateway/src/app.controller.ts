import { randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  Body, Controller, Delete, ForbiddenException, Get, Headers, HttpCode,
  NotFoundException, Param, Post, Query, Req, Res, UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import type { Principal } from '../../../packages/contracts/src';
import { AuthService } from './auth.service';
import { Database } from './database';
import { EventBus } from './event-bus';
import { currentProfile, vulnerableWarning } from './profile';

type LoginBody = { email?: string; password?: string };
type BioBody = { bio?: string };
const web = (name: string) => readFileSync(join(process.cwd(), 'apps/web-client', name), 'utf8');

@Controller()
export class AppController {
  private readonly csrfTokens = new Map<string, string>();

  constructor(
    private readonly database: Database,
    private readonly auth: AuthService,
    private readonly events: EventBus,
  ) {}

  private async principal(request: Request): Promise<Principal> {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('Bearer requis');
    return this.auth.verify(header.slice(7));
  }

  private assertCookieProfile() {
    if (currentProfile() !== 'cookie') throw new ForbiddenException('Route réservée au profil cookie');
  }

  @Get('/') index(@Res() response: Response) { response.type('html').send(web('index.html')); }
  @Get('/styles.css') styles(@Res() response: Response) { response.type('css').send(web('styles.css')); }
  @Get('/app.js') script(@Res() response: Response) {
    response.type('js').send(web(currentProfile() === 'vulnerable' ? 'app.vulnerable.js' : 'app.remediated.js'));
  }

  @Get('/health')
  health() {
    const profile = currentProfile();
    return { status: 'ok', repository: 'ynov-b3-formaflow-security-lab', profile, warning: vulnerableWarning(profile) };
  }

  @Post('/api/auth/login')
  @HttpCode(200)
  login(@Body() body: LoginBody) { return this.auth.login(body.email ?? '', body.password ?? ''); }

  @Post('/api/auth/logout')
  @HttpCode(204)
  async logout(@Req() request: Request) { await this.auth.revoke(await this.principal(request)); }

  @Get('/api/catalog')
  async catalog(@Query('q') q = '') {
    const term = q.slice(0, 120);
    const result = currentProfile() === 'vulnerable'
      ? await this.database.vulnerableCatalogSearch(term)
      : await this.database.remediatedCatalogSearch(term);
    return result.rows;
  }

  @Get('/api/profile')
  async profile(@Req() request: Request) {
    const actor = await this.principal(request);
    const result = await this.database.query(
      'SELECT id,email,display_name,bio,role,newsletter FROM users WHERE id=$1 AND deleted_at IS NULL', [actor.sub],
    );
    return result.rows[0];
  }

  @Post('/api/profile/bio')
  async updateBio(@Req() request: Request, @Body() body: BioBody) {
    const actor = await this.principal(request);
    const bio = (body.bio ?? '').slice(0, 500);
    const result = await this.database.query('UPDATE users SET bio=$1 WHERE id=$2 RETURNING id,bio', [bio, actor.sub]);
    return result.rows[0];
  }

  @Get('/api/orders/:id')
  async order(@Req() request: Request, @Param('id') id: string) {
    const actor = await this.principal(request);
    const result = await this.database.query<{ id: string; owner_id: string; label: string; amount_cents: number; payment_status: string }>(
      'SELECT id,owner_id,label,amount_cents,payment_status FROM orders WHERE id=$1', [id],
    );
    const order = result.rows[0];
    if (!order) throw new NotFoundException('Commande synthétique absente');
    if (currentProfile() !== 'vulnerable' && order.owner_id !== actor.sub && actor.role !== 'support') {
      throw new ForbiddenException('Accès à cette commande interdit');
    }
    return order;
  }

  @Post('/api/enrollments')
  async enroll(@Req() request: Request, @Body() body: { courseId?: string }) {
    const actor = await this.principal(request);
    const id = randomUUID();
    const courseId = body.courseId ?? '20000000-0000-4000-8000-000000000001';
    await this.database.query('INSERT INTO enrollments(id,user_id,course_id,status) VALUES($1,$2,$3,$4)', [id, actor.sub, courseId, 'confirmed']);
    const event = await this.events.publish('enrollment.created.v1', { enrollmentId: id, userId: actor.sub, courseId });
    return { id, status: 'confirmed', payment: 'simulated', notification: 'queued', eventId: event.eventId };
  }

  @Get('/api/export')
  async exportData(@Req() request: Request) {
    const actor = await this.principal(request);
    const user = await this.database.query('SELECT id,email,display_name,bio,newsletter FROM users WHERE id=$1', [actor.sub]);
    const orders = await this.database.query('SELECT id,label,amount_cents,payment_status FROM orders WHERE owner_id=$1', [actor.sub]);
    const enrollments = await this.database.query('SELECT id,course_id,status FROM enrollments WHERE user_id=$1', [actor.sub]);
    return { generatedAt: new Date().toISOString(), subjectId: actor.sub, user: user.rows[0], orders: orders.rows, enrollments: enrollments.rows };
  }

  @Delete('/api/account')
  async deleteAccount(@Req() request: Request) {
    const actor = await this.principal(request);
    await this.database.query('UPDATE users SET deleted_at=now() WHERE id=$1', [actor.sub]);
    await this.events.publish('account.deletion.requested.v1', { userId: actor.sub });
    await this.auth.revoke(actor);
    return { accepted: true, scope: 'distributed-erasure-request' };
  }

  @Post('/cookie/vulnerable/login')
  @HttpCode(200)
  async vulnerableCookieLogin(@Body() body: LoginBody, @Res({ passthrough: true }) response: Response) {
    this.assertCookieProfile();
    const result = await this.auth.login(body.email ?? '', body.password ?? '');
    response.cookie('lab_session', result.accessToken, { httpOnly: false, sameSite: false, secure: false });
    return { authenticated: true, variant: 'vulnerable' };
  }

  @Post('/cookie/vulnerable/account/delete')
  async vulnerableCookieDelete(@Req() request: Request) {
    this.assertCookieProfile();
    const token = request.cookies?.lab_session as string | undefined;
    if (!token) throw new UnauthorizedException('Cookie requis');
    const actor = await this.auth.verify(token);
    await this.database.query('UPDATE users SET deleted_at=now() WHERE id=$1', [actor.sub]);
    return { accepted: true, csrfProtection: false };
  }

  @Post('/cookie/login')
  @HttpCode(200)
  async cookieLogin(@Body() body: LoginBody, @Res({ passthrough: true }) response: Response) {
    this.assertCookieProfile();
    const result = await this.auth.login(body.email ?? '', body.password ?? '');
    const actor = await this.auth.verify(result.accessToken);
    const csrfToken = randomUUID();
    this.csrfTokens.set(actor.sid, csrfToken);
    response.cookie('lab_session', result.accessToken, { httpOnly: true, sameSite: 'strict', secure: true, maxAge: 900_000 });
    return { authenticated: true, csrfToken, variant: 'remediated' };
  }

  @Post('/cookie/account/delete')
  async cookieDelete(
    @Req() request: Request,
    @Headers('origin') origin: string | undefined,
    @Headers('x-csrf-token') csrfToken: string | undefined,
    @Body() body: { password?: string },
  ) {
    this.assertCookieProfile();
    const token = request.cookies?.lab_session as string | undefined;
    if (!token) throw new UnauthorizedException('Cookie requis');
    const actor = await this.auth.verify(token);
    if (origin !== (process.env.ALLOWED_ORIGIN ?? 'https://127.0.0.1:3443')) throw new ForbiddenException('Origine refusée');
    if (!csrfToken || this.csrfTokens.get(actor.sid) !== csrfToken) throw new ForbiddenException('Jeton anti-CSRF invalide');
    if (!await this.auth.reauthenticate(actor.sub, body.password ?? '')) throw new ForbiddenException('Réauthentification requise');
    await this.database.query('UPDATE users SET deleted_at=now() WHERE id=$1', [actor.sub]);
    this.csrfTokens.delete(actor.sid);
    await this.auth.revoke(actor);
    return { accepted: true, csrfProtection: true };
  }
}
