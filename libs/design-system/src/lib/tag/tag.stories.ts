import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular'
import { Avatar } from '../avatar/avatar'
import { Button } from '../button/button'
import { Count } from '../count/count'
import { Icon } from '../icon/icon'
import { Tag } from './tag'

const meta: Meta<Tag> = {
  title: 'Components/Tag, count and avatar',
  component: Tag,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Avatar, Button, Count, Icon] })],
}

export default meta
type Story = StoryObj<Tag>

export const Tones: Story = {
  name: 'Tag tones',
  render: () => ({
    template: `
      <div class="story-row">
        <pl-tag>Draft</pl-tag>
        <pl-tag tone="success" icon="check_circle">Open</pl-tag>
        <pl-tag tone="warning" icon="schedule">Closes tonight</pl-tag>
        <pl-tag tone="danger" icon="error">Late</pl-tag>
        <pl-tag tone="info" icon="event">Scheduled</pl-tag>
        <pl-tag tone="graded">Graded</pl-tag>
      </div>
    `,
  }),
}

export const CourseHues: Story = {
  name: 'Course hues',
  render: () => ({
    props: { hues: ['coral', 'amber', 'olive', 'mint', 'lagoon', 'cornflower', 'lilac', 'raspberry'] },
    template: `
      <div class="story-row">
        @for (hue of hues; track hue) {
          <pl-tag tone="course" [hue]="hue" icon="school">Algorithms 1</pl-tag>
        }
      </div>
    `,
  }),
}

export const Counts: Story = {
  render: () => ({
    template: `
      <div class="story-row">
        <span>Members <pl-count [value]="308" /></span>
        <span class="story-relative">
          <button plButton variant="icon" aria-label="Notifications, 3 unread">
            <pl-icon name="notifications" /><pl-count [value]="3" variant="badge" />
          </button>
        </span>
      </div>
    `,
  }),
}

export const Avatars: Story = {
  render: () => ({
    template: `
      <div class="story-row">
        <span><pl-avatar [person]="{ firstName: 'Inès', lastName: 'Benali' }" /> Inès Benali</span>
        <span><pl-avatar [person]="{ username: 'mcisse' }" /> mcisse</span>
        <pl-avatar [person]="{ firstName: 'Karim', lastName: 'Haddad' }" label="Karim Haddad" />
      </div>
    `,
  }),
}
