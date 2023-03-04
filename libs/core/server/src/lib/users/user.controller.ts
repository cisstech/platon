import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { ItemResponse, ListResponse, NotFoundResponse } from '@platon/core/common';
import { Mapper } from '../utils';
import { UpdateUserDTO, UserDTO, UserFiltersDTO } from './user.dto';
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

  @Get('/:userIdOrName')
  async find(
    @Param('userIdOrName') userIdOrName: string
  ): Promise<ItemResponse<UserDTO>> {
    const optional = await this.userService.findByIdOrName(userIdOrName);
    const resource = Mapper.map(
      optional.orElseThrow(() => new NotFoundResponse(`User not found: ${userIdOrName}`)),
      UserDTO
    );
    return new ItemResponse({ resource })
  }

  @Patch('/:userIdOrName')
  async update(
    @Param('userIdOrName') userIdOrName: string,
    @Body() input: UpdateUserDTO
  ): Promise<ItemResponse<UserDTO>> {
    const resource = Mapper.map(
      await this.userService.update(userIdOrName, input),
      UserDTO
    );
    return new ItemResponse({ resource })
  }
}
