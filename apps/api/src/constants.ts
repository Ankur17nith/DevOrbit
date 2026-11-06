export const PIPELINE_STAGES = [
  'SHORTLISTED',
  'EXPLORING',
  'PREPARING',
  'WORKING',
  'PR_SUBMITTED',
  'MERGED',
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const PIPELINE_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;
export type PipelinePriority = (typeof PIPELINE_PRIORITIES)[number];

export const WORKSPACE_ROLES = ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER'] as const;
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number];

export const USER_ROLES = ['USER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const DSA_STATUSES = ['TODO', 'ATTEMPTED', 'SOLVED', 'REVISE'] as const;
export type DsaStatus = (typeof DSA_STATUSES)[number];

export const DSA_SOLUTION_MODES = [
  'INDEPENDENT',
  'WITH_HINTS',
  'WITH_EDITORIAL',
  'WITH_AI',
] as const;
export type DsaSolutionMode = (typeof DSA_SOLUTION_MODES)[number];

export const BOOKMARK_TARGET_TYPES = ['REPOSITORY', 'ISSUE', 'ORGANIZATION'] as const;
export type BookmarkTargetType = (typeof BOOKMARK_TARGET_TYPES)[number];
