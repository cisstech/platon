import type { Meta, StoryObj } from '@storybook/angular'
import { Icon } from './icon'
import { ICON_NAMES } from './icon-names'

const meta: Meta<Icon> = {
  title: 'Components/Icon',
  component: Icon,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'select', options: ICON_NAMES },
    size: { control: 'inline-radio', options: [undefined, 1, 2, 3, 4] },
    label: { control: 'text' },
  },
  args: { name: 'school', size: 3 },
}

export default meta
type Story = StoryObj<Icon>

export const Default: Story = {}

export const WithLabel: Story = {
  name: 'With an accessible name',
  args: { name: 'notifications', label: 'Notifications' },
}

export const Sizes: Story = {
  render: (args) => ({
    props: args,
    template: `
      <div class="story-row">
        <span><pl-icon [name]="name" [size]="1" /> 1, 16 px</span>
        <span><pl-icon [name]="name" [size]="2" /> 2, 18 px</span>
        <span><pl-icon [name]="name" [size]="3" /> 3, 20 px</span>
        <span><pl-icon [name]="name" [size]="4" /> 4, 24 px</span>
      </div>
    `,
  }),
}

export const FollowsText: Story = {
  name: 'Follows the text',
  render: () => ({
    template: `
      <div class="story-stack">
        <p class="pl-text-body"><pl-icon name="schedule" /> Due on October 12 at 11:59 pm</p>
        <p class="pl-text-title"><pl-icon name="school" /> Algorithms and Programming 1</p>
        <p class="pl-text-body story-success"><pl-icon name="check_circle" /> Exercise passed, 100 out of 100</p>
        <p class="pl-text-body story-danger"><pl-icon name="error" /> Submitted 2 days late</p>
      </div>
    `,
  }),
}

export const Catalog: Story = {
  render: () => ({
    props: { names: ICON_NAMES },
    template: `
      <ul class="story-grid">
        @for (name of names; track name) {
          <li><pl-icon [name]="name" [size]="4" /><code>{{ name }}</code></li>
        }
      </ul>
    `,
  }),
}
