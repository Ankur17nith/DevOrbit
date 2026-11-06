import { BadRequestError } from '../../../lib/errors.js';

export interface RawProblemInput {
  title: string;
  platform?: string;
  externalId?: string;
  url?: string;
  difficulty?: string;
  topic?: string;
  subtopic?: string;
  tags?: string[];
  constraints?: string;
  sheetCategory?: string;
}

export interface NormalizedProblem {
  title: string;
  slug: string;
  canonicalSlug: string;
  platform: 'LEETCODE' | 'CODEFORCES' | 'STRIVER_A2Z' | 'TLE' | 'TUF' | 'CUSTOM';
  externalId?: string;
  url: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  topic: string;
  subtopic?: string;
  tags: string[];
  constraints?: string;
  sheetCategory?: string;
}

/**
 * Normalizes title into standard URL-safe slug, stripping leading numbers or punctuation.
 * e.g. "1. Two Sum" -> "two-sum"
 * e.g. "15. 3Sum" -> "3sum"
 */
export function generateCanonicalSlug(rawTitle: string): string {
  if (!rawTitle) return 'unnamed-problem';
  return rawTitle
    .toLowerCase()
    .replace(/^\d+[\s\.\-_]+/, '') // remove leading problem numbers
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Normalizes platform difficulty into standard EASY | MEDIUM | HARD.
 */
export function normalizeDifficulty(diff?: string | number, platform: string = 'LEETCODE'): 'EASY' | 'MEDIUM' | 'HARD' {
  if (typeof diff === 'number' || (typeof diff === 'string' && /^\d+$/.test(diff))) {
    const rating = typeof diff === 'number' ? diff : parseInt(diff, 10);
    if (rating <= 1200) return 'EASY';
    if (rating <= 1800) return 'MEDIUM';
    return 'HARD';
  }

  const normalized = String(diff || 'MEDIUM').toUpperCase().trim();
  if (normalized.includes('EASY') || normalized === 'A' || normalized === 'B' || normalized === 'BASIC') {
    return 'EASY';
  }
  if (normalized.includes('HARD') || normalized === 'D' || normalized === 'E' || normalized === 'F' || normalized === 'ADVANCED') {
    return 'HARD';
  }
  return 'MEDIUM';
}

/**
 * Normalizes input problem data into unified DevOrbit schema.
 */
export function normalizeProblem(raw: RawProblemInput): NormalizedProblem {
  const cleanTitle = raw.title.replace(/^\d+[\s\.\-_]+/, '').trim();
  const canonical = generateCanonicalSlug(cleanTitle);
  const platform = (raw.platform || 'LEETCODE').toUpperCase() as any;
  const slug = `${canonical}-${platform.toLowerCase()}`;
  const difficulty = normalizeDifficulty(raw.difficulty, platform);
  const topic = raw.topic?.trim() || 'General Algorithms';

  let validatedUrl = `https://leetcode.com/problems/${canonical}/`;
  if (raw.url) {
    try {
      const parsed = new URL(raw.url);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new BadRequestError(`Invalid problem URL protocol: ${parsed.protocol}. Only HTTP and HTTPS URLs are allowed.`);
      }
      validatedUrl = raw.url;
    } catch (err: any) {
      if (err instanceof BadRequestError) throw err;
      throw new BadRequestError(`Invalid problem URL: ${raw.url}`);
    }
  }

  return {
    title: cleanTitle,
    slug,
    canonicalSlug: canonical,
    platform: ['LEETCODE', 'CODEFORCES', 'STRIVER_A2Z', 'TLE', 'TUF', 'CUSTOM'].includes(platform) ? platform : 'CUSTOM',
    externalId: raw.externalId,
    url: validatedUrl,
    difficulty,
    topic,
    subtopic: raw.subtopic?.trim(),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    constraints: raw.constraints,
    sheetCategory: raw.sheetCategory || 'STRIVER_A2Z',
  };
}
