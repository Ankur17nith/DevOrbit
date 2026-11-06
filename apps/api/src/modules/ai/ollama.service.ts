export interface LocalAiResponse {
  source: 'ollama' | 'deterministic_fallback';
  model: string;
  content: string;
  promptTokens?: number;
}

export class OllamaService {
  private baseUrl: string;
  private availabilityCache: { available: boolean; timestamp: number } | null = null;

  constructor(baseUrl: string = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434') {
    this.baseUrl = baseUrl;
  }

  /**
   * Check if local Ollama daemon is reachable (cached for 10 seconds)
   */
  public async isOllamaAvailable(): Promise<boolean> {
    const now = Date.now();
    if (this.availabilityCache && (now - this.availabilityCache.timestamp) < 10000) {
      return this.availabilityCache.available;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: controller.signal });
      clearTimeout(timeoutId);
      const isOk = res.ok;
      this.availabilityCache = { available: isOk, timestamp: now };
      return isOk;
    } catch {
      this.availabilityCache = { available: false, timestamp: now };
      return false;
    }
  }

  /**
   * List installed models in local Ollama daemon
   */
  public async listModels(): Promise<{ name: string; size?: number; modifiedAt?: string }[]> {
    const isOnline = await this.isOllamaAvailable();
    if (!isOnline) return [];

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${this.baseUrl}/api/tags`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (res.ok) {
        const json = (await res.json()) as { models?: { name: string; size?: number; modified_at?: string }[] };
        return (json.models || []).map(m => ({
          name: m.name,
          size: m.size,
          modifiedAt: m.modified_at,
        }));
      }
    } catch {
      // Fallback
    }
    return [];
  }

  /**
   * Generate completion with automatic deterministic fallback and optional chat history
   */
  public async generate(
    prompt: string,
    modelName: string = 'qwen2.5-coder',
    history?: Array<{ role: string; content: string }>
  ): Promise<LocalAiResponse> {
    const isOnline = await this.isOllamaAvailable();

    if (isOnline) {
      try {
        const timeoutMs = parseInt(process.env.OLLAMA_TIMEOUT_MS || '120000', 10);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

        const messages = history && history.length > 0
          ? [...history, { role: 'user', content: prompt }]
          : [{ role: 'user', content: prompt }];

        const res = await fetch(`${this.baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: modelName,
            messages,
            stream: false,
          }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const json = (await res.json()) as {
            message?: { content: string };
            prompt_eval_count?: number;
          };
          if (json.message?.content) {
            return {
              source: 'ollama',
              model: modelName,
              content: json.message.content,
              promptTokens: json.prompt_eval_count,
            };
          }
        }
      } catch {
        // Fall back to deterministic local engine
      }
    }

    // Deterministic Local Rule-Based Fallback
    return {
      source: 'deterministic_fallback',
      model: 'devorbit-deterministic-v1',
      content: this.generateDeterministicResponse(prompt),
    };
  }

  /**
   * Deterministic local developer intelligence fallback
   */
  private generateDeterministicResponse(prompt: string): string {
    const lower = prompt.toLowerCase();

    // 1. Code Review Mode
    if (lower.includes('review') || lower.includes('critique') || lower.includes('lint')) {
      return `### ℹ️ Rule-based tips (no model available)\n\n` +
        `### 🔍 Orbit AI: Code Review Analysis\n\n` +
        `1. **Security & Boundary Validation**: Ensure all external API inputs and route params are validated using Zod schemas before processing.\n` +
        `2. **Error Handling**: Replace generic 500 error propagation with domain-specific \`AppError\` subclasses (\`NotFoundError\`, \`BadRequestError\`, \`ForbiddenError\`).\n` +
        `3. **Performance & Memory**: For database queries returning multiple records, always specify \`select\` or \`take\` pagination limits to prevent memory bloat.\n` +
        `4. **Idempotency**: Verify that state-altering mutations handle duplicate submissions safely.`;
    }

    // 2. Refactor Proposal
    if (lower.includes('refactor') || lower.includes('clean') || lower.includes('optimize')) {
      return `### ℹ️ Rule-based tips (no model available)\n\n` +
        `### ⚡ Orbit AI: Refactoring Recommendation\n\n` +
        `- **Extract Pure Functions**: Move computational logic (e.g. slug generation, ranking, and date math) into standalone testable pure functions.\n` +
        `- **Type Narrowing**: Replace \`any\` or generic objects with strictly typed TypeScript interfaces.\n` +
        `- **Defensive Navigation**: Utilize optional chaining (\`?.\`) and nullish coalescing (\`??\`) to protect against undefined runtime dereferences.\n` +
        `- **Atomic Database Operations**: Wrap multiple dependent Prisma mutations inside \`prisma.$transaction\` blocks.`;
    }

    // 3. Security Audit
    if (lower.includes('security') || lower.includes('vulnerability') || lower.includes('audit')) {
      return `### ℹ️ Rule-based tips (no model available)\n\n` +
        `### 🛡️ Orbit AI: Security Audit Inspection\n\n` +
        `- **Token Security**: GitHub PATs and external secrets must always be encrypted using AES-256-GCM authenticated cipher before persistence.\n` +
        `- **Authorization Guards**: Ensure all protected routes verify user ownership (\`where: { id, userId }\`) to prevent Insecure Direct Object References (IDOR).\n` +
        `- **Session Integrity**: JWT tokens must include unique UUID \`jti\` claims to guarantee millisecond-level collision resistance.\n` +
        `- **Headers**: Maintain \`helmet()\` security headers to mitigate clickjacking and MIME-type sniffing.`;
    }

    // 4. DSA & Algorithms
    if (lower.includes('dsa') || lower.includes('algorithm') || lower.includes('leetcode')) {
      return `### ℹ️ Rule-based tips (no model available)\n\n` +
        `### 🧠 Orbit AI: Algorithmic Intelligence\n\n` +
        `- **Time Complexity Target**: $O(N)$ or $O(N \\log N)$ with space bound to $O(1)$ auxiliary memory where possible.\n` +
        `- **Pattern Classification**: Check Two Pointers, Monotonic Stack, Sliding Window, or Disjoint Set Union (Union-Find).\n` +
        `- **Edge Case Checklist**: Test with: empty array, array of length 1, all duplicate elements, negative numbers, extreme scale ($10^5$).\n` +
        `- **Spaced Repetition**: Log your recall confidence (1 to 5) to let DevOrbit's SM-2 algorithm schedule your next optimal review.`;
    }

    // 5. GSoC & Open Source
    if (lower.includes('gsoc') || lower.includes('oss') || lower.includes('open source')) {
      return `### ℹ️ Rule-based tips (no model available)\n\n` +
        `### 🌟 Orbit AI: Open Source Contribution Strategy\n\n` +
        `1. **Focus on Verified Fit**: Target organizations where your verified profile languages match at least 60% of their active repositories.\n` +
        `2. **Pipeline Progression**: Advance candidate issues through DevOrbit's 6-stage pipeline (\`SHORTLISTED\` -> \`EXPLORING\` -> \`PREPARING\` -> \`WORKING\` -> \`PR_SUBMITTED\` -> \`MERGED\`).\n` +
        `3. **High-Impact First Issue**: Look for good-first-issues in documentation test suites or small bug fixes before writing large architectural proposals.\n` +
        `4. **Deadline Awareness**: Submit early to allow mentors time for iterative review before official cohort cutoffs.`;
    }

    // General Developer Assistant Default
    return `### ℹ️ Rule-based tips (no model available)\n\n` +
      `### 🪐 Orbit AI Developer Assistant\n\n` +
      `Operating in **Local Rule-Based Mode** (No local model active).\n\n` +
      `- **Local Privacy**: Your prompts and source code remain on your machine; zero cloud telemetry.\n` +
      `- **Ollama Integration**: Install [Ollama](https://ollama.ai) and run \`ollama run qwen2.5-coder\` to connect dynamic local LLMs.\n` +
      `- **Available Topics**: Code review tips, refactoring proposals, security audit checklist, and algorithmic patterns.`;
  }
}
