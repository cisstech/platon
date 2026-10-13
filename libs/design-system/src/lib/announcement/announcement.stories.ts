import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular'
import { AnnouncementDisclosure } from './announcement-disclosure/announcement-disclosure'
import { AnnouncementList } from './announcement-list/announcement-list'
import { AnnouncementRow } from './announcement-row/announcement-row'
import { AnnouncementRowSkeleton } from './announcement-row-skeleton/announcement-row-skeleton'

const thisYear = new Date().getFullYear()
const day = (month: number, date: number, year = thisYear) => new Date(year, month, date, 9)

const meta: Meta<AnnouncementRow> = {
  title: 'Components/Announcement',
  component: AnnouncementRow,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [AnnouncementDisclosure, AnnouncementList, AnnouncementRowSkeleton] })],
}

export default meta
type Story = StoryObj<AnnouncementRow>

export const List: Story = {
  name: 'List beside the open one, read and unread',
  render: () => ({
    props: { corrections: day(8, 27), maintenance: day(8, 25), player: day(8, 12), lastYear: day(7, 28, thisYear - 1) },
    template: `
      <pl-announcement-list class="story-announcements">
        <pl-announcement-row heading="Detailed corrections are coming" summary="Your corrected copy shows beside your grade."
          [date]="corrections" icon="rate_review" unread unreadLabel="Unread:" />
        <pl-announcement-row heading="Maintenance on October 4" summary="PLaTon will be down on Sunday from 7 to 9 am."
          [date]="maintenance" icon="construction" current unreadLabel="Unread:" />
        <pl-announcement-row heading="New: the exercise player" summary="A clearer copy, results in the margin."
          [date]="player" icon="auto_awesome" unreadLabel="Unread:" />
        <pl-announcement-row heading="Back to school" summary="Last year's courses are in Archived."
          [date]="lastYear" icon="info" unreadLabel="Unread:" />
      </pl-announcement-list>
    `,
  }),
}

export const Disclosure: Story = {
  name: 'Open in place, on a phone',
  render: () => ({
    props: { corrections: day(8, 27), maintenance: day(8, 25), player: day(8, 12) },
    template: `
      <div class="story-announcements-phone">
        <pl-announcement-disclosure heading="Detailed corrections are coming" summary="Your corrected copy shows beside your grade."
          [date]="corrections" icon="rate_review" unread unreadLabel="Unread:">
          <div class="pl-prose"><p>Soon.</p></div>
        </pl-announcement-disclosure>
        <pl-announcement-disclosure heading="Maintenance on October 4" summary="PLaTon will be down on Sunday from 7 to 9 am."
          [date]="maintenance" icon="construction" [expanded]="true">
          <p class="pl-text-muted">Published on September 25 by Sophie Lambert, for everyone</p>
          <div class="pl-prose">
            <p>PLaTon will be down on Sunday, October 4, from 7 to 9 am, while the server that runs the exercises is updated.</p>
            <p>No graded activity takes place then. Attempts under way at 7 am will be saved.</p>
          </div>
        </pl-announcement-disclosure>
        <pl-announcement-disclosure heading="New: the exercise player" summary="A clearer copy, results in the margin."
          [date]="player" icon="auto_awesome">
          <div class="pl-prose"><p>Open an exercise to try it.</p></div>
        </pl-announcement-disclosure>
      </div>
    `,
  }),
}

export const Loading: Story = {
  name: 'On their way',
  render: () => ({
    template: `
      <div class="story-announcements">
        <pl-announcement-row-skeleton /><pl-announcement-row-skeleton /><pl-announcement-row-skeleton />
      </div>
    `,
  }),
}
