import type { Meta, StoryObj } from '@storybook/angular'
import { Dialog } from './dialog'

const meta: Meta<Dialog> = {
  title: 'Components/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  argTypes: {
    tone: { control: 'inline-radio', options: ['default', 'danger'] },
  },
  args: {
    heading: 'Regenerate the access code?',
    confirmLabel: 'Regenerate',
    cancelLabel: 'Cancel',
    tone: 'default',
    confirmDisabled: false,
  },
  render: (args) => ({
    props: args,
    template: `
      <pl-dialog
        [heading]="heading"
        [confirmLabel]="confirmLabel"
        [cancelLabel]="cancelLabel"
        [tone]="tone"
        [confirmDisabled]="confirmDisabled"
      >
        <p>The current code of Algorithms and Programming 1 will stop working. Students who have not joined yet will need the new one.</p>
      </pl-dialog>
    `,
  }),
}

export default meta
type Story = StoryObj<Dialog>

export const Default: Story = {}

export const Danger: Story = {
  args: {
    heading: 'Delete the course?',
    confirmLabel: 'Delete the course',
    tone: 'danger',
  },
}

export const ConfirmDisabled: Story = {
  name: 'Confirmation disabled',
  args: { heading: 'Rename the folder', confirmLabel: 'Rename', confirmDisabled: true },
}
