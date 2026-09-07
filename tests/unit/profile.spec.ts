import { currentProfile, vulnerableWarning } from '../../apps/api-gateway/src/profile';

describe('sélection explicite du profil', () => {
  test.each(['vulnerable', 'remediated', 'cookie'] as const)('accepte %s', (profile) => {
    expect(currentProfile({ LAB_PROFILE: profile })).toBe(profile);
  });
  test('refuse une valeur absente ou ambiguë', () => {
    expect(() => currentProfile({})).toThrow(/explicitement/);
    expect(() => currentProfile({ LAB_PROFILE: 'production' })).toThrow(/explicitement/);
  });
  test('rend l’avertissement vulnérable vérifiable', () => {
    expect(vulnerableWarning('vulnerable')).toMatch(/VOLONTAIREMENT VULNERABLE/);
    expect(vulnerableWarning('remediated')).toBeNull();
  });
});
