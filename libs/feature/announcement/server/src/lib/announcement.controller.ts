import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import { Body, Controller, Post, Get, Delete, Req, Query, Patch, UnauthorizedException } from '@nestjs/common'
import { AnnouncementService } from './announcement.service'
import { IRequest, Mapper, Roles, UUIDParam } from '@platon/core/server'
import { CreatedResponse, ItemResponse, ListResponse, UserRoles } from '@platon/core/common'
import {
  CreateAnnouncementDTO,
  UpdateAnnouncementDTO,
  AnnouncementDTO,
  AnnouncementFiltersDTO,
} from './announcement.dto'

@ApiBearerAuth()
@ApiTags('Announcements')
@Controller('announcements')
export class AnnouncementController {
  constructor(private readonly service: AnnouncementService) {}

  @Roles(UserRoles.admin)
  @Get()
  async search(@Query() filters: AnnouncementFiltersDTO): Promise<ListResponse<AnnouncementDTO>> {
    const [items, count] = await this.service.search(filters)
    return new ListResponse({
      resources: Mapper.mapAll(items, AnnouncementDTO),
      total: count,
    })
  }

  @Roles(UserRoles.admin)
  @Post()
  async create(
    @Req() req: IRequest,
    @Body() announcement: CreateAnnouncementDTO
  ): Promise<CreatedResponse<AnnouncementDTO>> {
    const newAnnouncement = await this.service.create({ ...announcement, publisher: req.user })
    return new CreatedResponse({ resource: Mapper.map(newAnnouncement, AnnouncementDTO) })
  }

  @Roles(UserRoles.admin, UserRoles.teacher, UserRoles.student, UserRoles.demo)
  @Get('visible')
  async getVisibleForUser(
    @Req() req: IRequest,
    @Query() filters: AnnouncementFiltersDTO
  ): Promise<ListResponse<AnnouncementDTO>> {
    if (!req.user || !req.user.id || !req.user.role) {
      throw new UnauthorizedException('Utilisateur non authentifié ou informations manquantes')
    }

    const [items, count] = await this.service.getVisibleForUser(req.user.id, req.user.role, filters)
    return new ListResponse({
      resources: Mapper.mapAll(items, AnnouncementDTO),
      total: count,
    })
  }

  @Roles(UserRoles.admin, UserRoles.teacher, UserRoles.student, UserRoles.demo)
  @Get('visible/:id')
  async findVisibleById(@Req() req: IRequest, @UUIDParam('id') id: string): Promise<ItemResponse<AnnouncementDTO>> {
    if (!req.user || !req.user.role) {
      throw new UnauthorizedException('Utilisateur non authentifié ou informations manquantes')
    }

    const announcement = await this.service.findByIdForUser(id, req.user.role)
    return new ItemResponse({ resource: Mapper.map(announcement, AnnouncementDTO) })
  }

  /** The person has read it: opened it, or closed its banner. Only an announcement meant for them. */
  @Roles(UserRoles.admin, UserRoles.teacher, UserRoles.student, UserRoles.demo)
  @Patch(':id/read')
  async markAsRead(@Req() req: IRequest, @UUIDParam('id') id: string): Promise<void> {
    await this.service.markAsRead(id, req.user.id, req.user.role)
  }

  @Roles(UserRoles.admin)
  @Get(':id')
  async findById(@UUIDParam('id') id: string): Promise<ItemResponse<AnnouncementDTO>> {
    const announcement = await this.service.findById(id)
    return new ItemResponse({ resource: Mapper.map(announcement, AnnouncementDTO) })
  }

  @Roles(UserRoles.admin)
  @Patch('/:id')
  async update(
    @UUIDParam('id') id: string,
    @Body() changes: UpdateAnnouncementDTO
  ): Promise<ItemResponse<AnnouncementDTO>> {
    const updatedAnnouncement = await this.service.update(id, changes)
    return new ItemResponse({ resource: Mapper.map(updatedAnnouncement, AnnouncementDTO) })
  }

  @Roles(UserRoles.admin)
  @Delete(':id')
  async delete(@UUIDParam('id') id: string): Promise<void> {
    await this.service.delete(id)
  }
}
