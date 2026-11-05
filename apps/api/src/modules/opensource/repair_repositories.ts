import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { prisma } from '../../config/index.js';
import { normalizeRepository } from './repository.normalizer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function repairStoredRepositories(): Promise<{
  repairedRepos: number;
  repairedIssues: number;
  totalRepos: number;
}> {
  // Load canonical overview catalog for reference mappings
  const overviewPath = path.resolve(__dirname, '../../database/data/oss_overview.json');
  const nameToRepoMap = new Map<string, { owner: string; name: string; fullName: string; language: string; stars: number }>();

  if (fs.existsSync(overviewPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(overviewPath, 'utf8'));
      if (Array.isArray(data.repos)) {
        for (const r of data.repos) {
          const repoLink = r.repoLink || r.full_name;
          if (repoLink && repoLink.includes('/')) {
            const [owner, name] = repoLink.split('/');
            nameToRepoMap.set(name.toLowerCase(), {
              owner,
              name,
              fullName: `${owner}/${name}`,
              language: r.language || 'TypeScript',
              stars: r.stargazers_count || 1000,
            });
          }
        }
      }
    } catch (e) {
      console.error('Failed reading oss_overview.json for repo repair:', e);
    }
  }

  let repairedRepos = 0;
  let repairedIssues = 0;

  // 1. Fetch all repos that have undefined owner or undefined in fullName
  const badRepos = await prisma.ossRepository.findMany({
    where: {
      OR: [
        { owner: 'undefined' },
        { fullName: { startsWith: 'undefined/' } },
      ],
    },
    include: {
      issues: true,
    },
  });

  for (const repo of badRepos) {
    const cleanName = repo.name.replace(/^undefined\//, '').trim();
    const mapped = nameToRepoMap.get(cleanName.toLowerCase());

    const realOwner = mapped ? mapped.owner : (cleanName === 'angular' ? 'angular' : 'unknown');
    const realFullName = mapped ? mapped.fullName : `${realOwner}/${cleanName}`;

    if (realOwner !== 'unknown') {
      // Check if target valid repo already exists
      const existingValid = await prisma.ossRepository.findUnique({
        where: { fullName: realFullName },
      });

      if (existingValid && existingValid.id !== repo.id) {
        // Move issues from bad repo to valid repo, then delete bad repo
        await prisma.ossIssue.updateMany({
          where: { repositoryId: repo.id },
          data: { repositoryId: existingValid.id },
        });
        await prisma.ossRepository.delete({ where: { id: repo.id } });
      } else {
        await prisma.ossRepository.update({
          where: { id: repo.id },
          data: {
            owner: realOwner,
            fullName: realFullName,
            name: cleanName,
          },
        });
      }
      repairedRepos++;
    }
  }

  // 2. Audit and repair issues with GitHub URLs pointing to distinct repositories
  const allIssues = await prisma.ossIssue.findMany({
    include: { repository: true },
  });

  for (const issue of allIssues) {
    if (!issue.url || !issue.url.includes('github.com/')) continue;
    const parts = issue.url.split('github.com/')[1]?.split('/');
    if (parts && parts.length >= 2) {
      const targetOwner = parts[0];
      const targetName = parts[1];
      const targetFullName = `${targetOwner}/${targetName}`;

      if (targetOwner && targetOwner !== 'undefined' && targetName && targetName !== 'undefined') {
        // If issue is currently linked to undefined repo or wrong repo
        if (!issue.repository || issue.repository.owner === 'undefined' || issue.repository.fullName.startsWith('undefined/')) {
          let targetRepo = await prisma.ossRepository.findUnique({
            where: { fullName: targetFullName },
          });

          if (!targetRepo) {
            targetRepo = await prisma.ossRepository.create({
              data: {
                fullName: targetFullName,
                owner: targetOwner,
                name: targetName,
                description: `Open source repository ${targetFullName}`,
                language: 'TypeScript',
                isVerified: true,
              },
            });
          }

          await prisma.ossIssue.update({
            where: { id: issue.id },
            data: { repositoryId: targetRepo.id },
          });
          repairedIssues++;
        }
      }
    }
  }

  const totalRepos = await prisma.ossRepository.count();
  return { repairedRepos, repairedIssues, totalRepos };
}
