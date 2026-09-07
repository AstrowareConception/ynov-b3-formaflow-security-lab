import { Body, Controller, Delete, ForbiddenException, Get, Headers, HttpCode, Param, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import type { Request, Response } from 'express';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { randomUUID } from 'node:crypto';
import type { Principal } from '../../../packages/contracts/src';
import { AuthService } from './auth.service';
import { Database } from './database';
import { EventBus } from './event-bus';
import { currentProfile, vulnerableWarning } from './profile';

type LoginBody = { email?: string; password?: string };
type BioBody = { bio?: string };

@Controller()
export class AppController {
  constructor(
    private readonly database: Database,
    private readonly auth: AuthService,
    private readonly events: EventBus,
  ) {}

  private principal(request: Request): Principal {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new UnauthorizedException('Bearer requis');
    return this.auth.verify(header.slice(7));
  }

  @Get('/')
  index(@Res() response: Response) {
    response.type('html').send(readFileSync(join(process.cwd(), 'apps/web-client/index.html'), 'utf8'));
  }

  @Get('/health')
  health() {
    const profile = currentProfile();
    return { status: 'ok', repository: 'ynov-b3-formaflow-security-lab', profile, warning: vulnerableWarning(profile) };
  }

  @Post('/api/auth/login')
  @HttpCode(200)
  login(@Body() body: LoginBody) {
    return this.auth.login(body.email ?? '', body.password ?? '');
  }

  @Get('/api/catalog')
  async catalog(@Query('q') q = '') {
    return (await this.database.vulnerableCatalogSearch(q.slice(0, 120))).rows;
  }

  @Get('/api/profile')
  async profile(@Req() request: Request) {
    const actor = this.principal(request);
    const result = await this.database.query(
      'SELECT id,email,display_name,bio,role,newsletter FROM users WHERE id=$1 AND deleted_at IS NULL', [actor.sub],
    );
    return result.rows[0];
  }

  @Post('/api/profile/bio')
  async updateBio(@Req() request: Request, @Body() body: BioBody) {
    const actor = this.principal(request);
    const bio = (body.bio ?? '').slice(0, 500);
    const result = await this.database.query('UPDATE users SET bio=$1 WHERE id=$2 RETURNING id,bio', [bio, actor.sub]);
    return result.rows[0];
  }

  @Get('/api/orders/:id')
  async order(@Req() request: Request, @Param('id') id: string) {
    this.principal(request);
    const result = await this.database.query(
      'SELECT id,owner_id,label,amount_cents,payment_status FROM orders WHERE id=$1', [id],
    );
    return result.rows[0] ?? null;
  }

  @Post('/api/enrollments')
  async enroll(@Req() request: Request, @Body() body: { courseId?: string }) {
    const actor = this.principal(request);
    const id = randomUUID();
    const courseId = body.courseId ?? '20000000-0000-4000-8000-000000000001';
    await this.database.query('INSERT INTO enrollments(id,user_id,course_id,status) VALUES($1,$2,$3,$4)', [id, actor.sub, courseId, 'confirmed']);
    const event = await this.events.publish('enrollment.created.v1', { enrollmentId: id, userId: actor.sub, courseId });
    return { id, status: 'confirmed', payment: 'simulated', notification: 'queued', eventId: event.eventId };
  }

  @Get('/api/export')
  async exportData(@Req() request: Request) {
    const actor = this.principal(request);
    const user = await this.database.query('SELECT id,email,display_name,bio,newsletter FROM users WHERE id=$1', [actor.sub]);
    const orders = await this.database.query('SELECT id,label,amount_cents,payment_status FROM orders WHERE owner_id=$1', [actor.sub]);
    const enrollments = await this.database.query('SELECT id,course_id,status FROM enrollments WHERE user_id=$1', [actor.sub]);
    return { generatedAt: new Date().toISOString(), subjectId: actor.sub, user: user.rows[0], orders: orders.rows, enrollments: enrollments.rows };
  }

  @Delete('/api/account')
  async deleteAccount(@Req() request: Request) {
    const actor = this.principal(request);
    await this.database.query('UPDATE users SET deleted_at=now() WHERE id=$1', [actor.sub]);
    await this.events.publish('account.deletion.requested.v1', { userId: actor.sub });
    return { accepted: true, scope: 'distributed-erasure-request' };
  }

  @Post('/cookie/login')
  @HttpCode(200)
  async cookieLogin(@Body() body: LoginBody, @Res({ passthrough: true }) response: Response) {
    if (currentProfile() !== 'cookie') throw new ForbiddenException('Route réservée au profil cookie');
    const result = await this.auth.login(body.email ?? '', body.password ?? '');
    response.cookie('lab_session', result.accessToken, { httpOnly: false, sameSite: false, secure: false });
    return { authenticated: true, profile: currentProfile() };
  }

  @Post('/cookie/account/delete')
  async cookieDelete(@Req() request: Request, @Headers('origin') _origin?: string) {
    if (currentProfile() !== 'cookie') throw new ForbiddenException('Route réservée au profil cookie');
    const token = request.cookies?.lab_session as string | undefined;
    if (!token) throw new UnauthorizedException('Cookie requis');
    const actor = this.auth.verify(token);
    await this.database.query('UPDATE users SET deleted_at=now() WHERE id=$1', [actor.sub]);
    return { accepted: true, csrfProtection: false };
  }
}
