import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit, inject } from '@angular/core'
import { firstValueFrom } from 'rxjs'

import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatToolbarModule } from '@angular/material/toolbar'

import { NzBadgeModule } from 'ng-zorro-antd/badge'
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb'
import { NzSegmentedModule } from 'ng-zorro-antd/segmented'
import { NzSliderModule } from 'ng-zorro-antd/slider'

import { ExercisePlayer } from '@platon/feature/player/common'
import { ResultService } from '@platon/feature/result/browser'

import { FormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { DialogModule, DialogService } from '@platon/core/browser'
import { ActivityCorrection, ExerciseCorrection } from '@platon/feature/result/common'
import { UiModalTemplateComponent } from '@platon/shared/ui'
import { NzEmptyModule } from 'ng-zorro-antd/empty'
import { PlayerService } from '../../api/player.service'
import { PlayerExerciseComponent } from '../player-exercise/player-exercise.component'
import { NzIconModule } from 'ng-zorro-antd/icon'

interface ExerciseGroup {
  exerciseId: string
  exerciseName: string
  graded: boolean
  users: ExerciseCorrection[]
}

@Component({
  standalone: true,
  selector: 'player-correction',
  templateUrl: './player-correction.component.html',
  styleUrls: ['./player-correction.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,

    MatIconModule,
    MatButtonModule,
    MatToolbarModule,
    MatSidenavModule,

    NzIconModule,
    NzBadgeModule,
    NzEmptyModule,
    NzSliderModule,
    NzSegmentedModule,
    NzBreadCrumbModule,

    DialogModule,

    PlayerExerciseComponent,
    UiModalTemplateComponent,
  ],
})
export class PlayerCorrectionComponent implements OnInit {
  private readonly dialogService = inject(DialogService)
  private readonly resultService = inject(ResultService)
  private readonly playerService = inject(PlayerService)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected answers: ExercisePlayer[] = []

  protected currentGroup?: ExerciseGroup | null = null
  protected exerciseGroups: ExerciseGroup[] = []

  protected exercises: ExerciseCorrection[] = []
  protected currentExercise?: ExerciseCorrection | null = null

  protected correctedGrade?: number

  protected selectedTabIndex = 0
  protected selectedExerciseIndex = 0

  @Input() correction!: ActivityCorrection

  async ngOnInit(): Promise<void> {
    this.buildGroups()
    this.onChooseGroup(this.exerciseGroups[0])
  }

  protected async loadAnswers(exercise: ExerciseCorrection): Promise<void> {
    this.currentExercise = exercise
    this.correctedGrade = exercise.correctedGrade ?? exercise.grade
    if (exercise.exerciseSessionId) {
      this.answers = (
        await firstValueFrom(
          this.playerService.playAnswers({
            sessionId: exercise.exerciseSessionId,
          })
        )
      ).exercises
    }
    this.changeDetectorRef.markForCheck()
  }

  protected onChooseTab(index: number): void {
    this.answers = []
    this.selectedTabIndex = index
    this.currentExercise = null
    this.exercises =
      this.currentGroup?.users?.filter((exercise) => {
        return index === 0 ? exercise.correctedGrade == null : exercise.correctedGrade != null
      }) || []
    this.onChooseExercise(0).catch(console.error)
  }

  protected onChooseGroup(group: ExerciseGroup): void {
    this.currentGroup = group
    this.onChooseTab(this.selectedTabIndex)
  }

  protected async onChooseExercise(index: number): Promise<void> {
    this.selectedExerciseIndex = index
    const exercise = this.exercises[index]
    if (exercise) {
      await this.loadAnswers(exercise)
    }
    this.changeDetectorRef.markForCheck()
  }

  protected onChoosePreviousExercise(): void {
    this.onChooseExercise(this.selectedExerciseIndex - 1).catch(console.error)
  }

  protected onChooseNextExercise(): void {
    this.onChooseExercise(this.selectedExerciseIndex + 1).catch(console.error)
  }

  protected async onSaveGrade(): Promise<void> {
    if (this.currentExercise && this.currentExercise != null) {
      try {
        await firstValueFrom(
          this.resultService.upsertCorrection(this.currentExercise.exerciseSessionId, {
            grade: this.correctedGrade as number,
          })
        )
        this.currentExercise.correctedGrade = this.correctedGrade
        this.buildGroups()
        this.onChooseTab(this.selectedTabIndex)
        this.dialogService.success('La note a été sauvegardée avec succès.')
      } catch {
        this.dialogService.error('Une erreur est survenue lors de la sauvegarde de la note.')
      }
    }
  }

  private buildGroups(): void {
    const groupedExercises: ExerciseGroup[] = []
    const groupedExerciseIds: Set<string> = new Set()

    for (const exercise of this.correction.exercises) {
      if (!groupedExerciseIds.has(exercise.exerciseId)) {
        groupedExerciseIds.add(exercise.exerciseId)
        const newGroup: ExerciseGroup = {
          exerciseId: exercise.exerciseId,
          exerciseName: exercise.exerciseName,
          users: [exercise],
          graded: exercise.correctedGrade != null,
        }
        groupedExercises.push(newGroup)
      } else {
        const group = groupedExercises.find((g) => g.exerciseId === exercise.exerciseId)
        if (group) {
          group.users.push(exercise)
          group.graded = exercise.correctedGrade != null && group.graded
        }
      }
    }

    this.exerciseGroups = groupedExercises
  }

  protected trackByExerciseId(_: number, group: ExerciseGroup): string {
    return group.exerciseId
  }
}
