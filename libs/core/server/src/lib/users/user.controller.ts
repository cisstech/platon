import { Body, Controller, Get, NotFoundException, Param, Patch, Query } from '@nestjs/common';
import { ItemResponse, ListResponse, UpdateUser } from '@platon/core/common';
import { Mapper } from '../utils';
import { UserDTO, UserFiltersDTO } from './user.dto';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService
  ) { }

  @Get()
  async search(
    @Query() filters: UserFiltersDTO
  ): Promise<ListResponse<UserDTO>> {
    const [users, total] = await this.userService.search(filters);
    const resources = Mapper.mapAll(users, UserDTO);
    return new ListResponse({ total, resources })
  }

  @Get('/:username')
  async find(
    @Param('username') username: string
  ): Promise<ItemResponse<UserDTO>> {
    const optional = await this.userService.findByUsername(username);
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundException(`User not found: ${username}`)),
      UserDTO
    );
    return new ItemResponse({ resource })
  }

  @Patch('/:username')
  async update(
    @Param('username') username: string,
    @Body() input: UpdateUser
  ): Promise<ItemResponse<UserDTO>> {
    const resource = Mapper.map(
      await this.userService.updateByUsername(username, input),
      UserDTO
    );
    return new ItemResponse({ resource })
  }
}
