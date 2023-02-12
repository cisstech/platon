/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, DialogService } from '@platon/core/browser';
import { ListResponse, User } from '@platon/core/common';
import { ResourceService } from '@platon/feature/resource/browser';
import { CreateResourceInvitation, Resource, ResourceEvent, ResourceInvitation, ResourceMember, ResourceMemberFilters, UpdateResource } from '@platon/feature/resource/common';
import { LayoutState } from '@platon/shared/ui';
import { BehaviorSubject, firstValueFrom, lastValueFrom, Subscription } from 'rxjs';

@Injectable()
export class ResourcePresenter implements OnDestroy {
  private readonly subscriptions: Subscription[] = [];
  private readonly context = new BehaviorSubject<Context>(this.defaultContext());

  private isInitialLoading = true;

  readonly contextChange = this.context.asObservable();

  constructor(
    private readonly authService: AuthService,
    private readonly dialogService: DialogService,
    private readonly activatedRoute: ActivatedRoute,
    private readonly resourceService: ResourceService,
  ) {
    this.subscriptions.push(
      this.activatedRoute.paramMap.subscribe(params => {
        this.onChangeRoute(params.get('id') as string);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  defaultContext(): Context {
    return { state: 'LOADING' };
  }

  // Watchers

  async watch(): Promise<boolean> {
    const { resource } = this.context.value as Required<Context>;
    try {
      await lastValueFrom(this.resourceService.createWatcher(resource));
      await this.refresh(resource.id);
      return true;
    } catch {
      this.alertError();
      return false;
    }
  }

  async unwatch(): Promise<boolean> {
    const { resource, user } = this.context.value as Required<Context>;
    try {
      await firstValueFrom(this.resourceService.deleteWatcher(resource, user.id));
      await this.refresh(resource.id);
      return true;
    } catch {
      this.alertError();
      return false;
    }
  }

  // Members

  async deleteMember(member: ResourceMember): Promise<boolean> {
    const { resource } = this.context.value as Required<Context>;;
    try {
      await lastValueFrom(this.resourceService.deleteMember(resource, member.userId));
      await this.refresh(resource.id);
      this.dialogService.success(`Membre supprimé !`);
      return true;
    } catch {
      // TODO show more precise error message
      this.alertError();
      return false;
    }
  }

  async searchMembers(
    filters: ResourceMemberFilters = {}
  ): Promise<ListResponse<ResourceMember>> {
    const { resource } = this.context.value as Required<Context>;
    return lastValueFrom(this.resourceService.searchMembers(resource, filters));
  }


  // Invitation

  async listInvitations(): Promise<ListResponse<ResourceInvitation>> {
    const { resource } = this.context.value as Required<Context>;
    return firstValueFrom(
      this.resourceService.listInvitations(resource)
    );
  }

  async acceptInvitation(): Promise<void> {
    const { resource, invitation } = this.context.value as Required<Context>;
    try {
      await firstValueFrom(this.resourceService.acceptInvitation(invitation));
      await this.refresh(resource.id);
      this.dialogService.success(`Invitation acceptée !`);
    } catch {
      this.alertError();
    }
  }

  async declineInvitation(): Promise<void> {
    const { invitation } = this.context.value as Required<Context>;;
    await this.deleteInvitation(invitation);
  }

  async sendInvitation(
    input: CreateResourceInvitation
  ): Promise<void> {
    await this.dialogService.loading("Envoi d'une invitation en cours..", async () => {
      const { resource } = this.context.value as Required<Context>;
      try {
        await firstValueFrom(this.resourceService.createInvitation(resource, { ...input }));
        await this.refresh(resource.id);
        this.dialogService.success(`Invitation envoyée`);
      } catch {
        this.alertError();
      }
    })
  }

  async deleteInvitation(invitation: ResourceInvitation): Promise<boolean> {
    const { resource } = this.context.value as Required<Context>;;
    try {
      await this.resourceService.deleteInvitation(invitation).toPromise();
      await this.refresh(resource.id);
      this.dialogService.success(`Invitation supprimée !`);
      return true;
    } catch {
      // TODO show more precise error message
      this.alertError();
      return false;
    }
  }

  // Event

  async listEvents(): Promise<ListResponse<ResourceEvent>> {
    const { resource } = this.context.value as Required<Context>;
    return lastValueFrom(this.resourceService.listEvents(resource));
  }

  async update(input: UpdateResource): Promise<boolean> {
    const { resource } = this.context.value as Required<Context>;;
    try {
      const changes = await firstValueFrom(
        this.resourceService.update(resource.id, input)
      );
      this.context.next({
        ...this.context.value,
        resource: changes,
      });

      this.dialogService.success('Les informations de la ressource ont bien été modifiées !');
      return true;
    } catch {
      this.alertError();
      return false;
    }
  }

  private async refresh(id: string): Promise<void> {
    const [user, resource] = await Promise.all([
      this.authService.ready(),
      firstValueFrom(this.resourceService.findById(id, this.isInitialLoading))
    ]);


    const [parent, member, watcher, invitation] = await Promise.all([
      resource.parentId
        ? firstValueFrom(this.resourceService.findById(resource.parentId))
        : Promise.resolve(undefined),
      firstValueFrom(this.resourceService.findMember(resource, user!.id)),
      firstValueFrom(this.resourceService.findWatcher(resource, user!.id)),
      firstValueFrom(this.resourceService.findInvitation(resource, user!.id)),
    ]);

    this.context.next({
      state: 'READY',
      user,
      parent,
      resource,
      member,
      invitation,
      watcher: !!watcher,
    });
  }

  private async onChangeRoute(id: string): Promise<void> {
    try {
      await this.refresh(id);
    } catch (error) {
      const status = (error as HttpErrorResponse).status || 500;
      if (status >= 400 && status < 500) {
        this.context.next({ state: 'NOT_FOUND' });
      } else {
        this.context.next({ state: 'SERVER_ERROR' });
      }
    }
    this.isInitialLoading = false;
  }

  private alertError(): void {
    this.dialogService.error(
      'Une erreur est survenue lors de cette action, veuillez réessayer un peu plus tard !',
    );
  }
}

export interface Context {
  state: LayoutState;
  user?: User;
  parent?: Resource;
  resource?: Resource;

  watcher?: boolean;
  member?: ResourceMember;
  invitation?: ResourceInvitation;
}
