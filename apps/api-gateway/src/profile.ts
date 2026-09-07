import type { LabProfile } from '../../../packages/contracts/src';

const ALLOWED = new Set<LabProfile>(['vulnerable', 'remediated', 'cookie']);

export function currentProfile(environment: NodeJS.ProcessEnv = process.env): LabProfile {
  const value = environment.LAB_PROFILE;
  if (!value || !ALLOWED.has(value as LabProfile)) {
    throw new Error('LAB_PROFILE doit être explicitement vulnerable, remediated ou cookie');
  }
  return value as LabProfile;
}

export function vulnerableWarning(profile: LabProfile): string | null {
  return profile === 'vulnerable' || profile === 'cookie'
    ? 'ATTENTION: PROFIL VOLONTAIREMENT VULNERABLE - USAGE LOCAL PEDAGOGIQUE UNIQUEMENT'
    : null;
}
