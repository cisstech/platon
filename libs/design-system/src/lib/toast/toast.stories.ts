import type { Meta, StoryObj } from '@storybook/angular'
import { Toast } from './toast'

const meta: Meta<Toast> = {
  title: 'Components/Toast',
  component: Toast,
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'inline-radio', options: ['info', 'success', 'warning', 'danger', 'loading'] },
  },
  args: { tone: 'success', message: 'Exercise saved', dismissLabel: 'Close' },
}

export default meta
type Story = StoryObj<Toast>

export const Success: Story = {}

export const Info: Story = {
  args: { tone: 'info', message: 'The activity opens on Monday, October 12 at 8:00 am' },
}

export const Warning: Story = {
  args: { tone: 'warning', message: 'Two students have no access period yet' },
}

export const Danger: Story = {
  args: {
    tone: 'danger',
    title: 'Save failed',
    message: 'The server did not answer. Your answer is kept on this device.',
  },
}

export const Loading: Story = {
  args: { tone: 'loading', message: 'Importing 128 grades', dismissLabel: undefined },
}

export const Stack: Story = {
  render: () => ({
    template: `
      <div class="story-stack">
        <pl-toast tone="success" message="Exercise saved" dismissLabel="Close" />
        <pl-toast tone="danger" title="Save failed" message="The server did not answer." dismissLabel="Close" />
        <pl-toast tone="loading" message="Importing 128 grades" />
      </div>
    `,
  }),
}
