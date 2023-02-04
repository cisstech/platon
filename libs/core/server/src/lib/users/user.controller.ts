import { Body, Controller, Get, NotFoundException, Param, Patch } from '@nestjs/common';
import { DetailSuccessResponse, ListSuccessResponse, Mapper, UpdateUserDTO, UserDTO } from '@platon/core/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) { }

  @Get()
  async list(): Promise<ListSuccessResponse<UserDTO>> {
    const [users, total] = await this.userService.findAndCountAll();
    const resources = Mapper.mapAll(users, UserDTO);
    return new ListSuccessResponse({ total, resources })
  }

  @Get('/:username')
  async find(
    @Param('username') username: string
  ): Promise<DetailSuccessResponse<UserDTO>> {
    const optional = await this.userService.findByUsername(username);
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundException(`User not found: ${username}`)),
      UserDTO
    );
    return new DetailSuccessResponse({ resource })
  }

  @Patch('/:username')
  async update(
    @Param('username') username: string,
    @Body() input: UpdateUserDTO
  ): Promise<DetailSuccessResponse<UserDTO>> {
    const resource = Mapper.map(
      await this.userService.updateByUsername(username, input),
      UserDTO
    );
    return new DetailSuccessResponse({ resource })
  }
}
