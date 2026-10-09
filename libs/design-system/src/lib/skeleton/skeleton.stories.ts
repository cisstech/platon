import type { Meta, StoryObj } from '@storybook/angular'
import { Skeleton } from './skeleton'

const meta: Meta<Skeleton> = {
  title: 'Components/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
  argTypes: { shape: { control: 'inline-radio', options: ['line', 'heading', 'button'] } },
  args: { shape: 'line', width: '60%' },
}

export default meta
type Story = StoryObj<Skeleton>

export const Line: Story = {}

export const Shapes: Story = {
  name: 'The shape of a row',
  render: () => ({
    template: `
      <div class="story-stack">
        <pl-skeleton shape="heading" width="60%" />
        <pl-skeleton width="40%" />
        <pl-skeleton shape="button" />
      </div>
    `,
  }),
}
