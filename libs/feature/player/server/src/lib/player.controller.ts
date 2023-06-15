import { Body, Controller, Param, Post, Req, Get } from '@nestjs/common';
import { IRequest, Public } from '@platon/core/server';
import {
  EvalExerciseInput,
  PlayAnswersInput,
} from '@platon/feature/player/common';
import {
  EvalExerciseOutputDTO,
  PlayActivityInputDTO,
  PlayActivityOutputDTO,
  PlayAnswersOutputDTO,
  PlayExerciseInputDTO,
  PlayExerciseOuputDTO,
  PreviewInputDTO,
  PreviewOuputDTO,
} from './player.dto';
import { PlayerService } from './player.service';

@Controller('player')
export class PlayerController {
  constructor(private readonly playerService: PlayerService) {}

  @Public()
  @Post('/preview')
  preview(@Body() input: PreviewInputDTO): Promise<PreviewOuputDTO> {
    return this.playerService.preview(input);
  }

  @Public()
  @Post('/play/answers')
  async playAnswers(
    @Body() input: PlayAnswersInput
  ): Promise<PlayAnswersOutputDTO> {
    return {
      exercises: await this.playerService.answers(input.sessionId),
    };
  }

  @Public()
  @Post('/play/activity')
  playActivity(
    @Req() req: IRequest,
    @Body() input: PlayActivityInputDTO
  ): Promise<PlayActivityOutputDTO> {
    return this.playerService.playActivity(input.activityId, req.user);
  }

  @Public()
  @Post('/play/exercises')
  playExercises(
    @Req() req: IRequest,
    @Body() input: PlayExerciseInputDTO
  ): Promise<PlayExerciseOuputDTO> {
    return this.playerService.playExercises(
      input.activitySessionId,
      input.exerciseSessionIds,
      req.user
    );
  }

  @Public()
  @Post('/terminate/:sessionId')
  async terminate(
    @Req() req: IRequest,
    @Param('sessionId') sessionId: string
  ): Promise<PlayActivityOutputDTO> {
    return this.playerService.terminateSession(sessionId, req.user);
  }

  @Public()
  @Post('/evaluate')
  async evaluate(
    @Req() req: IRequest,
    @Body() input: EvalExerciseInput
  ): Promise<EvalExerciseOutputDTO> {
    const response = await this.playerService.evaluate(input, req.user);
    return {
      exercise: Array.isArray(response) ? response[0] : response,
      navigation: Array.isArray(response) ? response[1] : undefined,
    };
  }
}
