import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular'
import { Icon } from '../icon/icon'
import { Tooltip } from '../tooltip/tooltip'
import { Button } from './button'

const meta: Meta<Button> = {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Icon, Tooltip] })],
  argTypes: {
    variant: { control: 'select', options: ['primary', 'secondary', 'ghost', 'icon', 'cover', 'cover-quiet'] },
    size: { control: 'inline-radio', options: ['sm', 'md', 'lg'] },
    tone: { control: 'inline-radio', options: ['default', 'danger'] },
    loading: { control: 'boolean' },
  },
  args: { variant: 'primary', size: 'md', tone: 'default', loading: false },
  render: (args) => ({
    props: args,
    template: `
      <button plButton [variant]="variant" [size]="size" [tone]="tone" [loading]="loading">
        <pl-icon name="add" />Add an activity
      </button>
    `,
  }),
}

export default meta
type Story = StoryObj<Button>

export const Primary: Story = {}

export const Variants: Story = {
  render: () => ({
    template: `
      <div class="story-row">
        <button plButton variant="primary"><pl-icon name="add" />Add an activity</button>
        <button plButton variant="secondary"><pl-icon name="share" />Share</button>
        <button plButton variant="ghost"><pl-icon name="monitoring" />Follow</button>
        <button plButton variant="icon" plTooltip="More actions"><pl-icon name="more_horiz" /></button>
      </div>
    `,
  }),
}

export const Sizes: Story = {
  render: () => ({
    template: `
      <div class="story-row">
        <button plButton variant="secondary" size="sm">Small, 32 px</button>
        <button plButton variant="secondary">Medium, 36 px</button>
        <button plButton variant="secondary" size="lg">Large, 44 px</button>
      </div>
    `,
  }),
}

export const Danger: Story = {
  render: () => ({
    template: `
      <div class="story-row">
        <button plButton variant="secondary" tone="danger" size="sm"><pl-icon name="delete" />Delete the course</button>
        <button plButton variant="primary" tone="danger">Delete the course</button>
        <button plButton variant="ghost" tone="danger"><pl-icon name="delete" />Remove</button>
      </div>
    `,
  }),
}

export const Loading: Story = {
  render: () => ({
    template: `
      <div class="story-row">
        <button plButton variant="primary" loading>Save</button>
        <button plButton variant="secondary" loading>Import grades</button>
      </div>
    `,
  }),
}

export const Disabled: Story = {
  render: () => ({
    template: `
      <div class="story-row">
        <button plButton variant="primary" disabled>Publish</button>
        <button plButton variant="secondary" disabled>Duplicate</button>
      </div>
    `,
  }),
}

export const Cover: Story = {
  name: 'On the cover',
  render: () => ({
    template: `
      <div class="story-cover">
        <button plButton variant="cover"><pl-icon name="add" />Create</button>
        <button plButton variant="cover-quiet"><pl-icon name="add" />Create</button>
      </div>
    `,
  }),
}
