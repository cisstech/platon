import { provideRouter, withHashLocation } from '@angular/router'
import { type Meta, type StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular'
import { Button } from '../button/button'
import { NotificationItem, NotificationList } from './notification'

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60_000)

const meta: Meta<NotificationItem> = {
  title: 'Components/Notification',
  component: NotificationItem,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: [provideRouter([{ path: '**', children: [] }], withHashLocation())] }),
    moduleMetadata({ imports: [Button, NotificationList] }),
  ],
}

export default meta
type Story = StoryObj<NotificationItem>

export const Mixed: Story = {
  name: 'Read and unread, with and without a course',
  render: () => ({
    props: { twoHours: hoursAgo(2), yesterday: hoursAgo(26), lastWeek: hoursAgo(24 * 9) },
    template: `
      <pl-notification-list class="story-notifications">
        <pl-notification-item heading="The correction of Lab 3: conditions is available" context="Algorithms 1"
          [date]="twoHours" icon="rate_review" hue="lagoon" [unread]="true" unreadLabel="Unread:" href="#/activity" />
        <pl-notification-item heading="New copies to correct in Quiz 2" context="Calculus 1"
          [date]="yesterday" icon="inbox" hue="olive" [unread]="true" unreadLabel="Unread:" href="#/corrections" />
        <pl-notification-item heading="Your access to Graphs was removed" context="Circle L1"
          [date]="yesterday" icon="groups" unreadLabel="Unread:" />
        <pl-notification-item heading="Enrolment in the course Calculus 1"
          [date]="lastWeek" icon="person_add" hue="olive" unreadLabel="Unread:" href="#/course" />
      </pl-notification-list>
    `,
  }),
}

export const Invitation: Story = {
  name: 'Invitation, answered from the row',
  render: () => ({
    props: { now: hoursAgo(0.3) },
    template: `
      <pl-notification-list class="story-notifications">
        <pl-notification-item heading="Camille Martin invites you to collaborate on Graphs" [date]="now" icon="mail"
          [unread]="true" unreadLabel="Unread:">
          <button type="button" plButton variant="primary" size="sm" plNotificationActions>Accept</button>
          <button type="button" plButton variant="secondary" size="sm" plNotificationActions>Decline</button>
        </pl-notification-item>
      </pl-notification-list>
    `,
  }),
}
