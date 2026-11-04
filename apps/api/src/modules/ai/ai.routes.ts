import { Router, Response, NextFunction } from 'express';
import { prisma } from '../../config/index.js';
import { AuthRequest, authenticate } from '../../middleware/auth.js';
import { BadRequestError, ForbiddenError } from '../../lib/errors.js';
import { OllamaService } from './ollama.service.js';

export const aiRouter = Router();
const ollamaService = new OllamaService();

// Check local AI / Ollama status
aiRouter.get('/status', async (_req, res) => {
  const isAvailable = await ollamaService.isOllamaAvailable();
  res.json({
    success: true,
    data: {
      ollamaAvailable: isAvailable,
      activeEngine: isAvailable ? 'ollama-local-llm' : 'devorbit-deterministic-fallback',
      defaultModel: isAvailable ? 'deepseek-coder' : 'devorbit-deterministic-v1',
      privacy: '100% Local-First / Zero Cloud Exfiltration',
    },
  });
});

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
    if (convId) {
      const existingConv = await prisma.aiConversation.findFirst({
        where: { id: convId, userId },
      });
      if (!existingConv) {
        throw new ForbiddenError('Conversation not found or access denied');
      }
    } else {
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

    // Generate developer response using Local AI (Ollama or Deterministic Fallback)
    const aiResponse = await ollamaService.generate(prompt);
    const responseText = aiResponse.content;

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
        aiEngine: aiResponse.source,
        model: aiResponse.model,
      },
    });
  } catch (err) {
    next(err);
  }
});
