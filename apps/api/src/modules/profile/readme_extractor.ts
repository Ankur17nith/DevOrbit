/**
 * DevOrbit README Signal Extraction Engine
 * 
 * Extracts stated skills, technologies, domains, and badges from
 * user profile README (<user>/<user>) and repository READMEs.
 */

export interface ExtractedSignal {
  signalType: 'LANGUAGE' | 'FRAMEWORK' | 'TOOL' | 'DATABASE' | 'DOMAIN' | 'BADGE' | 'EXPERIENCE';
  signalKey: string;
  signalValue: string;
  confidence: number;
}

const KNOWN_LANGUAGES = [
  'TypeScript', 'JavaScript', 'Python', 'Rust', 'Go', 'Golang', 'C++', 'C', 'C#', 
  'Java', 'Kotlin', 'Swift', 'Ruby', 'PHP', 'Solidity', 'Zig', 'Scala', 'Haskell', 'Dart', 'Elixir', 'Julia'
];

const KNOWN_FRAMEWORKS = [
  'React', 'Next.js', 'Vue', 'Nuxt', 'Angular', 'Svelte', 'Node.js', 'Express', 'NestJS',
  'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Tailwind', 'Tailwind CSS', 'GraphQL',
  'PyTorch', 'TensorFlow', 'Electron', 'React Native', 'Flutter', 'Actix', 'Tokio', 'Gin', 'Fiber'
];

const KNOWN_TOOLS = [
  'Docker', 'Kubernetes', 'Git', 'GitHub Actions', 'AWS', 'GCP', 'Azure',
  'PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Prisma', 'Linux', 'Vim', 'Neovim'
];

const KNOWN_DOMAINS = [
  'Web Development', 'Frontend', 'Backend', 'Full Stack', 'Cloud Native', 
  'Distributed Systems', 'DevOps', 'Machine Learning', 'Artificial Intelligence', 
  'Data Science', 'Security', 'Cryptography', 'Web3', 'Blockchain', 'Mobile Development', 
  'Systems Programming', 'Compilers', 'Open Source'
];

export function extractSignalsFromReadme(content: string): ExtractedSignal[] {
  if (!content || typeof content !== 'string') return [];
  const signals: ExtractedSignal[] = [];
  const seen = new Set<string>();

  const addSignal = (signal: ExtractedSignal) => {
    const key = `${signal.signalType}:${signal.signalKey.toLowerCase()}`;
    if (!seen.has(key)) {
      seen.add(key);
      signals.push(signal);
    }
  };

  const normalized = content.replace(/\r\n/g, '\n');

  // 1. Extract Languages
  for (const lang of KNOWN_LANGUAGES) {
    const regex = new RegExp(`\\b${lang.replace('+', '\\+')}\\b`, 'i');
    if (regex.test(normalized)) {
      addSignal({
        signalType: 'LANGUAGE',
        signalKey: lang,
        signalValue: lang,
        confidence: 0.9,
      });
    }
  }

  // 2. Extract Frameworks
  for (const fw of KNOWN_FRAMEWORKS) {
    const regex = new RegExp(`\\b${fw.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(normalized)) {
      addSignal({
        signalType: 'FRAMEWORK',
        signalKey: fw,
        signalValue: fw,
        confidence: 0.85,
      });
    }
  }

  // 3. Extract Tools & Databases
  for (const tool of KNOWN_TOOLS) {
    const regex = new RegExp(`\\b${tool}\\b`, 'i');
    if (regex.test(normalized)) {
      const type = ['PostgreSQL', 'Postgres', 'MySQL', 'MongoDB', 'Redis', 'SQLite', 'Prisma'].includes(tool)
        ? 'DATABASE'
        : 'TOOL';
      addSignal({
        signalType: type,
        signalKey: tool,
        signalValue: tool,
        confidence: 0.8,
      });
    }
  }

  // 4. Extract Focus Domains
  for (const domain of KNOWN_DOMAINS) {
    const regex = new RegExp(`\\b${domain}\\b`, 'i');
    if (regex.test(normalized)) {
      addSignal({
        signalType: 'DOMAIN',
        signalKey: domain,
        signalValue: domain,
        confidence: 0.85,
      });
    }
  }

  // 5. Extract Shields.io / Badges
  const badgeRegex = /!\[([^\]]*)\]\(https:\/\/img\.shields\.io\/[^)]+\)/g;
  let badgeMatch;
  while ((badgeMatch = badgeRegex.exec(normalized)) !== null) {
    const badgeAlt = badgeMatch[1].trim();
    if (badgeAlt) {
      addSignal({
        signalType: 'BADGE',
        signalKey: badgeAlt,
        signalValue: badgeMatch[0],
        confidence: 0.95,
      });
    }
  }

  // 6. Detect Experience Claims
  const expMatch = normalized.match(/(\d+\+?\s+years?(?:\s+of)?\s+experience)/i);
  if (expMatch) {
    addSignal({
      signalType: 'EXPERIENCE',
      signalKey: 'Years of Experience',
      signalValue: expMatch[1],
      confidence: 0.9,
    });
  }

  return signals;
}

export function extractReadmeSignals(content: string, sourceName = 'readme') {
  const rawSignals = extractSignalsFromReadme(content);
  const languages: string[] = [];
  const frameworks: string[] = [];
  const tools: string[] = [];
  const databases: string[] = [];
  const domains: string[] = [];
  const badges: string[] = [];

  for (const s of rawSignals) {
    if (s.signalType === 'LANGUAGE') languages.push(s.signalKey);
    else if (s.signalType === 'FRAMEWORK') frameworks.push(s.signalKey);
    else if (s.signalType === 'TOOL') tools.push(s.signalKey);
    else if (s.signalType === 'DATABASE') databases.push(s.signalKey);
    else if (s.signalType === 'DOMAIN') domains.push(s.signalKey);
    else if (s.signalType === 'BADGE') badges.push(s.signalKey);
  }

  return {
    rawSignals,
    languages,
    frameworks,
    tools,
    databases,
    domains,
    badges,
    summary: `Extracted ${rawSignals.length} signals from ${sourceName}`,
  };
}
