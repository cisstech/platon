import { ApiProperty } from "@nestjs/swagger";
import { ActivityPlayer, EvalExerciseInput, EvalExerciseOutput, ExercisePlayer, PlayActivityInput, PlayActivityOuput, PlayerActions, PlayerNavigation, PlayExerciseInput, PlayExerciseOuput, PreviewInput, PreviewOuput } from "@platon/feature/player/common";
import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from "class-validator";


export class PreviewInputDTO implements PreviewInput {
  @IsString()
  @ApiProperty()
  version!: string;

  @IsString()
  @ApiProperty()
  resource!: string;
}

export class PlayExerciseInputDTO implements PlayExerciseInput {
  @IsUUID()
  @ApiProperty()
  activitySessionId!: string;

  @IsUUID(undefined, { each: true })
  @ApiProperty()
  exerciseSessionIds!: string[];
}

export class PlayActivityInputDTO implements PlayActivityInput {
  @IsUUID()
  @ApiProperty()
  courseActivityId!: string;
}

export class EvalExerciseInputDTO implements EvalExerciseInput {
  @IsEnum(PlayerActions)
  @ApiProperty()
  action!: PlayerActions;

  @IsUUID()
  @ApiProperty()
  sessionId!: string;

  @IsObject()
  @ApiProperty()
  answers!: Record<string, unknown>;
}


export class PreviewOuputDTO implements PreviewOuput {
  @IsOptional()
  exercise?: ExercisePlayer;

  @IsOptional()
  activity?: ActivityPlayer;
}

export class PlayExerciseOuputDTO implements PlayExerciseOuput {
  exercises!: ExercisePlayer[];

  @IsOptional()
  navigation?: PlayerNavigation;
}

export class PlayActivityOutputDTO implements PlayActivityOuput {
  activity!: ActivityPlayer;
}

export class EvalExerciseOutputDTO implements EvalExerciseOutput {
  exercise!: ExercisePlayer;

  @IsOptional()
  navigation?: PlayerNavigation;
}
