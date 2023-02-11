import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, DialogService } from '@platon/core/browser';
import { User } from '@platon/core/common';
import { ResourceService } from '@platon/feature/resource/browser';
import { Resource, UpdateResource } from '@platon/feature/resource/common';
import { LayoutState } from '@platon/shared/ui';
import { BehaviorSubject, firstValueFrom, Subscription } from 'rxjs';

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
        console.log(params)
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


  async update(input: UpdateResource): Promise<boolean> {
    const { resource } = this.context.value as Required<Context>;;
    try {
      const changes = await firstValueFrom(
        this.resourceService.updateResource(resource.id, input)
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

  private async onChangeRoute(id: string): Promise<void> {
    const [user, resource] = await Promise.all([
      this.authService.ready(),
      firstValueFrom(this.resourceService.findResourceById(id, this.isInitialLoading))
    ]);

    this.context.next({
      state: 'READY',
      user,
      resource
    });

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
  resource?: Resource;
}
