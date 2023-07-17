import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core'
import { Subscription } from 'rxjs'

import { MatCardModule } from '@angular/material/card'

import {
  ResourceInvitationFormComponent,
  ResourceInvitationTableComponent,
  ResourceMemberTableComponent,
} from '@platon/feature/resource/browser'
import { CreateResourceInvitation, ResourceInvitation, ResourceMember } from '@platon/feature/resource/common'

import { ResourcePresenter } from '../../resource.presenter'

@Component({
  standalone: true,
  selector: 'app-resource-members',
  templateUrl: './members.page.html',
  styleUrls: ['./members.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatCardModule,
    ResourceMemberTableComponent,
    ResourceInvitationFormComponent,
    ResourceInvitationTableComponent,
  ],
})
export class ResourceMembersPage implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = []
  private readonly presenter = inject(ResourcePresenter)
  private readonly changeDetectorRef = inject(ChangeDetectorRef)

  protected members: ResourceMember[] = []
  protected invitations: ResourceInvitation[] = []
  protected excludes: string[] = []
  protected context = this.presenter.defaultContext()

  protected get excludeFromDelete(): string[] {
    return [this.context.resource?.ownerId as string, this.context.user?.id as string].filter(Boolean)
  }

  protected get canEdit(): boolean {
    return !!this.context.resource?.permissions?.write
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async (context) => {
        this.context = context
        if (context.resource) {
          await Promise.all([this.loadMembers(), this.loadInvitations()])

          this.excludes = [
            ...this.members.map((m) => m.userId),
            ...this.invitations.map((i) => i.inviteeId),
            context.resource.ownerId,
            context.user?.id as string,
          ]
        }

        this.changeDetectorRef.markForCheck()
      })
    )
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe())
  }

  protected async sendInvitation(input: CreateResourceInvitation): Promise<void> {
    await this.presenter.sendInvitation(input)
  }

  protected async deleteMember(member: ResourceMember): Promise<void> {
    if (await this.presenter.deleteMember(member)) {
      this.members = this.members.filter((e) => e.userId !== member.userId)
      this.changeDetectorRef.markForCheck()
    }
  }

  protected async loadMembers(): Promise<void> {
    this.members = (await this.presenter.searchMembers()).resources
    this.changeDetectorRef.markForCheck()
  }

  protected async deleteInvitation(invitation: ResourceInvitation): Promise<void> {
    if (await this.presenter.deleteInvitation(invitation)) {
      this.invitations = this.invitations.filter((e) => e.inviteeId !== invitation.inviteeId)
      this.changeDetectorRef.markForCheck()
    }
  }

  protected async loadInvitations(): Promise<void> {
    this.invitations = (await this.presenter.searchInvitations()).resources
    this.changeDetectorRef.markForCheck()
  }
}
