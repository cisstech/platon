/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { Injectable, OnDestroy, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { AuthService, DialogService, TagService } from '@platon/core/browser'
import { Level, ListResponse, Topic, User } from '@platon/core/common'
import { ResourceFileService, ResourceService } from '@platon/feature/resource/browser'
import {
  CircleTree,
  CreateResourceInvitation,
  FileVersions,
  Resource,
  ResourceEvent,
  ResourceEventFilters,
  ResourceFile,
  ResourceInvitation,
  ResourceMember,
  ResourceMemberFilters,
  ResourceStatistic,
  UpdateResource,
} from '@platon/feature/resource/common'
import { ResourceDashboardModel, ResultService } from '@platon/feature/result/browser'
import { LayoutState, layoutStateFromError } from '@platon/shared/ui'
import { ReadCommitResult } from 'isomorphic-git'
import { BehaviorSubject, Observable, Subscription, firstValueFrom } from 'rxjs'

@Injectable()
export class ResourcePresenter implements OnDestroy {
  private readonly subscriptions: Subscription[] = []

  private readonly tagService = inject(TagService)
  private readonly authService = inject(AuthService)
  private readonly fileService = inject(ResourceFileService)
  private readonly resultService = inject(ResultService)
  private readonly dialogService = inject(DialogService)
  private readonly activatedRoute = inject(ActivatedRoute)
  private readonly resourceService = inject(ResourceService)

  private readonly context = new BehaviorSubject<Context>(this.defaultContext())

  private isInitialLoading = true

  readonly contextChange = this.context.asObservable()

  constructor() {
    this.subscriptions.push(
      this.activatedRoute.paramMap.subscribe((params) => {
        this.onChangeRoute(params.get('id') as string).catch(console.error)
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  defaultContext(): Context {
    return { state: 'LOADING', version: 'latest' }
  }

  availableTopics(): Observable<Topic[]> {
    return this.tagService.listTopics()
  }

  availableLevels(): Observable<Level[]> {
    return this.tagService.listLevels()
  }

  // Watchers

  async watch(): Promise<boolean> {
    const { resource } = this.context.value as Required<Context>
    try {
      await firstValueFrom(this.resourceService.createWatcher(resource))
      await this.refresh(resource.id)
      return true
    } catch {
      this.alertError()
      return false
    }
  }

  async unwatch(): Promise<boolean> {
    const { resource, user } = this.context.value as Required<Context>
    try {
      await firstValueFrom(this.resourceService.deleteWatcher(resource, user.id))
      await this.refresh(resource.id)
      return true
    } catch {
      this.alertError()
      return false
    }
  }

  // Files
  async files(version?: string): Promise<[ResourceFile, FileVersions]> {
    const { resource } = this.context.value
    if (resource) {
      // using Promise.all here can be problematic since directories are created on demand.
      const tree = await firstValueFrom(this.fileService.tree(resource, version))
      const versions = await firstValueFrom(this.fileService.versions(resource))
      return [tree, versions]
    }
    throw new ReferenceError('missing resource')
  }

  async createTag(tag: string, message: string): Promise<boolean> {
    const { resource } = this.context.value as Required<Context>
    try {
      await firstValueFrom(this.fileService.release(resource, { name: tag, message }))
      await this.refresh(resource.id)
      return true
    } catch {
      this.alertError()
      return false
    }
  }

  async versions(): Promise<FileVersions> {
    const { resource } = this.context.value
    if (resource) {
      return firstValueFrom(this.fileService.versions(resource))
    }
    throw new ReferenceError('missing resource')
  }

  switchVersion(version: string): void {
    this.updateContext({
      ...this.context.value,
      version,
    })
  }

  // Members

  async join(): Promise<boolean> {
    const { resource } = this.context.value as Required<Context>
    try {
      await firstValueFrom(this.resourceService.join(resource))
      await this.refresh(resource.id)
      this.dialogService.info('Votre demande a bien été envoyée, vous serez notifié dès que vous serez accepté.')
      return true
    } catch {
      this.alertError()
      return false
    }
  }

  async unjoin(): Promise<boolean> {
    const { resource } = this.context.value as Required<Context>
    try {
      await firstValueFrom(this.resourceService.deleteMember(resource, this.context.value.user!.id))
      await this.refresh(resource.id)
      this.dialogService.info('Votre demande a bien été supprimée.')
      return true
    } catch {
      this.alertError()
      return false
    }
  }

  async acceptJoin(member: ResourceMember): Promise<boolean> {
    const { resource } = this.context.value as Required<Context>
    try {
      await firstValueFrom(this.resourceService.acceptJoin(resource, member.userId))
      await this.refresh(resource.id)
      this.dialogService.success(`La demande a été acceptée et une notification a été envoyée.`)
      return true
    } catch {
      this.alertError()
      return false
    }
  }

  async declineJoin(member: ResourceMember): Promise<boolean> {
    const { resource } = this.context.value as Required<Context>
    try {
      await firstValueFrom(this.resourceService.declineJoin(resource, member.userId))
      await this.refresh(resource.id)
      this.dialogService.success(`La demande a été refusée.`)
      return true
    } catch {
      this.alertError()
      return false
    }
  }

  async deleteMember(member: ResourceMember): Promise<boolean> {
    const { resource } = this.context.value as Required<Context>
    try {
      await firstValueFrom(this.resourceService.deleteMember(resource, member.userId))
      await this.refresh(resource.id)
      this.dialogService.success(`Membre supprimé !`)
      return true
    } catch {
      this.alertError()
      return false
    }
  }

  async searchMembers(filters: ResourceMemberFilters = {}): Promise<ListResponse<ResourceMember>> {
    const { resource } = this.context.value as Required<Context>
    return firstValueFrom(this.resourceService.searchMembers(resource, filters))
  }

  // Invitation

  async searchInvitations(): Promise<ListResponse<ResourceInvitation>> {
    const { resource } = this.context.value as Required<Context>
    return firstValueFrom(this.resourceService.listInvitations(resource))
  }

  async sendInvitation(input: CreateResourceInvitation): Promise<void> {
    await this.dialogService.loading("Envoi d'une invitation en cours..", async () => {
      const { resource } = this.context.value as Required<Context>
      try {
        await firstValueFrom(this.resourceService.createInvitation(resource, { ...input }))
        await this.refresh(resource.id)
        this.dialogService.success(`Invitation envoyée`)
      } catch {
        this.alertError()
      }
    })
  }

  async deleteInvitation(invitation: ResourceInvitation): Promise<boolean> {
    const { resource } = this.context.value as Required<Context>
    try {
      await firstValueFrom(this.resourceService.deleteInvitation(invitation))
      await this.refresh(resource.id)
      this.dialogService.success(`Invitation supprimée !`)
      return true
    } catch {
      // TODO show more precise error message
      this.alertError()
      return false
    }
  }

  // Event

  async listEvents(filters?: ResourceEventFilters): Promise<ListResponse<ResourceEvent>> {
    const { resource } = this.context.value as Required<Context>
    return firstValueFrom(this.resourceService.listEvents(resource, filters))
  }

  async update(input: UpdateResource): Promise<boolean> {
    const { resource } = this.context.value as Required<Context>
    try {
      const changes = await firstValueFrom(this.resourceService.update(resource.id, input))
      this.updateContext({
        ...this.context.value,
        resource: changes,
      })

      this.dialogService.success('Les informations de la ressource ont bien été modifiées !')
      return true
    } catch {
      this.alertError()
      return false
    }
  }

  // Dashboard

  async dashboard(): Promise<ResourceDashboardModel | undefined> {
    const { resource } = this.context.value as Required<Context>
    if (resource.type === 'CIRCLE') return undefined
    return firstValueFrom(this.resultService.resourceDashboard(resource.id))
  }

  // Moving

  async moveToOwnerCircle(): Promise<boolean> {
    const { resource } = this.context.value as Required<Context>
    try {
      await firstValueFrom(this.resourceService.moveToOwnerCircle(resource))
      this.dialogService.success('La ressource a bien été déplacée.')
      return true
    } catch {
      this.alertError()
      return false
    }
  }

  // Private

  private async refresh(id: string): Promise<void> {
    const [user, resource, circles] = await Promise.all([
      this.authService.ready(),
      firstValueFrom(
        this.resourceService.find({
          id,
          markAsViewed: this.isInitialLoading,
          expands: ['parent', 'statistic'],
        })
      ),
      firstValueFrom(this.resourceService.tree()),
    ])

    this.updateContext({
      state: 'READY',
      user,
      parent: resource.parent,
      resource,
      statistic: resource.statistic,
      circles,
    })
  }

  private async onChangeRoute(id: string): Promise<void> {
    try {
      await this.refresh(id)
    } catch (error) {
      this.updateContext({ state: layoutStateFromError(error) })
    }
    this.isInitialLoading = false
  }

  private alertError(): void {
    this.dialogService.error('Une erreur est survenue lors de cette action, veuillez réessayer un peu plus tard !')
  }

  private updateContext(context: Partial<Context>): void {
    const newContext = {
      ...this.context.value,
      ...context,
    }

    this.context.next({
      ...newContext,
      version: newContext?.version || 'latest',
      editorUrl: newContext.resource
        ? this.resourceService.editorUrl(newContext.resource.id, newContext.version)
        : undefined,
      previewUrl: newContext.resource
        ? this.resourceService.previewUrl(newContext.resource.id, newContext.version)
        : undefined,
    })
  }

  // Log

  async log(): Promise<ReadCommitResult[]> {
    const { resource } = this.context.value as Required<Context>
    return firstValueFrom(this.fileService.log(resource))
  }
}

export interface Context {
  state: LayoutState
  version: string
  user?: User
  parent?: Resource
  resource?: Resource

  editorUrl?: string
  previewUrl?: string

  circles?: CircleTree
  statistic?: ResourceStatistic
}
