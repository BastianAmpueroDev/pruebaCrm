import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { PrismaService } from '../prisma/prisma.service';
import { ToolExecutor } from './tools/tool-executor';
import { toolDefinitions } from './tools/tool-definitions';
import { getSystemPrompt } from './prompts/system-prompt.v1';
import { ChatDto } from './dto/chat.dto';

@Injectable()
export class AssistantService {
  private readonly logger = new Logger(AssistantService.name);
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(
    private prisma: PrismaService,
    private toolExecutor: ToolExecutor,
    private config: ConfigService,
  ) {
    this.client = new Anthropic({
      apiKey: this.config.get<string>('ANTHROPIC_API_KEY', ''),
    });
    this.model = this.config.get<string>('ANTHROPIC_MODEL', 'claude-haiku-4-5-20251001');
  }

  async chat(userId: string, dto: ChatDto) {
    const startTime = Date.now();
    let conversationId = dto.conversationId;
    const toolsUsed: string[] = [];

    // Obtener o crear conversación
    let conversation = conversationId
      ? await this.prisma.conversation.findFirst({
          where: { id: conversationId, userId },
          include: { messages: { orderBy: { createdAt: 'asc' } } },
        })
      : null;

    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          userId,
          title: dto.message.slice(0, 60),
          messages: { create: [] },
        },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      conversationId = conversation.id;
    }

    // Persistir mensaje del usuario
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: dto.message,
      },
    });

    // Construir historial para Anthropic
    const history: Anthropic.MessageParam[] = conversation.messages.map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));
    history.push({ role: 'user', content: dto.message });

    let assistantResponse = '';
    let success = true;
    let errorMessage: string | undefined;

    try {
      // Loop de orquestación con tool calling (máx 5 iteraciones)
      let messages = [...history];
      for (let i = 0; i < 5; i++) {
        const response = await this.client.messages.create({
          model: this.model,
          max_tokens: 1024,
          temperature: 0.2,
          system: getSystemPrompt(),
          tools: toolDefinitions,
          messages,
        });

        if (response.stop_reason === 'end_turn') {
          const textBlock = response.content.find((b) => b.type === 'text');
          assistantResponse = textBlock?.type === 'text' ? textBlock.text : '';
          break;
        }

        if (response.stop_reason === 'tool_use') {
          const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');
          const toolResults: Anthropic.ToolResultBlockParam[] = [];

          for (const block of toolUseBlocks) {
            if (block.type !== 'tool_use') continue;
            toolsUsed.push(block.name);
            const result = await this.toolExecutor.execute(
              block.name,
              block.input as Record<string, any>,
            );
            toolResults.push({
              type: 'tool_result',
              tool_use_id: block.id,
              content: result,
            });
          }

          messages = [
            ...messages,
            { role: 'assistant', content: response.content },
            { role: 'user', content: toolResults },
          ];
          continue;
        }

        break;
      }
    } catch (error: any) {
      this.logger.error('Error en Anthropic API:', error.message);
      assistantResponse =
        'Lo siento, hubo un problema al procesar tu consulta. Por favor intenta de nuevo.';
      success = false;
      errorMessage = error.message;
    }

    // Persistir respuesta del asistente
    await this.prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: assistantResponse,
      },
    });

    // Log de la interacción
    await this.prisma.aiInteractionLog.create({
      data: {
        conversationId: conversation.id,
        userMessage: dto.message,
        toolsUsed,
        inputTokens: 0,
        outputTokens: 0,
        latencyMs: Date.now() - startTime,
        model: this.model,
        success,
        errorMessage,
      },
    });

    return {
      conversationId: conversation.id,
      message: assistantResponse,
      toolsUsed,
    };
  }

  async getConversations(userId: string) {
    return this.prisma.conversation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        createdAt: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, role: true, createdAt: true },
        },
      },
    });
  }

  async getConversation(userId: string, conversationId: string) {
    return this.prisma.conversation.findFirst({
      where: { id: conversationId, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });
  }
}
