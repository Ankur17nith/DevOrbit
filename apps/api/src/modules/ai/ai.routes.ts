import { Router, Response, NextFunction } from 'express';
import { prisma } from '../../config/index.js';
import { AuthRequest, authenticate } from '../../middleware/auth.js';
import { BadRequestError, ForbiddenError, NotFoundError } from '../../lib/errors.js';
import { OllamaService } from './ollama.service.js';

export const aiRouter = Router();
const ollamaService = new OllamaService();

// 1. Check local AI / Ollama status
aiRouter.get('/status', async (_req, res) => {
  const isAvailable = await ollamaService.isOllamaAvailable();
  res.json({
    success: true,
    data: {
      ollamaAvailable: isAvailable,
      activeEngine: isAvailable ? 'ollama-local-llm' : 'devorbit-deterministic-fallback',
      defaultModel: isAvailable ? 'deepseek-coder' : 'devorbit-deterministic-v1',
      privacy: '100% Local-First / Zero Cloud Exfiltration',
      hostUrl: 'http://127.0.0.1:11434',
    },
  });
});

// 2. List available local models
aiRouter.get('/models', async (_req, res) => {
  const isAvailable = await ollamaService.isOllamaAvailable();
  if (!isAvailable) {
    return res.json({
      success: true,
      data: {
        isAvailable: false,
        activeEngine: 'devorbit-deterministic-fallback',
        models: [
          { name: 'devorbit-deterministic-v1', isFallback: true, size: 0, description: 'Local Rule-Based Developer Intelligence Engine' },
        ],
        message: 'Ollama is offline. Start the daemon with `ollama run deepseek-coder` for local neural models.',
      },
    });
  }

  const models = await ollamaService.listModels();
  res.json({
    success: true,
    data: {
      isAvailable: true,
      activeEngine: 'ollama-local-llm',
      models: models.length > 0 ? models : [
        { name: 'deepseek-coder', isRecommended: true },
        { name: 'llama3:8b', isRecommended: false },
      ],
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
      throw new NotFoundError('Conversation not found or access denied');
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
      throw new NotFoundError('Conversation not found or access denied');
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
      throw new NotFoundError('Conversation not found or access denied');
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
aiRouter.post('/chat', authenticate, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { prompt, conversationId, modelName } = req.body;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
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

    // Generate developer response using Local AI (Ollama or Deterministic Fallback)
    const aiResponse = await ollamaService.generate(prompt.trim(), modelName || 'deepseek-coder');
    const responseText = aiResponse.content;

    // Save assistant message
    const assistantMsg = await prisma.aiMessage.create({
      data: {
        conversationId: convId,
        role: 'assistant',
        content: responseText,
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
      },
    });
  } catch (err) {
    next(err);
  }
});
