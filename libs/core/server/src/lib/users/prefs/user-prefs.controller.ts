import { Body, Controller, Get, Param, Patch, Request, UnauthorizedException } from '@nestjs/common';
import { ItemResponse } from '@platon/core/common';
import { IRequest } from '../../auth';
import { Mapper } from '../../utils';
import { UpdateUserPrefsDTO, UserPrefsDTO } from './user-prefs.dto';
import { UserPrefsService } from './user-prefs.service';

@Controller('users/:username/prefs')
export class UserPrefsController {
  constructor(
    private readonly service: UserPrefsService
  ) { }


  @Get()
  async find(
    @Param('username') username: string,
    @Request() req: IRequest,
  ): Promise<ItemResponse<UserPrefsDTO>> {
    if (username !== req.user.username) {
      throw new UnauthorizedException("You cannot access other users' prefs")
    }
    return new ItemResponse({
      resource: Mapper.map(
        await this.service.findByUserId(req.user.id),
        UserPrefsDTO
      )
    })
  }

  @Patch()
  async update(
    @Param('username') username: string,
    @Request() req: IRequest,
    @Body() input: UpdateUserPrefsDTO,
  ): Promise<ItemResponse<UserPrefsDTO>> {
    if (username !== req.user.username) {
      throw new UnauthorizedException("You cannot access other users' prefs")
    }
    return new ItemResponse({
      resource: Mapper.map(
        await this.service.updateByUserId(req.user.id, await this.service.fromInput(input)),
        UserPrefsDTO
      )
    })
  }
}
