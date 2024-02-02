import {
  ChangeDetectorRef,
  Directive,
  Input,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core'
import { User } from '@platon/core/common'
import { AuthService } from '../api/auth.service'

interface AuthContext {
  user: User
}

@Directive({
  standalone: true,
  selector: '[authIf]',
  exportAs: 'authIf',
})
export class AuthIfDirective implements OnChanges {
  @Input()
  authIf: string | string[] = []

  @Input()
  authIfElse?: TemplateRef<unknown>

  @Input()
  authIfPending?: TemplateRef<unknown>

  @Input()
  authIfDenied?: (error: unknown) => void | Promise<void>

  @Input()
  authIfAuthorized?: (user: User) => void | Promise<void>

  static ngTemplateContextGuard(dir: AuthIfDirective, ctx: unknown): ctx is AuthContext {
    return true
  }

  constructor(
    private readonly authService: AuthService,
    private readonly templateRef: TemplateRef<AuthContext>,
    private readonly viewContainerRef: ViewContainerRef,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['authIf']) {
      return
    }
    this.viewContainerRef.clear()
    if (this.authIfPending) {
      this.viewContainerRef.createEmbeddedView(this.authIfPending)
      this.changeDetectorRef.detectChanges()
    }

    this.authService
      .ready()
      .then((user) => {
        if (!user) {
          this.denied().catch(console.error)
          return
        }

        const conditions: string[] = []
        if (!Array.isArray(this.authIf)) {
          if (this.authIf.trim()) {
            conditions.push(this.authIf.trim().toLowerCase())
          } else {
            conditions.push('connected')
          }
        } else {
          conditions.push(...(this.authIf?.map((e) => e.trim().toLowerCase()) || []))
        }

        if (
          !conditions.length ||
          conditions.some((condition) => {
            return condition === user.role.toLowerCase() || condition === 'connected'
          })
        ) {
          this.accepted(user as User).catch(console.error)
        } else {
          this.denied().catch(console.error)
        }
      })
      .catch((error) => {
        this.denied(error).catch(console.error)
      })
  }

  private async denied(error?: unknown): Promise<void> {
    try {
      if (this.authIfDenied) {
        await this.authIfDenied(error)
      }

      this.viewContainerRef.clear()
      if (this.authIfElse) {
        this.viewContainerRef.createEmbeddedView(this.authIfElse)
      }
    } finally {
      this.changeDetectorRef.detectChanges()
    }
  }

  private async accepted(user: User): Promise<void> {
    try {
      if (this.authIfAuthorized) {
        await this.authIfAuthorized(user)
      }
      this.viewContainerRef.clear()
      this.viewContainerRef.createEmbeddedView(this.templateRef, { user: user })
    } catch (error) {
      this.denied(error).catch(console.error)
    } finally {
      this.changeDetectorRef.detectChanges()
    }
  }
}
