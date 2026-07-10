import { Controller, Post, Get, Body, Param, UseGuards } from '@nestjs/common';
import { AssistantService } from './assistant.service';
import { ChatDto } from './dto/chat.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('assistant')
@UseGuards(JwtAuthGuard)
export class AssistantController {
  constructor(private assistantService: AssistantService) {}

  @Post('chat')
  chat(@CurrentUser() user: any, @Body() dto: ChatDto) {
    return this.assistantService.chat(user.id, dto);
  }

  @Get('conversations')
  getConversations(@CurrentUser() user: any) {
    return this.assistantService.getConversations(user.id);
  }

  @Get('conversations/:id')
  getConversation(@CurrentUser() user: any, @Param('id') id: string) {
    return this.assistantService.getConversation(user.id, id);
  }
}
