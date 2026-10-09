import { provideRouter, withHashLocation } from '@angular/router'
import { type Meta, type StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular'
import { Button } from '../button/button'
import { Empty } from '../empty/empty'
import { Icon } from '../icon/icon'
import { NotificationItem, NotificationList, NotificationSkeleton } from '../notification/notification'
import { Panel } from './panel'

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60_000)

const meta: Meta<Panel> = {
  title: 'Components/Panel',
  component: Panel,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    applicationConfig({ providers: [provideRouter([{ path: '**', children: [] }], withHashLocation())] }),
    moduleMetadata({ imports: [Button, Empty, Icon, NotificationItem, NotificationList, NotificationSkeleton] }),
  ],
}

export default meta
type Story = StoryObj<Panel>

const head = `
  <button type="button" plButton variant="ghost" size="sm" plPanelActions>Mark all as read</button>
  <button type="button" plButton variant="icon" size="sm" aria-label="More actions" plPanelActions>
    <pl-icon name="more_horiz" />
  </button>
`

const list = `
  <pl-notification-list>
    <pl-notification-item heading="The correction of Lab 3: conditions is available" context="Algorithms 1"
      [date]="twoHours" icon="rate_review" hue="lagoon" [unread]="true" unreadLabel="Unread:" href="#/activity" />
    <pl-notification-item heading="Activity Quiz 2 closed" context="Calculus 1"
      [date]="yesterday" icon="lock" hue="olive" unreadLabel="Unread:" href="#/course" />
    <pl-notification-item heading="Enrolment in the course Calculus 1"
      [date]="lastWeek" icon="person_add" hue="olive" unreadLabel="Unread:" href="#/course" />
  </pl-notification-list>
`

const dates = { twoHours: hoursAgo(2), yesterday: hoursAgo(26), lastWeek: hoursAgo(24 * 9) }

const popover = (body: string) => ({
  props: dates,
  template: `
    <div class="story-popover">
      <pl-panel heading="Notifications" closeLabel="Close the notifications">${head}${body}</pl-panel>
    </div>
  `,
})

export const Notifications: Story = { name: 'Notifications, beside the cover', render: () => popover(list) }

export const Empty_: Story = {
  name: 'Nothing to say',
  render: () =>
    popover(`
      <pl-empty heading="No notification" icon="notifications" [level]="3" compact>
        <p>You will find here what happens in your courses and your resources.</p>
      </pl-empty>
    `),
}

export const Loading: Story = {
  name: 'Loading',
  render: () =>
    popover(`
      <pl-notification-skeleton /><pl-notification-skeleton /><pl-notification-skeleton />
    `),
}

export const Failed: Story = {
  name: 'Failed to load',
  render: () =>
    popover(`
      <pl-empty role="alert" heading="Your notifications could not be loaded" icon="cloud_off" tone="danger" [level]="3" compact>
        <p>Your connection works, PLaTon does not answer.</p>
        <button type="button" plButton variant="primary" plEmptyAction><pl-icon name="replay" />Retry</button>
      </pl-empty>
    `),
}

export const Screen: Story = {
  name: 'Full screen on a phone',
  render: () => ({
    props: dates,
    template: `
      <div class="story-screen">
        <pl-panel heading="Notifications" closeLabel="Close the notifications" layout="screen">
          <button type="button" plButton variant="cover-icon" size="lg" aria-label="More actions" plPanelActions>
            <pl-icon name="more_horiz" />
          </button>
          <span plPanelTools>1 unread</span>
          <button type="button" plButton variant="ghost" plPanelTools>Mark all as read</button>
          ${list}
        </pl-panel>
      </div>
    `,
  }),
}
