import { ApiTags } from '@nestjs/swagger'
import { DiscordInvitationService } from './discord-invitation/discord-invitation.service'
import { Controller, Get, Req } from '@nestjs/common'
import { IRequest } from '@platon/core/server'

@Controller('discord')
@ApiTags('Discord')
export class FeatureDiscordServerController {
  constructor(private readonly discordInvitationService: DiscordInvitationService) {}

  @Get('invitation')
  async invitation(@Req() req: IRequest): Promise<string> {
    return this.discordInvitationService.getInvitationLink(req.user.id)
  }
}
