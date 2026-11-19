import { Test } from '@nestjs/testing'
import { NotificationService } from '@platon/feature/notification/server'
import { DataSource } from 'typeorm'
import { ActivityCorrectorView } from '../activity-corrector/activity-corrector.view'
import { ActivityMemberView } from '../activity-member/activity-member.view'
import { CourseMemberView } from '../course-member/course-member.view'
import { CourseMonitorPresenceService } from '../course-monitor-presence/course-monitor-presence.service'
import { CourseNotificationService } from './course-notification.service'

describe('CourseNotificationService', () => {
  let service: CourseNotificationService
  let dataSource: { query: jest.Mock }
  let notificationService: jest.Mocked<Pick<NotificationService, 'sendToUser' | 'sendToAllUsers' | 'declareSignals'>>
  let monitorPresenceService: jest.Mocked<Pick<CourseMonitorPresenceService, 'getActiveMonitoringUsers'>>

  beforeEach(async () => {
    dataSource = { query: jest.fn() }
    notificationService = {
      sendToUser: jest.fn().mockResolvedValue(undefined),
      sendToAllUsers: jest.fn().mockResolvedValue(undefined),
      declareSignals: jest.fn(),
    }
    monitorPresenceService = { getActiveMonitoringUsers: jest.fn() }

    const module = await Test.createTestingModule({
      providers: [
        CourseNotificationService,
        { provide: DataSource, useValue: dataSource },
        { provide: NotificationService, useValue: notificationService },
        { provide: CourseMonitorPresenceService, useValue: monitorPresenceService },
      ],
    }).compile()

    service = module.get(CourseNotificationService)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('onModuleInit', () => {
    it("devrait déclarer comme signaux les notifications du suivi d'une activité et du lecteur", () => {
      service.onModuleInit()

      expect(notificationService.declareSignals).toHaveBeenCalledWith('EXERCISE-CHANGES', 'MODERATION-ACTIVITY-CHANGES')
    })
  })

  describe('notifyCourseMemberBeingCreated', () => {
    it('devrait notifier chaque membre', async () => {
      await service.notifyCourseMemberBeingCreated([
        { id: 'u1', courseId: 'c1', courseName: 'Course' } as CourseMemberView,
      ])

      expect(notificationService.sendToUser).toHaveBeenCalledWith('u1', {
        type: 'COURSE-MEMBER-CREATION',
        courseId: 'c1',
        courseName: 'Course',
      })
    })

    it('ne devrait pas propager une erreur si la notification échoue', async () => {
      notificationService.sendToUser.mockRejectedValue(new Error('boom'))

      await expect(
        service.notifyCourseMemberBeingCreated([{ id: 'u1', courseId: 'c1', courseName: 'Course' } as CourseMemberView])
      ).resolves.toBeUndefined()
    })
  })

  describe('notifyActivityMemberBeingCreated', () => {
    it('devrait notifier chaque membre', async () => {
      await service.notifyActivityMemberBeingCreated([
        {
          id: 'u1',
          courseId: 'c1',
          courseName: 'Course',
          activityId: 'a1',
          activityName: 'Activity',
        } as ActivityMemberView,
      ])

      expect(notificationService.sendToUser).toHaveBeenCalledWith('u1', {
        type: 'ACTIVITY-MEMBER-CREATION',
        courseId: 'c1',
        courseName: 'Course',
        activityId: 'a1',
        activityName: 'Activity',
      })
    })
  })

  describe('notifyUserAboutCorrection', () => {
    it("ne devrait rien envoyer si l'activité est introuvable", async () => {
      dataSource.query.mockResolvedValue([])

      await service.notifyUserAboutCorrection('activity-1', 'user-1')

      expect(notificationService.sendToUser).not.toHaveBeenCalled()
    })

    it('devrait notifier avec les infos activité/cours résolues', async () => {
      dataSource.query.mockResolvedValue([
        { activityId: 'a1', activityName: 'Activity', courseId: 'c1', courseName: 'Course' },
      ])

      await service.notifyUserAboutCorrection('activity-1', 'user-1')

      expect(notificationService.sendToUser).toHaveBeenCalledWith('user-1', {
        type: 'CORRECTION-AVAILABLE',
        activityId: 'a1',
        activityName: 'Activity',
        courseId: 'c1',
        courseName: 'Course',
      })
    })

    it('ne devrait pas propager une erreur SQL', async () => {
      dataSource.query.mockRejectedValue(new Error('db down'))

      await expect(service.notifyUserAboutCorrection('activity-1', 'user-1')).resolves.toBeUndefined()
    })
  })

  describe('notifyCorrectorsAboutPending / notifyCorrectorsBeingCreated / notifyCorrectorsBeingRemoved', () => {
    const corrector = {
      id: 'u1',
      activityId: 'a1',
      activityName: 'Activity',
      courseId: 'c1',
      courseName: 'Course',
    } as ActivityCorrectorView

    it('devrait notifier les correcteurs en attente', async () => {
      await service.notifyCorrectorsAboutPending([corrector])

      expect(notificationService.sendToUser).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ type: 'CORRECTION-PENDING' })
      )
    })

    it('devrait notifier les correcteurs ajoutés', async () => {
      await service.notifyCorrectorsBeingCreated([corrector])

      expect(notificationService.sendToUser).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ type: 'CORRECTOR-CREATED' })
      )
    })

    it('devrait notifier les correcteurs retirés', async () => {
      await service.notifyCorrectorsBeingRemoved([corrector])

      expect(notificationService.sendToUser).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ type: 'CORRECTOR-REMOVED' })
      )
    })
  })

  describe('notifyActivityBeingClosed', () => {
    it('devrait notifier chaque utilisateur ayant une session sur cette activité', async () => {
      dataSource.query
        .mockResolvedValueOnce([{ user_id: 'u1' }, { user_id: 'u2' }])
        .mockResolvedValueOnce([{ activityId: 'a1', activityName: 'Activity', courseId: 'c1', courseName: 'Course' }])

      await service.notifyActivityBeingClosed('a1')

      expect(notificationService.sendToUser).toHaveBeenCalledTimes(2)
      expect(notificationService.sendToUser).toHaveBeenCalledWith(
        'u1',
        expect.objectContaining({ type: 'ACTIVITY-CLOSED' })
      )
    })

    it('ne devrait notifier personne sans session active', async () => {
      dataSource.query.mockResolvedValueOnce([]).mockResolvedValueOnce([])

      await service.notifyActivityBeingClosed('a1')

      expect(notificationService.sendToUser).not.toHaveBeenCalled()
    })

    it('ne devrait pas propager une erreur SQL', async () => {
      dataSource.query.mockRejectedValue(new Error('db down'))

      await expect(service.notifyActivityBeingClosed('a1')).resolves.toBeUndefined()
    })
  })

  describe('notifyExerciseChanges', () => {
    it('ne devrait rien envoyer si la session est introuvable', async () => {
      dataSource.query.mockResolvedValue([])

      await service.notifyExerciseChanges('user-1', 'session-1', {} as never)

      expect(notificationService.sendToAllUsers).not.toHaveBeenCalled()
    })

    it('ne devrait rien envoyer sans moniteur actif', async () => {
      dataSource.query.mockResolvedValue([{ session_id: 's1', activity_id: 'a1', course_id: 'c1' }])
      monitorPresenceService.getActiveMonitoringUsers.mockReturnValue([])

      await service.notifyExerciseChanges('user-1', 'session-1', {} as never)

      expect(notificationService.sendToAllUsers).not.toHaveBeenCalled()
    })

    it('devrait notifier les moniteurs actifs', async () => {
      dataSource.query.mockResolvedValue([{ session_id: 's1', activity_id: 'a1', course_id: 'c1' }])
      monitorPresenceService.getActiveMonitoringUsers.mockReturnValue(['teacher-1'])

      await service.notifyExerciseChanges('user-1', 'session-1', { foo: 'bar' } as never)

      expect(notificationService.sendToAllUsers).toHaveBeenCalledWith(
        ['teacher-1'],
        expect.objectContaining({ type: 'EXERCISE-CHANGES', userId: 'user-1' })
      )
    })
  })

  describe('notifyModerationActivityChanges', () => {
    it("devrait notifier l'utilisateur avec l'activité", async () => {
      await service.notifyModerationActivityChanges('user-1', { activity: { id: 'a1' } } as never)

      expect(notificationService.sendToUser).toHaveBeenCalledWith('user-1', {
        type: 'MODERATION-ACTIVITY-CHANGES',
        activity: { id: 'a1' },
      })
    })

    it('ne devrait pas propager une erreur', async () => {
      notificationService.sendToUser.mockRejectedValue(new Error('boom'))

      await expect(
        service.notifyModerationActivityChanges('user-1', { activity: {} } as never)
      ).resolves.toBeUndefined()
    })
  })
})
