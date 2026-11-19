import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { Topbar } from './topbar'

const meta: Meta<Topbar> = {
  title: 'Components/Topbar',
  component: Topbar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [moduleMetadata({ imports: [Button, Icon] })],
  args: { heading: 'Home' },
  render: (args) => ({
    props: args,
    template: `
      <pl-topbar [heading]="heading">
        <button plButton plTopbarStart variant="cover-icon" size="lg" aria-label="Open the navigation">
          <pl-icon name="menu" />
        </button>
      </pl-topbar>
    `,
  }),
}

export default meta
type Story = StoryObj<Topbar>

export const Default: Story = {}

export const LongTitle: Story = {
  name: 'Long title, cut',
  args: { heading: 'Algorithms and programming 1, first year, first semester' },
}
