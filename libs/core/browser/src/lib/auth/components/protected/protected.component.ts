import { CommonModule } from '@angular/common'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  Input,
  TemplateRef,
  ViewChild,
} from '@angular/core'
import { NzSpinModule } from 'ng-zorro-antd/spin'
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton'

import { UiError403Component, UiError404Component } from '@platon/shared/ui'
import { User } from '@platon/core/common'

import { AuthIfDirective } from '../../directives'

@Component({
  standalone: true,
  selector: 'auth-protected',
  templateUrl: './protected.component.html',
  styleUrls: ['./protected.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzSpinModule, NzSkeletonModule, UiError403Component, UiError404Component, AuthIfDirective],
})
export class ProtectedComponent {
  @ContentChild(TemplateRef)
  template!: TemplateRef<unknown>

  @ViewChild('shimmer', { read: TemplateRef, static: true })
  shimmerTemplate!: TemplateRef<unknown>

  @ViewChild('denied', { read: TemplateRef, static: true })
  deniedTemplate!: TemplateRef<unknown>

  @ViewChild('notFound', { read: TemplateRef, static: true })
  notFoundTemplate!: TemplateRef<unknown>

  @ViewChild('spinner', { read: TemplateRef, static: true })
  spinnerTemplate!: TemplateRef<unknown>

  @Input() placeholder?: TemplateRef<unknown>
  @Input() authorizations: string[] = ['connected']
  @Input() authorized?: (user: User) => void | Promise<void>
  @Input() unauthorized?: (error?: unknown) => void | Promise<void>

  user!: User

  constructor(private readonly changeDetectorRef: ChangeDetectorRef) {}

  protected async onConnect(user: User): Promise<void> {
    this.user = user
    await this.authorized?.(user)
    this.changeDetectorRef.markForCheck()
  }

  protected async onError(error: unknown): Promise<void> {
    await this.unauthorized?.(error)
  }
}
