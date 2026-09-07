export type LabProfile = 'vulnerable' | 'remediated' | 'cookie';

export interface Principal {
  sub: string;
  role: 'learner' | 'support';
  sid: string;
}

export interface LabEvent<T extends Record<string, unknown>> {
  eventId: string;
  eventType: string;
  eventVersion: 1;
  occurredAt: string;
  correlationId: string;
  data: T;
}

export const SYNTHETIC_IDS = {
  alice: '10000000-0000-4000-8000-000000000001',
  bob: '10000000-0000-4000-8000-000000000002',
  support: '10000000-0000-4000-8000-000000000003',
  aliceOrder: '30000000-0000-4000-8000-000000000001',
  bobOrder: '30000000-0000-4000-8000-000000000002',
} as const;
