import { Router, Response, NextFunction } from 'express';
import { prisma } from '../../config/index.js';
import { AuthRequest, authenticate } from '../../middleware/auth.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../lib/errors.js';
import { OllamaService } from './ollama.service.js';
import { aiRateLimiter } from '../../middleware/rateLimit.js';

export const aiRouter = Router();
const ollamaService = new OllamaService();

// 1. Check local AI / Ollama status
aiRouter.get('/status', authenticate, async (_req, res) => {
  const isAvailable = await ollamaService.isOllamaAvailable();
  res.json({
    success: true,
    data: {
      ollamaAvailable: isAvailable,
      reachable: isAvailable,
      activeEngine: isAvailable ? 'ollama-local-llm' : 'devorbit-deterministic-fallback',
      defaultModel: isAvailable ? 'qwen2.5-coder' : 'devorbit-deterministic-v1',
      privacy: '100% Local-First / Zero Cloud Exfiltration',
    },
  });
});

// 2. List available local models
aiRouter.get('/models', authenticate, async (_req, res) => {
  const isAvailable = await ollamaService.isOllamaAvailable();
  if (!isAvailable) {
    return res.json({
      success: true,
      data: {
        reachable: false,
        isAvailable: false,
        activeEngine: 'devorbit-deterministic-fallback',
        models: [],
        message: 'Local Ollama is unreachable. Run `ollama run qwen2.5-coder` or configure an external endpoint in Settings.',
      },
    });
  }

  const models = await ollamaService.listModels();
  res.json({
    success: true,
    data: {
      reachable: true,
      isAvailable: true,
      activeEngine: 'ollama-local-llm',
      models: models,
      message: models.length === 0
        ? 'Ollama is reachable, but no models have been pulled yet. Run `ollama pull qwen2.5-coder`.'
        : undefined,
    },
  });
});

// 3. Get user conversations
aiRouter.get('/conversations', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const conversations = await prisma.aiConversation.findMany({
      where: { userId },
      include: {
        messages: {
          take: 30,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: conversations.map(c => ({
        ...c,
        messages: [...c.messages].reverse(),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// 4. Get specific conversation with full messages
aiRouter.get('/conversations/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    const conversation = await prisma.aiConversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    res.json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
});

// 5. Rename conversation
aiRouter.patch('/conversations/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    const { title } = req.body;
    if (!title || typeof title !== 'string') {
      throw new BadRequestError('Valid title is required');
    }

    const conversation = await prisma.aiConversation.findFirst({
      where: { id, userId },
    });
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    const updated = await prisma.aiConversation.update({
      where: { id },
      data: { title: title.trim() },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
});

// 6. Delete conversation
aiRouter.delete('/conversations/:id', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = String(req.params.id);
    const conversation = await prisma.aiConversation.findFirst({
      where: { id, userId },
    });
    if (!conversation) {
      throw new NotFoundError('Conversation not found');
    }

    await prisma.aiMessage.deleteMany({
      where: { conversationId: id },
    });
    await prisma.aiConversation.delete({
      where: { id },
    });

    res.json({ success: true, message: 'Conversation deleted successfully' });
  } catch (err) {
    next(err);
  }
});

// 7. Chat with Orbit AI
aiRouter.post('/chat', authenticate, aiRateLimiter, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { prompt, conversationId, modelName } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      throw new BadRequestError('Prompt is required');
    }
    if (prompt.length > 8000) {
      throw new BadRequestError('Prompt exceeds maximum length of 8000 characters');
    }

    let convId = conversationId;
    let historyMessages: Array<{ role: string; content: string }> = [];

    if (convId) {
      const existingConv = await prisma.aiConversation.findUnique({
        where: { id: convId },
      });
      if (!existingConv) {
        throw new NotFoundError('Conversation not found');
      }
      if (existingConv.userId !== userId) {
        throw new ForbiddenError('Conversation not found or access denied');
      }

      // Fetch last 10 messages for conversational context
      const prev = await prisma.aiMessage.findMany({
        where: { conversationId: convId },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });
      historyMessages = prev.reverse().map(m => ({ role: m.role, content: m.content }));
    } else {
      const conv = await prisma.aiConversation.create({
        data: {
          userId,
          title: prompt.trim().slice(0, 40) + (prompt.length > 40 ? '...' : ''),
        },
      });
      convId = conv.id;
    }

    // Save user message
    await prisma.aiMessage.create({
      data: {
        conversationId: convId,
        role: 'user',
        content: prompt.trim(),
      },
    });

    // Generate developer response using Local AI with context history
    const aiResponse = await ollamaService.generate(
      prompt.trim(),
      modelName || 'qwen2.5-coder',
      historyMessages
    );
    const responseText = aiResponse.content;

    // Save assistant message with provenance
    const assistantMsg = await prisma.aiMessage.create({
      data: {
        conversationId: convId,
        role: 'assistant',
        content: responseText,
        model: aiResponse.model,
        isFallback: aiResponse.source === 'deterministic_fallback',
      },
    });

    // Update conversation updatedAt
    await prisma.aiConversation.update({
      where: { id: convId },
      data: { updatedAt: new Date() },
    });

    res.json({
      success: true,
      data: {
        conversationId: convId,
        message: assistantMsg,
        aiEngine: aiResponse.source,
        model: aiResponse.model,
        isFallback: aiResponse.source === 'deterministic_fallback',
        isRealModel: aiResponse.source === 'ollama',
        provenance: aiResponse.source === 'ollama'
          ? `Local Neural Inference (${aiResponse.model})`
          : 'Generated via Deterministic Rule Engine (Offline Fallback)',
      },
    });
  } catch (err) {
    next(err);
  }
});

// 8. One-shot prompt / query (Codebase Navigator & contextual queries)
aiRouter.post('/prompt', authenticate, aiRateLimiter, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { prompt, context, modelName } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      throw new BadRequestError('Prompt is required');
    }
    if (prompt.length > 8000) {
      throw new BadRequestError('Prompt exceeds maximum length of 8000 characters');
    }

    const aiResponse = await ollamaService.generate(prompt.trim(), modelName || 'qwen2.5-coder');
    const content = aiResponse.content;

    res.json({
      success: true,
      data: {
        reply: content,
        content,
        model: aiResponse.model,
        source: aiResponse.source,
        context: context || null,
      },
    });
  } catch (err) {
    next(err);
  }
});
