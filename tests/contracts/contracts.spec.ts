import { readFileSync } from 'node:fs';

describe('contrats publics', () => {
  test('OpenAPI 3.1 reste local et couvre les parcours', () => {
    const api = JSON.parse(readFileSync('packages/contracts/openapi/security-lab.openapi.json', 'utf8'));
    expect(api.openapi).toBe('3.1.0');
    expect(api.servers).toEqual([{ url: 'http://127.0.0.1:3000' }]);
    expect(Object.keys(api.paths)).toEqual(expect.arrayContaining(['/api/catalog', '/api/orders/{id}', '/api/export', '/cookie/account/delete']));
  });
  test('les événements minimisent les données', () => {
    const schema = readFileSync('packages/contracts/events/enrollment-created.v1.schema.json', 'utf8');
    expect(schema).not.toMatch(/email|display_name|password|token/i);
    expect(schema).toMatch(/additionalProperties/);
  });
});
