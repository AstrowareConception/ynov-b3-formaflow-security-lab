import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { Pool, type QueryResultRow } from 'pg';

@Injectable()
export class Database implements OnModuleDestroy {
  private readonly pool: Pool;

  constructor() {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) throw new Error('DATABASE_URL absent');
    this.pool = new Pool({ connectionString, statement_timeout: 2_000, query_timeout: 2_500 });
  }

  query<T extends QueryResultRow>(text: string, values: unknown[] = []) {
    return this.pool.query<T>(text, values);
  }

  // Adaptateur volontairement vulnérable, limité au seul scénario SQLi local.
  vulnerableCatalogSearch(term: string) {
    const sql = `SELECT id, title, description FROM catalog WHERE title ILIKE '%${term}%' ORDER BY title LIMIT 20`;
    return this.pool.query(sql);
  }

  remediatedCatalogSearch(term: string) {
    return this.pool.query(
      "SELECT id, title, description FROM catalog WHERE title ILIKE '%' || $1 || '%' ORDER BY title LIMIT 20",
      [term],
    );
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
