import { Router, Response, NextFunction } from 'express';
import { prisma } from '../../config/index.js';
import { AuthRequest, authenticate } from '../../middleware/auth.js';
import { BadRequestError } from '../../lib/errors.js';

export const aiRouter = Router();

// Get user conversations
aiRouter.get('/conversations', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const conversations = await prisma.aiConversation.findMany({
      where: { userId },
      include: {
        messages: {
          take: 30,
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({ success: true, data: conversations });
  } catch (err) {
    next(err);
  }
});

// Chat with Orbit AI / Ossistant
aiRouter.post('/chat', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { prompt, conversationId, contextType, contextId } = req.body;
    if (!prompt) {
      throw new BadRequestError('Prompt is required');
    }

    let convId = conversationId;
    if (!convId) {
      const conv = await prisma.aiConversation.create({
        data: {
          userId,
          title: prompt.slice(0, 40) + '...',
        },
      });
      convId = conv.id;
    }

    // Save user message
    await prisma.aiMessage.create({
      data: {
        conversationId: convId,
        role: 'user',
        content: prompt,
      },
    });

    // Generate intelligent developer answer based on query & context
    let responseText = '';
    const lower = prompt.toLowerCase();

    if (lower.includes('gsoc') || lower.includes('google summer of code')) {
      responseText = `### 🌟 GSoC Contribution Strategy\n\n1. **Target Identification**: Filter organizations with at least 3 years of consistent participation.\n2. **Setup First**: Clone the repository, build locally, and run existing unit tests before drafting proposals.\n3. **First PR Strategy**: Locate a recent issue tagged \`good first issue\` or test coverage gap.\n4. **Proposal Structure**: Clearly map weekly deliverables, architectural diagrams, and test specifications.`;
    } else if (lower.includes('dsa') || lower.includes('algorithm') || lower.includes('leetcode')) {
      responseText = `### 🧠 Algorithmic Strategy & Weakness Guidance\n\n- **Pattern Recognition**: Identify whether the problem matches Two Pointers, Sliding Window, Topological Sort, or Dynamic Programming.\n- **Spaced Repetition**: Ensure problems tagged with \`REVISE\` in your DevOrbit queue are tackled within 48 hours to retain memory.\n- **Edge Cases**: Always test bounds: empty input, single element, negative numbers, overflow constraints.`;
    } else if (lower.includes('explain') || lower.includes('architecture') || lower.includes('repo')) {
      responseText = `### 🏗️ Repository Architecture Analysis\n\n- **Entry Points**: Inspect \`package.json\` or \`Cargo.toml\` to locate root entry scripts.\n- **Data Boundaries**: Review database schemas and API controllers to trace request flows.\n- **Contributing Guidelines**: Adhere to commit message conventions (Conventional Commits) and check formatting scripts (\`npm run lint\`).`;
    } else {
      responseText = `I have analyzed your request regarding **DevOrbit Developer Intelligence**.\n\n- **Action Item**: Review your active **Orbit OSS** bookmarks and current DSA spaced repetition queue.\n- **Recommended Next Step**: Pick a high-compatibility issue in your preferred language or revise your pending Dynamic Programming problems.\n\nLet me know if you want a detailed step-by-step contribution plan!`;
    }

    // Save assistant message
    const assistantMsg = await prisma.aiMessage.create({
      data: {
        conversationId: convId,
        role: 'assistant',
        content: responseText,
      },
    });

    res.json({
      success: true,
      data: {
        conversationId: convId,
        message: assistantMsg,
      },
    });
  } catch (err) {
    next(err);
  }
});
