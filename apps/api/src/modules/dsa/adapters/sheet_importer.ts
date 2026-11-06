import { prisma } from '../../../config/index.js';
import { normalizeProblem, RawProblemInput, generateCanonicalSlug } from './deduplication.js';
import { BadRequestError } from '../../../lib/errors.js';

function parseCsvRow(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      if (inQuotes && line[i + 1] === char) {
        current += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current.trim());
  return fields;
}

export class SheetImporter {
  /**
   * Imports problems from CSV text content.
   * CSV format: title,platform,difficulty,topic,subtopic,url,tags
   */
  async importFromCsv(csvContent: string, defaultCategory: string = 'CUSTOM') {
    if (!csvContent || !csvContent.trim()) {
      throw new BadRequestError('CSV content is empty');
    }

    const lines = csvContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length < 2) {
      throw new BadRequestError('CSV must contain a header line and at least one data row');
    }

    if (lines.length > 5001) {
      throw new BadRequestError('CSV file exceeds maximum allowed limit of 5,000 problems');
    }

    const header = parseCsvRow(lines[0]).map(h => h.trim().toLowerCase());
    const titleIdx = header.indexOf('title');
    const platformIdx = header.indexOf('platform');
    const diffIdx = header.indexOf('difficulty');
    const topicIdx = header.indexOf('topic');
    const subtopicIdx = header.indexOf('subtopic');
    const urlIdx = header.indexOf('url');
    const tagsIdx = header.indexOf('tags');

    if (titleIdx === -1) {
      throw new BadRequestError('CSV header must contain a "title" column');
    }

    const parsedProblems: RawProblemInput[] = [];
    for (let i = 1; i < lines.length; i++) {
      const row = parseCsvRow(lines[i]);
      if (row.length === 0 || !row[titleIdx]) continue;

      parsedProblems.push({
        title: row[titleIdx],
        platform: platformIdx !== -1 ? row[platformIdx] : 'LEETCODE',
        difficulty: diffIdx !== -1 ? row[diffIdx] : 'MEDIUM',
        topic: topicIdx !== -1 ? row[topicIdx] : 'General Algorithms',
        subtopic: subtopicIdx !== -1 ? row[subtopicIdx] : undefined,
        url: urlIdx !== -1 ? row[urlIdx] : undefined,
        tags: tagsIdx !== -1 && row[tagsIdx] ? row[tagsIdx].split(';').map(t => t.trim()) : [],
        sheetCategory: defaultCategory,
      });
    }

    return this.importBatch(parsedProblems);
  }

  /**
   * Imports problems from JSON array of objects.
   */
  async importFromJson(jsonProblems: RawProblemInput[], defaultCategory: string = 'CUSTOM') {
    if (!Array.isArray(jsonProblems) || jsonProblems.length === 0) {
      throw new BadRequestError('Invalid or empty JSON array');
    }

    if (jsonProblems.length > 5000) {
      throw new BadRequestError('JSON array exceeds maximum allowed limit of 5,000 problems');
    }

    const prepared = jsonProblems.map(p => ({
      ...p,
      sheetCategory: p.sheetCategory || defaultCategory,
    }));

    return this.importBatch(prepared);
  }

  /**
   * Normalizes, deduplicates, and upserts problems into DsaProblem.
   */
  async importBatch(rawProblems: RawProblemInput[]) {
    let importedCount = 0;
    let deduplicatedCount = 0;
    const resultProblems = [];

    // Pre-normalize all valid problems
    const normalizedList = rawProblems
      .filter(p => p.title && p.title.trim())
      .map(p => normalizeProblem(p));

    const canonicalSlugs = normalizedList.map(n => n.canonicalSlug);
    const existingList = await prisma.dsaProblem.findMany({
      where: {
        canonicalSlug: { in: canonicalSlugs },
      },
    });

    const existingMap = new Map<string, typeof existingList[0]>();
    existingList.forEach(e => {
      existingMap.set(`${e.platform}:${e.canonicalSlug}`, e);
      existingMap.set(`${e.platform}:${e.slug}`, e);
    });

    for (const normalized of normalizedList) {
      const key1 = `${normalized.platform}:${normalized.canonicalSlug}`;
      const key2 = `${normalized.platform}:${normalized.slug}`;
      const existing = existingMap.get(key1) || existingMap.get(key2);

      if (existing) {
        deduplicatedCount++;
        resultProblems.push(existing);
      } else {
        const created = await prisma.dsaProblem.create({
          data: {
            title: normalized.title,
            slug: normalized.slug,
            canonicalSlug: normalized.canonicalSlug,
            platform: normalized.platform,
            externalId: normalized.externalId || null,
            difficulty: normalized.difficulty,
            topic: normalized.topic,
            subtopic: normalized.subtopic || null,
            tagsJson: JSON.stringify(normalized.tags),
            constraints: normalized.constraints || null,
            sheetCategory: normalized.sheetCategory || null,
            url: normalized.url,
          },
        });
        existingMap.set(key1, created);
        existingMap.set(key2, created);
        importedCount++;
        resultProblems.push(created);
      }
    }

    return {
      totalReceived: rawProblems.length,
      importedCount,
      deduplicatedCount,
      problems: resultProblems,
    };
  }
}

export const sheetImporter = new SheetImporter();
