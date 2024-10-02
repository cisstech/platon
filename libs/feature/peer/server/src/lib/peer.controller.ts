// import { Controller, Get, Param, Req, Query } from '@nestjs/common'
// import { ApiTags } from '@nestjs/swagger'

// import { PeerService } from './peer.service'
// import { PeerMatchEntity } from './entities/peerMatch.entity'
// import { ItemResponse, ListResponse, NotFoundResponse } from '@platon/core/common'
// import { MatchStatus } from '@platon/feature/peer/common'

// @Controller('peerMatch')
// @ApiTags('PeerMatchComparisons')
// export class PeerController {
//   constructor(private readonly PeerMatchService: PeerService) {}

//   // @Post()
//   // async create(@Body() input: Partial<PeerMatchEntity>): Promise<CreatedResponse<PeerMatchEntity>> {
//   //   return new CreatedResponse({resource : await this.PeerMatchService.create(input)})
//   // }

//   // @Patch()
//   // async update(@Body() input: any): Promise<ItemResponse<PeerMatchEntity>> {
//   //   return new ItemResponse({resource : await this.PeerMatchService.update(input)})
//   // }

//   @Get()
//   async findAll(): Promise<ListResponse<PeerMatchEntity>> {
//     const [resources, total] = await this.PeerMatchService.findAll()
//     return new ListResponse({ resources, total })
//   }

//   @Get('/activity/:activityId')
//   async findAllPeerOfActivity(
//     @Param('activityId') activityId: string,
//     @Query('status') status?: MatchStatus
//   ): Promise<ItemResponse<PeerMatchEntity[]>> {
//     const resource = await this.PeerMatchService.findAllPeerOfActivity(activityId, status)
//     return new ItemResponse({ resource })
//   }

//   @Get(':id')
//   async findOne(@Param('id') id: string): Promise<ItemResponse<PeerMatchEntity>> {
//     const optional = await this.PeerMatchService.findById(id)
//     const resource = optional.orElseThrow(() => new NotFoundResponse(`Peer not found: ${id}`))
//     return new ItemResponse({ resource })
//   }

//   @Get('/topMetch')
//   async getBestCopy(@Req() req: any) {
//     console.log('---------- getBestCopy ----------')
//     console.log(req)
//     return 'ok'
//   }
// }
