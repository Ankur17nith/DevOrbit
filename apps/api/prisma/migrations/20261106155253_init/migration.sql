-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "avatarUrl" TEXT,
    "bio" TEXT,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "ecoMode" BOOLEAN NOT NULL DEFAULT true,
    "notifyDesktop" BOOLEAN NOT NULL DEFAULT true,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IntegrationCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "encryptedToken" TEXT,
    "encryptedRefreshToken" TEXT,
    "tokenExpiresAt" DATETIME,
    "refreshTokenExpiresAt" DATETIME,
    "username" TEXT,
    "scopes" TEXT,
    "rateLimitRemaining" INTEGER,
    "rateLimitReset" DATETIME,
    "rateLimitTotal" INTEGER,
    "lastSyncedAt" DATETIME,
    "metadataJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "IntegrationCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GithubOAuthState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stateHash" TEXT NOT NULL,
    "userId" TEXT,
    "browserBinding" TEXT,
    "expiresAt" DATETIME NOT NULL,
    "consumedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserGithubRepo" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "githubRepoId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT,
    "languagesJson" TEXT,
    "topicsJson" TEXT,
    "stargazersCount" INTEGER NOT NULL DEFAULT 0,
    "forksCount" INTEGER NOT NULL DEFAULT 0,
    "openIssuesCount" INTEGER NOT NULL DEFAULT 0,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "isFork" BOOLEAN NOT NULL DEFAULT false,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "license" TEXT,
    "pushedAt" DATETIME,
    "etag" TEXT,
    "syncedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserGithubRepo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserContributionMetric" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "totalCommits" INTEGER NOT NULL DEFAULT 0,
    "totalPullRequests" INTEGER NOT NULL DEFAULT 0,
    "mergedPullRequests" INTEGER NOT NULL DEFAULT 0,
    "mergeRate" REAL NOT NULL DEFAULT 0.0,
    "activeStreak" INTEGER NOT NULL DEFAULT 0,
    "longestStreak" INTEGER NOT NULL DEFAULT 0,
    "commitHeatmapJson" TEXT,
    "languageBytesJson" TEXT,
    "projectTimelineJson" TEXT,
    "lastCalculatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserContributionMetric_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Workspace" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Workspace_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WorkspaceMembership" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'MEMBER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkspaceMembership_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WorkspaceMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OssRepository" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "githubRepoId" INTEGER,
    "fullName" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "description" TEXT,
    "language" TEXT,
    "stargazersCount" INTEGER NOT NULL DEFAULT 0,
    "forksCount" INTEGER NOT NULL DEFAULT 0,
    "openIssuesCount" INTEGER NOT NULL DEFAULT 0,
    "topicsJson" TEXT,
    "license" TEXT,
    "defaultBranch" TEXT NOT NULL DEFAULT 'main',
    "lastPushedAt" DATETIME,
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "OssIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "githubIssueId" BIGINT,
    "repositoryId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "state" TEXT NOT NULL DEFAULT 'open',
    "authorUsername" TEXT,
    "authorAvatarUrl" TEXT,
    "labelsJson" TEXT,
    "difficulty" TEXT,
    "isAssigned" BOOLEAN NOT NULL DEFAULT false,
    "bountyAmount" TEXT,
    "currency" TEXT,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OssIssue_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "OssRepository" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OssProgram" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "category" TEXT,
    "timelineJson" TEXT,
    "deadlineDate" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "OssOrganization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "logoUrl" TEXT,
    "technologiesJson" TEXT,
    "participationYearsJson" TEXT,
    "totalProjects" INTEGER NOT NULL DEFAULT 0,
    "programId" TEXT,
    "platformsJson" TEXT,
    "topicsJson" TEXT,
    "repositoriesJson" TEXT,
    "sourceProvenance" TEXT,
    "hasBeginnerIssues" BOOLEAN NOT NULL DEFAULT false,
    "openOpportunitiesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OssOrganization_programId_fkey" FOREIGN KEY ("programId") REFERENCES "OssProgram" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserBookmark" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "repositoryId" TEXT,
    "issueId" TEXT,
    "organizationId" TEXT,
    "note" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserBookmark_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBookmark_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "OssRepository" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBookmark_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "OssIssue" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserBookmark_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "OssOrganization" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DsaProblem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "externalId" TEXT,
    "platform" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "canonicalSlug" TEXT,
    "difficulty" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "subtopic" TEXT,
    "tagsJson" TEXT,
    "constraints" TEXT,
    "sheetCategory" TEXT,
    "url" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "UserDsaProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "problemId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TODO',
    "solutionMode" TEXT,
    "masteryScore" REAL NOT NULL DEFAULT 0.0,
    "confidenceRating" INTEGER,
    "repetitionCount" INTEGER NOT NULL DEFAULT 0,
    "easeFactor" REAL NOT NULL DEFAULT 2.5,
    "reviewIntervalDays" INTEGER NOT NULL DEFAULT 1,
    "repeatedMistakesJson" TEXT,
    "attemptsCount" INTEGER NOT NULL DEFAULT 0,
    "timeSpentSeconds" INTEGER NOT NULL DEFAULT 0,
    "hintUsed" BOOLEAN NOT NULL DEFAULT false,
    "codeSnippet" TEXT,
    "notes" TEXT,
    "nextReviewDate" DATETIME,
    "lastSolvedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserDsaProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserDsaProgress_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "DsaProblem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSkillProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "confidenceScore" REAL NOT NULL DEFAULT 0.0,
    "verifiedEvidenceJson" TEXT,
    "lastEvaluatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSkillProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ContributionPipelineItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "stage" TEXT NOT NULL DEFAULT 'SHORTLISTED',
    "prUrl" TEXT,
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "notes" TEXT,
    "deadline" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ContributionPipelineItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ContributionPipelineItem_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "OssIssue" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SelfbotConfig" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "repositoryFullName" TEXT NOT NULL,
    "welcomeMessage" TEXT,
    "welcomeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "goodbyeMessage" TEXT,
    "goodbyeEnabled" BOOLEAN NOT NULL DEFAULT false,
    "slashCommandsJson" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "SelfbotConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForumPost" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tagsJson" TEXT,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "isSolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ForumPost_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ForumReply" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "postId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isAcceptedAnswer" BOOLEAN NOT NULL DEFAULT false,
    "upvotes" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ForumReply_postId_fkey" FOREIGN KEY ("postId") REFERENCES "ForumPost" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ForumReply_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiConversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL DEFAULT 'New Conversation',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AiConversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AiMessage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT,
    "isFallback" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AiMessage_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "AiConversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReconProject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "targetUrl" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "fullScreenshotPath" TEXT,
    "extractedTokensJson" TEXT,
    "componentHierarchyJson" TEXT,
    "generatedCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ReconProject_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "linkUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeveloperProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "headline" TEXT,
    "bio" TEXT,
    "githubUsername" TEXT,
    "codeforcesHandle" TEXT,
    "leetcodeUsername" TEXT,
    "preferredLanguagesJson" TEXT,
    "domainsJson" TEXT,
    "experienceLevel" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
    "weeklyAvailabilityHours" INTEGER DEFAULT 10,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeveloperProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeveloperSkill" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "skillName" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'LANGUAGE',
    "confidenceScore" INTEGER NOT NULL DEFAULT 50,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "evidenceCount" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DeveloperSkill_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "DeveloperProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "DeveloperInterest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "weight" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "DeveloperInterest_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "DeveloperProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReadmeSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "repositoryFullName" TEXT,
    "contentRaw" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReadmeSnapshot_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "DeveloperProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReadmeExtractedSignal" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snapshotId" TEXT NOT NULL,
    "signalType" TEXT NOT NULL,
    "signalKey" TEXT NOT NULL,
    "signalValue" TEXT NOT NULL,
    "confidence" REAL NOT NULL DEFAULT 1.0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ReadmeExtractedSignal_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "ReadmeSnapshot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSavedOrganization" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "UserSavedOrganization_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "OssOrganization" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserSavedOrganization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Recommendation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "targetType" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "category" TEXT NOT NULL,
    "factorsJson" TEXT NOT NULL,
    "explanation" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Recommendation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RecommendationFeedback" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "recommendationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "reason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecommendationFeedback_recommendationId_fkey" FOREIGN KEY ("recommendationId") REFERENCES "Recommendation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_userId_key" ON "UserPreference"("userId");

-- CreateIndex
CREATE INDEX "IntegrationCredential_userId_idx" ON "IntegrationCredential"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "IntegrationCredential_userId_provider_key" ON "IntegrationCredential"("userId", "provider");

-- CreateIndex
CREATE UNIQUE INDEX "GithubOAuthState_stateHash_key" ON "GithubOAuthState"("stateHash");

-- CreateIndex
CREATE INDEX "GithubOAuthState_userId_idx" ON "GithubOAuthState"("userId");

-- CreateIndex
CREATE INDEX "UserGithubRepo_userId_idx" ON "UserGithubRepo"("userId");

-- CreateIndex
CREATE INDEX "UserGithubRepo_fullName_idx" ON "UserGithubRepo"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "UserGithubRepo_userId_githubRepoId_key" ON "UserGithubRepo"("userId", "githubRepoId");

-- CreateIndex
CREATE UNIQUE INDEX "UserContributionMetric_userId_key" ON "UserContributionMetric"("userId");

-- CreateIndex
CREATE INDEX "UserContributionMetric_userId_idx" ON "UserContributionMetric"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Workspace_slug_key" ON "Workspace"("slug");

-- CreateIndex
CREATE INDEX "Workspace_ownerId_idx" ON "Workspace"("ownerId");

-- CreateIndex
CREATE INDEX "WorkspaceMembership_workspaceId_idx" ON "WorkspaceMembership"("workspaceId");

-- CreateIndex
CREATE INDEX "WorkspaceMembership_userId_idx" ON "WorkspaceMembership"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkspaceMembership_workspaceId_userId_key" ON "WorkspaceMembership"("workspaceId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "OssRepository_githubRepoId_key" ON "OssRepository"("githubRepoId");

-- CreateIndex
CREATE UNIQUE INDEX "OssRepository_fullName_key" ON "OssRepository"("fullName");

-- CreateIndex
CREATE INDEX "OssRepository_language_idx" ON "OssRepository"("language");

-- CreateIndex
CREATE INDEX "OssRepository_stargazersCount_idx" ON "OssRepository"("stargazersCount");

-- CreateIndex
CREATE INDEX "OssRepository_fullName_idx" ON "OssRepository"("fullName");

-- CreateIndex
CREATE UNIQUE INDEX "OssIssue_githubIssueId_key" ON "OssIssue"("githubIssueId");

-- CreateIndex
CREATE INDEX "OssIssue_repositoryId_idx" ON "OssIssue"("repositoryId");

-- CreateIndex
CREATE INDEX "OssIssue_difficulty_idx" ON "OssIssue"("difficulty");

-- CreateIndex
CREATE INDEX "OssIssue_state_idx" ON "OssIssue"("state");

-- CreateIndex
CREATE INDEX "OssIssue_state_createdAt_idx" ON "OssIssue"("state", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "OssProgram_slug_key" ON "OssProgram"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "OssOrganization_slug_key" ON "OssOrganization"("slug");

-- CreateIndex
CREATE INDEX "OssOrganization_name_idx" ON "OssOrganization"("name");

-- CreateIndex
CREATE INDEX "UserBookmark_userId_idx" ON "UserBookmark"("userId");

-- CreateIndex
CREATE INDEX "UserBookmark_targetType_idx" ON "UserBookmark"("targetType");

-- CreateIndex
CREATE INDEX "DsaProblem_difficulty_idx" ON "DsaProblem"("difficulty");

-- CreateIndex
CREATE INDEX "DsaProblem_topic_idx" ON "DsaProblem"("topic");

-- CreateIndex
CREATE INDEX "DsaProblem_canonicalSlug_idx" ON "DsaProblem"("canonicalSlug");

-- CreateIndex
CREATE INDEX "DsaProblem_sheetCategory_idx" ON "DsaProblem"("sheetCategory");

-- CreateIndex
CREATE UNIQUE INDEX "DsaProblem_platform_slug_key" ON "DsaProblem"("platform", "slug");

-- CreateIndex
CREATE INDEX "UserDsaProgress_userId_idx" ON "UserDsaProgress"("userId");

-- CreateIndex
CREATE INDEX "UserDsaProgress_status_idx" ON "UserDsaProgress"("status");

-- CreateIndex
CREATE INDEX "UserDsaProgress_solutionMode_idx" ON "UserDsaProgress"("solutionMode");

-- CreateIndex
CREATE INDEX "UserDsaProgress_nextReviewDate_idx" ON "UserDsaProgress"("nextReviewDate");

-- CreateIndex
CREATE UNIQUE INDEX "UserDsaProgress_userId_problemId_key" ON "UserDsaProgress"("userId", "problemId");

-- CreateIndex
CREATE INDEX "UserSkillProfile_userId_idx" ON "UserSkillProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSkillProfile_userId_skillName_key" ON "UserSkillProfile"("userId", "skillName");

-- CreateIndex
CREATE INDEX "ContributionPipelineItem_userId_idx" ON "ContributionPipelineItem"("userId");

-- CreateIndex
CREATE INDEX "ContributionPipelineItem_stage_idx" ON "ContributionPipelineItem"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "ContributionPipelineItem_userId_issueId_key" ON "ContributionPipelineItem"("userId", "issueId");

-- CreateIndex
CREATE INDEX "SelfbotConfig_userId_idx" ON "SelfbotConfig"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SelfbotConfig_userId_repositoryFullName_key" ON "SelfbotConfig"("userId", "repositoryFullName");

-- CreateIndex
CREATE INDEX "ForumPost_userId_idx" ON "ForumPost"("userId");

-- CreateIndex
CREATE INDEX "ForumPost_createdAt_idx" ON "ForumPost"("createdAt");

-- CreateIndex
CREATE INDEX "ForumReply_postId_idx" ON "ForumReply"("postId");

-- CreateIndex
CREATE INDEX "ForumReply_userId_idx" ON "ForumReply"("userId");

-- CreateIndex
CREATE INDEX "AiConversation_userId_idx" ON "AiConversation"("userId");

-- CreateIndex
CREATE INDEX "AiMessage_conversationId_idx" ON "AiMessage"("conversationId");

-- CreateIndex
CREATE INDEX "ReconProject_userId_idx" ON "ReconProject"("userId");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_createdAt_idx" ON "Notification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperProfile_userId_key" ON "DeveloperProfile"("userId");

-- CreateIndex
CREATE INDEX "DeveloperProfile_userId_idx" ON "DeveloperProfile"("userId");

-- CreateIndex
CREATE INDEX "DeveloperSkill_profileId_idx" ON "DeveloperSkill"("profileId");

-- CreateIndex
CREATE INDEX "DeveloperSkill_skillName_idx" ON "DeveloperSkill"("skillName");

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperSkill_profileId_skillName_key" ON "DeveloperSkill"("profileId", "skillName");

-- CreateIndex
CREATE INDEX "DeveloperInterest_profileId_idx" ON "DeveloperInterest"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "DeveloperInterest_profileId_topic_key" ON "DeveloperInterest"("profileId", "topic");

-- CreateIndex
CREATE INDEX "ReadmeSnapshot_profileId_idx" ON "ReadmeSnapshot"("profileId");

-- CreateIndex
CREATE INDEX "ReadmeExtractedSignal_snapshotId_idx" ON "ReadmeExtractedSignal"("snapshotId");

-- CreateIndex
CREATE INDEX "ReadmeExtractedSignal_signalType_idx" ON "ReadmeExtractedSignal"("signalType");

-- CreateIndex
CREATE INDEX "UserSavedOrganization_userId_idx" ON "UserSavedOrganization"("userId");

-- CreateIndex
CREATE INDEX "UserSavedOrganization_organizationId_idx" ON "UserSavedOrganization"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSavedOrganization_userId_organizationId_key" ON "UserSavedOrganization"("userId", "organizationId");

-- CreateIndex
CREATE INDEX "Recommendation_userId_idx" ON "Recommendation"("userId");

-- CreateIndex
CREATE INDEX "Recommendation_targetType_idx" ON "Recommendation"("targetType");

-- CreateIndex
CREATE INDEX "Recommendation_category_idx" ON "Recommendation"("category");

-- CreateIndex
CREATE UNIQUE INDEX "Recommendation_userId_targetId_key" ON "Recommendation"("userId", "targetId");

-- CreateIndex
CREATE INDEX "RecommendationFeedback_recommendationId_idx" ON "RecommendationFeedback"("recommendationId");

-- CreateIndex
CREATE INDEX "RecommendationFeedback_userId_idx" ON "RecommendationFeedback"("userId");
