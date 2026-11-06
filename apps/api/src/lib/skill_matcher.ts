const SKILL_SYNONYMS: Record<string, string> = {
  golang: 'go',
  'c++': 'cpp',
  'c#': 'csharp',
  js: 'javascript',
  ts: 'typescript',
  py: 'python',
  rs: 'rust',
  rb: 'ruby',
};

export function normalizeSkill(skill: string): string {
  const s = skill.trim().toLowerCase();
  return SKILL_SYNONYMS[s] || s;
}

/**
 * Tokenized exact (case-insensitive) skill matching using synonym mapping.
 * Avoids substring bugs where "go" matches "google" or "c" matches everything.
 */
export function matchSkillToken(candidate: string, targetSkill: string): boolean {
  if (!candidate || !targetSkill) return false;
  const normalizedTarget = normalizeSkill(targetSkill);

  const candidateLower = candidate.trim().toLowerCase();
  if (normalizeSkill(candidateLower) === normalizedTarget) return true;

  const tokens = candidateLower
    .split(/[^a-z0-9+#]+/)
    .map(t => normalizeSkill(t))
    .filter(Boolean);

  return tokens.includes(normalizedTarget);
}
