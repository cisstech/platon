/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { provideNoopAnimations } from '@angular/platform-browser/animations'
import { ActivatedRoute } from '@angular/router'
import { Title } from '@angular/platform-browser'
import { MatDialog } from '@angular/material/dialog'
import { NzModalService } from 'ng-zorro-antd/modal'
import { provideNzIconsTesting } from 'ng-zorro-antd/icon/testing'
import { of, throwError } from 'rxjs'

import { NzDialogService, StorageService } from '@platon/core/browser'
import { InputFileService, ResourceFileService, ResourceService } from '@platon/feature/resource/browser'
import { Resource } from '@platon/feature/resource/common'
import { BuilderService } from '@platon/feature/builder/browser'
import { PleInput } from '@platon/feature/compiler'

import { BuilderPage } from './builder.page'
import { WritableSignal } from '@angular/core'

// BuilderPage importe (directement ou via un enfant standalone qu'il importe) un module ng-zorro
// qui fournit lui-même NzModalService dans ses `providers`, ce qui masque tout override de
// provider tenté au niveau racine de TestBed (même piège que DialogService/DialogModule, voir
// player-activity.component.spec.ts). On patch donc le prototype et on délègue vers les mocks du
// test actif plutôt que d'utiliser un provider useValue inefficace.
let activeMocks: Mocks | undefined

const CONFIG_URL = 'http://files/main.plc'
const OVERRIDES_URL = 'http://files/main.plo'

const baseResource = (overrides: Record<string, any> = {}): Resource =>
  ({
    id: 'resource-id',
    name: 'Exercice - Sans titre',
    status: 'DRAFT',
    templateId: 'template-id',
    templateVersion: 'latest',
    ...overrides,
  } as Resource)

const inputFor = (overrides: Partial<PleInput> = {}): PleInput => ({
  name: 'level',
  type: 'string',
  description: '',
  value: 'debutant',
  ...overrides,
})

interface Mocks {
  resourceService: { find: jest.Mock; update: jest.Mock; delete: jest.Mock }
  resourceFileService: { read: jest.Mock; update: jest.Mock; create: jest.Mock }
  http: { get: jest.Mock }
  storageService: { set: jest.Mock; remove: jest.Mock }
  builderService: { transformInputsWithAI: jest.Mock }
  inputFileService: { init: jest.Mock; register: jest.Mock; save: jest.Mock }
  matDialog: { open: jest.Mock }
  nzModal: { info: jest.Mock; create: jest.Mock }
  title: { setTitle: jest.Mock }
}

/**
 * Construit les mocks par défaut pour un chargement "happy path" du builder :
 * la ressource référence un template dont main.plc expose `inputs`, et un fichier
 * main.plo existant contient `overrides` (ou aucun fichier si `overrides` vaut null,
 * pour simuler un nouvel exercice sans overrides encore sauvegardés).
 */
function createMocks(
  resource: Resource,
  options: { inputs?: PleInput[]; overrides?: Record<string, unknown> | null } = {}
): Mocks {
  const inputs = options.inputs ?? [inputFor()]
  const overrides = options.overrides === undefined ? {} : options.overrides

  return {
    resourceService: {
      find: jest.fn().mockReturnValue(of(resource)),
      update: jest.fn().mockReturnValue(of(resource)),
      delete: jest.fn().mockReturnValue(of(undefined)),
    },
    resourceFileService: {
      read: jest.fn((_resourceId: string, path: string) => {
        if (path === 'main.plc') return of({ url: CONFIG_URL } as any)
        if (overrides === null) return throwError(() => new Error('main.plo introuvable'))
        return of({ url: OVERRIDES_URL } as any)
      }),
      update: jest.fn().mockReturnValue(of(undefined)),
      create: jest.fn().mockReturnValue(of(undefined)),
    },
    http: {
      get: jest.fn((url: string) => {
        if (url === CONFIG_URL) return of(JSON.stringify({ inputs }))
        if (url === OVERRIDES_URL) return of(JSON.stringify(overrides ?? {}))
        return of('{}')
      }),
    },
    storageService: {
      set: jest.fn().mockReturnValue(of(undefined)),
      remove: jest.fn().mockReturnValue(of(undefined)),
    },
    builderService: { transformInputsWithAI: jest.fn() },
    inputFileService: { init: jest.fn(), register: jest.fn(), save: jest.fn().mockResolvedValue(undefined) },
    matDialog: { open: jest.fn() },
    nzModal: { info: jest.fn(), create: jest.fn() },
    title: { setTitle: jest.fn() },
  }
}

async function createComponent(
  mocks: Mocks,
  route: { id?: string | null; version?: string | null } = {}
): Promise<{ fixture: ComponentFixture<BuilderPage>; component: BuilderPage }> {
  const resourceId = route.id === undefined ? 'resource-id' : route.id
  activeMocks = mocks

  await TestBed.configureTestingModule({
    imports: [BuilderPage],
    providers: [
      provideNzIconsTesting(),
      provideNoopAnimations(),
      { provide: ResourceService, useValue: mocks.resourceService },
      { provide: ResourceFileService, useValue: mocks.resourceFileService },
      { provide: StorageService, useValue: mocks.storageService },
      { provide: BuilderService, useValue: mocks.builderService },
      { provide: InputFileService, useValue: mocks.inputFileService },
      { provide: HttpClient, useValue: mocks.http },
      { provide: MatDialog, useValue: mocks.matDialog },
      { provide: Title, useValue: mocks.title },
      {
        provide: ActivatedRoute,
        useValue: {
          snapshot: {
            paramMap: { get: (key: string) => (key === 'id' ? resourceId : null) },
            queryParamMap: { get: (key: string) => (key === 'version' ? route.version ?? null : null) },
          },
        },
      },
    ],
  }).compileComponents()

  const fixture = TestBed.createComponent(BuilderPage)
  const component = fixture.componentInstance
  // On appelle ngOnInit directement plutôt que de passer par detectChanges()/whenStable() :
  // ngOnInit enchaîne plusieurs firstValueFrom(...) successifs, et la détection de stabilité
  // de la zone Angular ne garantit pas d'attendre toute la chaîne avant de rendre la main
  // (particulièrement avec des fake timers actifs dans d'autres describe blocks). Comme ces
  // tests n'inspectent jamais le DOM rendu, court-circuiter detectChanges() est à la fois plus
  // fiable et suffisant.
  await component.ngOnInit()

  return { fixture, component }
}

describe('BuilderPage', () => {
  let dialogSuccessSpy: jest.SpyInstance
  let dialogErrorSpy: jest.SpyInstance
  let nzModalCreateSpy: jest.SpyInstance
  let nzModalInfoSpy: jest.SpyInstance

  beforeEach(() => {
    // DialogModule fournit sa propre instance de NzDialogService via son @NgModule({ providers: [...] }),
    // ce qui masque tout override de provider fourni au niveau racine de TestBed (BuilderPage importe
    // DialogModule directement) : on patch donc le prototype plutôt qu'un provider useValue inefficace.
    dialogSuccessSpy = jest.spyOn(NzDialogService.prototype, 'success').mockImplementation(() => undefined as any)
    dialogErrorSpy = jest.spyOn(NzDialogService.prototype, 'error').mockImplementation(() => undefined as any)

    // Même piège pour NzModalService (voir le commentaire au-dessus de `activeMocks`).
    nzModalCreateSpy = jest
      .spyOn(NzModalService.prototype, 'create')
      .mockImplementation((config: any) => activeMocks!.nzModal.create(config))
    nzModalInfoSpy = jest
      .spyOn(NzModalService.prototype, 'info')
      .mockImplementation((config: any) => activeMocks!.nzModal.info(config))
  })

  afterEach(() => {
    dialogSuccessSpy.mockRestore()
    dialogErrorSpy.mockRestore()
    nzModalCreateSpy.mockRestore()
    nzModalInfoSpy.mockRestore()
    activeMocks = undefined
  })

  describe('ngOnInit', () => {
    it('charge la ressource et définit le titre de la page', async () => {
      const resource = baseResource({ name: 'Mon exercice' })
      const mocks = createMocks(resource)

      const { component } = await createComponent(mocks)

      expect(component['resource']()).toEqual(resource)
      expect(mocks.title.setTitle).toHaveBeenCalledWith('Mon exercice')
    })

    it("erreur 400 si l'identifiant de ressource est manquant dans la route", async () => {
      const resource = baseResource()
      const mocks = createMocks(resource)

      const { component } = await createComponent(mocks, { id: null })

      expect(component['error']()?.status).toBe(400)
      expect(component['error']()?.error.message).toBe('ID de ressource manquant')
      expect(mocks.resourceService.find).not.toHaveBeenCalled()
    })

    it("erreur 400 si la ressource n'utilise pas de template", async () => {
      const resource = baseResource({ templateId: undefined, templateVersion: undefined })
      const mocks = createMocks(resource)

      const { component } = await createComponent(mocks)

      expect(component['error']()?.status).toBe(400)
      expect(component['error']()?.error.message).toBe("Cette ressource n'utilise pas de template")
    })

    it('ne redemande jamais la ressource "template" (évite le 403 sur le cercle du template)', async () => {
      // Régression : ngOnInit appelait auparavant resourceService.find({ id: resource.templateId }),
      // ce qui déclenchait la vérification `permissions.read` du cercle du template côté backend et
      // bloquait l'accès au builder pour des utilisateurs n'ayant aucun droit sur ce cercle, alors
      // même qu'ils avaient les droits sur leur propre ressource. Seule la lecture du fichier
      // main.plc (endpoint public, sans vérification de permission) est désormais nécessaire.
      const resource = baseResource()
      const mocks = createMocks(resource)

      const { component } = await createComponent(mocks)

      expect(component['error']()).toBeFalsy()
      expect(mocks.resourceService.find).toHaveBeenCalledTimes(1)
      expect(mocks.resourceService.find).toHaveBeenCalledWith({ id: resource.id })
      expect(mocks.resourceFileService.read).toHaveBeenCalledWith(
        resource.templateId,
        'main.plc',
        resource.templateVersion
      )
    })

    it('charge les overrides existants et pré-remplit les inputs', async () => {
      const resource = baseResource()
      const mocks = createMocks(resource, {
        inputs: [inputFor({ name: 'level', value: 'debutant' })],
        overrides: { level: 'expert' },
      })

      const { component } = await createComponent(mocks)

      expect(component['overrides']()).toEqual({ level: 'expert' })
      expect(component['inputs']()[0].value).toBe('expert')
    })

    it("gère l'absence de fichier d'overrides sans planter (nouvel exercice)", async () => {
      const resource = baseResource()
      const mocks = createMocks(resource, { overrides: null })

      const { component } = await createComponent(mocks)

      expect(component['error']()).toBeFalsy()
      expect(component['overrides']()).toEqual({})
    })

    it('capture dans error() une erreur HTTP levée pendant le chargement', async () => {
      const resource = baseResource()
      const mocks = createMocks(resource)
      mocks.resourceService.find = jest.fn().mockReturnValue(
        throwError(
          () =>
            new HttpErrorResponse({
              status: 403,
              statusText: 'Forbidden',
              error: { message: `Operation not allowed on resource: ${resource.id}` },
            })
        )
      )

      const { component } = await createComponent(mocks)

      expect(component['error']()?.status).toBe(403)
      expect(component['loading']()).toBe(false)
    })
  })

  describe('onInputChange', () => {
    let component: BuilderPage
    let mocks: Mocks

    beforeEach(async () => {
      jest.useFakeTimers()
      const resource = baseResource()
      // overrides déjà alignés sur la valeur par défaut de l'input, pour pouvoir distinguer un
      // "non-changement" réel : onInputChange compare la nouvelle valeur à overrides()[name], pas
      // à la valeur d'origine de l'input.
      mocks = createMocks(resource, {
        inputs: [inputFor({ name: 'level', value: 'debutant' })],
        overrides: { level: 'debutant' },
      })
      ;({ component } = await createComponent(mocks))
      mocks.storageService.set.mockClear()
    })

    afterEach(() => {
      jest.useRealTimers()
    })

    it('marque hasUnsavedChanges seulement si la valeur change réellement', () => {
      const input = component['inputs']()[0]

      component['onInputChange']({ ...input, value: 'debutant' })
      expect(component['hasUnsavedChanges']()).toBe(false)

      component['onInputChange']({ ...input, value: 'expert' })
      expect(component['hasUnsavedChanges']()).toBe(true)
      expect(component['overrides']()['level']).toBe('expert')
    })

    it('déclenche un rechargement débouncé de la preview', () => {
      const input = component['inputs']()[0]

      component['onInputChange']({ ...input, value: 'expert' })
      expect(mocks.storageService.set).not.toHaveBeenCalled()

      jest.advanceTimersByTime(1)
      expect(mocks.storageService.set).toHaveBeenCalled()
    })
  })

  describe('save', () => {
    const init = async (resourceOverrides: Record<string, any> = {}) => {
      const resource = baseResource(resourceOverrides)
      const mocks = createMocks(resource)
      const { component } = await createComponent(mocks)
      return { component, mocks }
    }

    it('redirige vers les options de sauvegarde au lieu de sauvegarder au premier save si le nom est encore celui par défaut et que la ressource est en brouillon', async () => {
      const { component, mocks } = await init({ name: 'Exercice - Sans titre', status: 'DRAFT' })
      const selectSettingSpy = jest.spyOn(component as any, 'selectSetting')

      await component['save']()

      expect(selectSettingSpy).toHaveBeenCalled()
      expect(mocks.resourceFileService.update).not.toHaveBeenCalled()
      expect(mocks.resourceFileService.create).not.toHaveBeenCalled()
    })

    it('met à jour le fichier main.plo existant', async () => {
      const { component, mocks } = await init({ name: 'Mon super exercice', status: 'PUBLISHED' })

      await component['save']()

      expect(mocks.resourceFileService.update).toHaveBeenCalledWith(
        { url: OVERRIDES_URL },
        { content: expect.any(String) }
      )
      expect(mocks.resourceFileService.create).not.toHaveBeenCalled()
      expect(component['hasUnsavedChanges']()).toBe(false)
    })

    it("crée le fichier main.plo s'il n'existe pas encore", async () => {
      const { component, mocks } = await init({ name: 'Mon super exercice', status: 'PUBLISHED' })
      mocks.resourceFileService.read = jest.fn((_resourceId: string, path: string) => {
        if (path === 'main.plc') return of({ url: CONFIG_URL } as any)
        return throwError(() => new Error('main.plo introuvable'))
      })

      await component['save']()

      expect(mocks.resourceFileService.create).toHaveBeenCalledWith('resource-id', [
        { path: 'main.plo', content: expect.any(String) },
      ])
    })

    it("affiche un message d'erreur si la sauvegarde échoue", async () => {
      const { component, mocks } = await init({ name: 'Mon super exercice', status: 'PUBLISHED' })
      // update() ET son fallback create() doivent échouer : un échec de update() seul est intercepté
      // par le catch interne de persistOverrides qui retente via create() (cas "fichier inexistant").
      mocks.resourceFileService.update = jest.fn().mockReturnValue(throwError(() => new Error('boom')))
      mocks.resourceFileService.create = jest.fn().mockReturnValue(throwError(() => new Error('boom')))

      await component['save']()

      expect(component['saving']()).toBe(false)
      expect(dialogErrorSpy).toHaveBeenCalled()
    })
  })

  describe('canDeactivate', () => {
    const init = async () => {
      const resource = baseResource({ name: 'Mon super exercice', status: 'PUBLISHED' })
      const mocks = createMocks(resource)
      const { component } = await createComponent(mocks)
      return { component, mocks }
    }

    const clickButton = (mocks: Mocks, label: string) => {
      mocks.nzModal.create = jest.fn((config: any) => {
        // En production, l'utilisateur clique bien après que create() a retourné (modalRef est donc
        // déjà assigné) : on diffère l'appel pour reproduire fidèlement ce timing plutôt que
        // d'appeler onClick() de façon synchrone pendant create(), ce qui casserait modalRef (TDZ).
        queueMicrotask(() => config.nzFooter.find((button: any) => button.label === label)?.onClick())
        return { destroy: jest.fn() }
      })
    }

    it("supprime automatiquement la ressource si aucune sauvegarde n'a été faite", async () => {
      // Si, après la création d'un exercice, l'utilisateur quitte sans avoir sauvegardé, la ressource est supprimée.
      // Sauvegarder doit mettre à jour le champ updatedAt de la ressource.
      const { component, mocks } = await init()
      const date = new Date()
      const currentResource = component['resource'] as WritableSignal<Resource | undefined>
      currentResource.set({ ...currentResource()!, createdAt: date, updatedAt: date })

      await expect(component.canDeactivate()).resolves.toBe(true)
      expect(mocks.resourceService.delete).toHaveBeenCalled()
    })

    it('ne supprime pas la ressource si la date de modification est différende de la date de création', async () => {
      const { component, mocks } = await init()
      const creation = new Date('2026-09-21T08:49:00Z')
      const update = new Date('2026-09-23T09:49:00Z')
      const currentResource = component['resource'] as WritableSignal<Resource | undefined>
      currentResource.set({ ...currentResource()!, createdAt: creation, updatedAt: update })

      await expect(component.canDeactivate()).resolves.toBe(true)
      expect(mocks.resourceService.delete).not.toHaveBeenCalled()
    })

    it('annule la sortie si l\'utilisateur choisit "Annuler"', async () => {
      const { component, mocks } = await init()
      component['hasUnsavedChanges'].set(true)
      clickButton(mocks, 'Annuler')

      await expect(component.canDeactivate()).resolves.toBe(false)
    })

    it('sauvegarde puis autorise la sortie si l\'utilisateur choisit "Sauvegarder"', async () => {
      const { component, mocks } = await init()
      component['overrides'].set({ level: 'expert' })
      component['hasUnsavedChanges'].set(true)
      clickButton(mocks, 'Sauvegarder')

      await expect(component.canDeactivate()).resolves.toBe(true)

      expect(mocks.resourceFileService.update).toHaveBeenCalled()
      expect(mocks.resourceService.delete).not.toHaveBeenCalled()
    })

    it('supprime la ressource et autorise la sortie si l\'utilisateur choisit "Quitter et supprimer"', async () => {
      const { component, mocks } = await init()
      component['hasUnsavedChanges'].set(true)
      clickButton(mocks, 'Quitter et supprimer')

      await expect(component.canDeactivate()).resolves.toBe(true)

      expect(mocks.resourceService.delete).toHaveBeenCalledWith(component['resource']())
    })
  })

  describe('saveTitle', () => {
    const init = async () => {
      const resource = baseResource({ name: 'Ancien nom' })
      const mocks = createMocks(resource)
      const { component } = await createComponent(mocks)
      return { component, mocks }
    }

    const eventFor = (value: string) => ({ target: { value } } as unknown as Event)

    it('renomme la ressource si le nouveau nom est différent et non vide', async () => {
      const { component, mocks } = await init()
      mocks.resourceService.update = jest.fn().mockReturnValue(of(baseResource({ name: 'Nouveau nom' })))

      await component['saveTitle'](eventFor('Nouveau nom'))

      expect(mocks.resourceService.update).toHaveBeenCalledWith('resource-id', { name: 'Nouveau nom' })
      expect(component['resource']()?.name).toBe('Nouveau nom')
      expect(component['isEditingTitle']()).toBe(false)
    })

    it("ne fait rien si le nom est vide ou identique à l'existant", async () => {
      const { component, mocks } = await init()

      await component['saveTitle'](eventFor('   '))
      expect(mocks.resourceService.update).not.toHaveBeenCalled()

      await component['saveTitle'](eventFor('Ancien nom'))
      expect(mocks.resourceService.update).not.toHaveBeenCalled()
    })

    it('affiche une erreur si le renommage échoue', async () => {
      const { component, mocks } = await init()
      mocks.resourceService.update = jest.fn().mockReturnValue(throwError(() => new Error('boom')))

      await component['saveTitle'](eventFor('Nouveau nom'))

      expect(component['isEditingTitle']()).toBe(false)
      expect(dialogErrorSpy).toHaveBeenCalled()
    })
  })

  describe('onVersionChanged', () => {
    const init = async () => {
      const resource = baseResource()
      const mocks = createMocks(resource, { inputs: [inputFor({ name: 'level', value: 'debutant' })] })
      const { component } = await createComponent(mocks)
      return { component, mocks }
    }

    it('met à jour les overrides et les inputs avec la version sélectionnée', async () => {
      const { component } = await init()

      await component['onVersionChanged']({ version: 'v2', overrides: { level: 'expert' } })

      expect(component['overrides']()).toEqual({ level: 'expert' })
      expect(component['inputs']()[0].value).toBe('expert')
    })

    it('marque hasUnsavedChanges si la version diffère de la version courante', async () => {
      const { component } = await init()
      expect(component['currentVersion']()).toBe('latest')

      await component['onVersionChanged']({ version: 'v2', overrides: {} })

      expect(component['hasUnsavedChanges']()).toBe(true)
    })
  })
})
