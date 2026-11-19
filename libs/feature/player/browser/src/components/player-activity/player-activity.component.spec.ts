/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpErrorResponse } from '@angular/common/http'
import { ActivatedRoute } from '@angular/router'
import { of, throwError } from 'rxjs'

import { NzDialogService } from '@platon/core/browser'
import { NotificationService } from '@platon/feature/notification/browser'
import { NzModalService } from 'ng-zorro-antd/modal'

import { PlayerActivityComponent } from './player-activity.component'
import { PlayerService } from '../../api/player.service'
import { ActivityPlayer } from '@platon/feature/player/common'

const createPlayer = (overrides: Partial<ActivityPlayer> = {}): ActivityPlayer =>
  ({
    type: 'activity',
    sessionId: 'session-id',
    activityId: 'activity-id',
    title: 'Examen de test',
    introduction: '',
    conclusion: '',
    state: 'opened',
    serverTime: new Date(),
    navigation: {
      started: false,
      terminated: false,
      exercises: [],
      nextExercisesHistory: [],
      nextExercisesHistoryPosition: -1,
    } as any,
    ...overrides,
  } as ActivityPlayer)

describe('PlayerActivityComponent', () => {
  let fixture: ComponentFixture<PlayerActivityComponent>
  let component: PlayerActivityComponent
  let playerService: { openSessionWithCode: jest.Mock; terminate: jest.Mock }
  let dialogErrorSpy: jest.SpyInstance

  beforeEach(async () => {
    playerService = {
      openSessionWithCode: jest.fn(),
      terminate: jest.fn().mockReturnValue(of({ activity: createPlayer() })),
    }
    // DialogModule fournit NzDialogService via son propre @NgModule({ providers: [...] }).
    // Comme PlayerActivityComponent importe DialogModule directement, cette instance est fournie
    // à l'échelle du composant et masque tout override fourni au niveau racine de TestBed.
    // On patch donc directement le prototype plutôt que de tenter un override de provider inefficace.
    dialogErrorSpy = jest.spyOn(NzDialogService.prototype, 'error').mockImplementation(() => undefined as any)

    await TestBed.configureTestingModule({
      imports: [PlayerActivityComponent],
      providers: [
        { provide: PlayerService, useValue: playerService },
        { provide: NotificationService, useValue: { paginate: jest.fn().mockReturnValue(of({ notifications: [] })) } },
        { provide: NzModalService, useValue: { create: jest.fn() } },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: { has: () => false } } },
        },
      ],
    }).compileComponents()

    fixture = TestBed.createComponent(PlayerActivityComponent)
    component = fixture.componentInstance
    component.player = createPlayer()
    fixture.detectChanges()
  })

  afterEach(() => {
    dialogErrorSpy.mockRestore()
  })

  describe('onCodeComplete / open', () => {
    it('délègue à open() avec le code saisi', async () => {
      const openSpy = jest.spyOn(component as any, 'open').mockResolvedValue(undefined)

      await component['onCodeComplete']('ABC123')

      expect(openSpy).toHaveBeenCalledWith('ABC123')
    })

    it('rouvre la session avec le bon code et démarre l’activité', async () => {
      const reopenedPlayer = createPlayer({ navigation: { started: true, terminated: false, exercises: [] } as any })
      playerService.openSessionWithCode.mockReturnValue(of({ activity: reopenedPlayer }))
      // start() déclenche toute la mécanique de lancement des exercices, hors-sujet ici :
      // on isole le comportement propre à open() (appel du bon service + mise à jour du player).
      const startSpy = jest.spyOn(component as any, 'start').mockResolvedValue(undefined)

      await component['open']('ABC123')

      expect(playerService.openSessionWithCode).toHaveBeenCalledWith('session-id', 'ABC123')
      expect(component.player).toBe(reopenedPlayer)
      expect(component['isCodeError']).toBe(false)
      expect(startSpy).toHaveBeenCalled()
    })

    it('affiche une erreur et active isCodeError sur un code invalide (403)', async () => {
      jest.useFakeTimers()
      playerService.openSessionWithCode.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 403, error: { message: 'Invalid activity code.' } }))
      )

      await component['open']('WRONG1')

      expect(dialogErrorSpy).toHaveBeenCalledWith("Vous n'êtes pas autorisé à ouvrir cette session.")
      expect(component['isCodeError']).toBe(true)

      jest.advanceTimersByTime(2000)
      expect(component['isCodeError']).toBe(false)
      jest.useRealTimers()
    })

    it('affiche une erreur générique sans toucher à isCodeError sur une erreur inattendue', async () => {
      playerService.openSessionWithCode.mockReturnValue(throwError(() => new Error('boom')))

      await component['open']('ABC123')

      expect(dialogErrorSpy).toHaveBeenCalledWith("Une erreur est survenue lors de l'ouverture de la session.")
      expect(component['isCodeError']).toBe(false)
    })

    it('ne modifie pas le player en cas d’échec (le code reste demandé)', async () => {
      const originalPlayer = component.player
      playerService.openSessionWithCode.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 403, error: {} }))
      )

      await component['open']('WRONG1')

      expect(component.player).toBe(originalPlayer)
    })
  })
})
