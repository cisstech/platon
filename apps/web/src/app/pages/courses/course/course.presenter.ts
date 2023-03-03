/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthService, DialogService } from '@platon/core/browser';
import { ListResponse, User } from '@platon/core/common';
import { CourseService } from '@platon/feature/course/browser';
import { Course, CourseMember, CourseMemberFilters, UpdateCourse } from '@platon/feature/course/common';
import { ResourceMember } from '@platon/feature/resource/common';
import { LayoutState } from '@platon/shared/ui';
import { BehaviorSubject, firstValueFrom, Subscription } from 'rxjs';

@Injectable()
export class CoursePresenter implements OnDestroy {
  private readonly subscriptions: Subscription[] = [];
  private readonly context = new BehaviorSubject<Context>(this.defaultContext());

  readonly contextChange = this.context.asObservable();

  constructor(
    private readonly authService: AuthService,
    private readonly dialogService: DialogService,
    private readonly courseService: CourseService,
    private readonly activatedRoute: ActivatedRoute,
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

  // Members

  async deleteMember(member: ResourceMember): Promise<boolean> {
    const { course: resource } = this.context.value as Required<Context>;;
    try {
      await firstValueFrom(this.courseService.deleteMember(resource, member.userId));
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
    filters: CourseMemberFilters = {}
  ): Promise<ListResponse<CourseMember>> {
    const { course: resource } = this.context.value as Required<Context>;
    return firstValueFrom(this.courseService.searchMembers(resource, filters));
  }


  // Event

  async update(input: UpdateCourse): Promise<boolean> {
    const { course: resource } = this.context.value as Required<Context>;;
    try {
      const changes = await firstValueFrom(
        this.courseService.update(resource.id, input)
      );
      this.context.next({
        ...this.context.value,
        course: changes,
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
      firstValueFrom(this.courseService.findById(id))
    ]);


    this.context.next({
      state: 'READY',
      user,
      course: resource,
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
  course?: Course;
}
