import { Body, Controller, Post, Req } from '@nestjs/common';
import { BadRequestResponse } from '@platon/core/common';
import { IRequest } from '@platon/core/server';
import { ResourceFileService } from '@platon/feature/resource/server';
import { PlayerInputDTO, ResourceLayoutDTO } from './player.dto';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
  constructor(
    private readonly playerService: PlayerService,
    private readonly resourceFileService: ResourceFileService,
  ) { }

  @Post('/play')
  async play(
    @Req() req: IRequest,
    @Body() input: PlayerInputDTO
  ): Promise<ResourceLayoutDTO> {
    if (!input.resourceId) {
      throw new BadRequestResponse(`missing input.resourceId`);
    }

    const source = await this.resourceFileService.compile(
      input.resourceId,
      input.resourceVersion,
      req.user
    );

    return this.playerService.build(source);
  }
}
