import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { firstValueFrom } from 'rxjs'

import { NzCommentModule } from 'ng-zorro-antd/comment'
import { NzFormModule } from 'ng-zorro-antd/form'
import { NzInputModule } from 'ng-zorro-antd/input'
import { NzListModule } from 'ng-zorro-antd/list'

import { ResultService } from '@platon/feature/result/browser'

import { AuthService, DialogModule, DialogService, UserAvatarComponent } from '@platon/core/browser'
import { User } from '@platon/core/common'
import { SessionComment } from '@platon/feature/result/common'
import { NzButtonModule } from 'ng-zorro-antd/button'

@Component({
  standalone: true,
  selector: 'player-comments',
  templateUrl: './player-comments.component.html',
  styleUrls: ['./player-comments.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,

    NzFormModule,
    NzListModule,
    NzInputModule,
    NzButtonModule,
    NzCommentModule,

    DialogModule,
    UserAvatarComponent,
  ],
})
export class PlayerCommentsComponent implements OnInit {
  @Input() answerId!: string
  @Input() sessionId!: string
  @Input() canComment = false

  protected comments: SessionComment[] = []
  protected input = ''
  protected user!: User
  protected submitting = false

  constructor(
    private readonly authService: AuthService,
    private readonly dialogService: DialogService,
    private readonly resultService: ResultService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    this.user = (await this.authService.ready()) as User
    const response = await firstValueFrom(
      this.resultService.listComments(this.sessionId, this.answerId)
    )
    this.comments = response.resources
    this.changeDetectorRef.markForCheck()
  }

  protected async onSubmitComment(): Promise<void> {
    try {
      this.submitting = true
      const comment = await firstValueFrom(
        this.resultService.createComment(this.sessionId, this.answerId, { comment: this.input })
      )
      this.input = ''
      this.comments = [...this.comments, comment]
    } catch {
      this.dialogService.error(
        `Le commentaire n'a pas pu être envoyé. Veuillez réessayer plus tard.`
      )
    } finally {
      this.submitting = false
      this.changeDetectorRef.markForCheck()
    }
  }
}
