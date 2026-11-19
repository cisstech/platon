import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { Tooltip } from './tooltip'

const meta: Meta<Tooltip> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Button, Icon] })],
}

export default meta
type Story = StoryObj<Tooltip>

export const IconButtons: Story = {
  name: 'On icon buttons',
  render: () => ({
    template: `
      <p class="pl-text-muted">Hover a button, or reach it with Tab: the tooltip shows its name.</p>
      <div class="story-row">
        <button plButton variant="icon" plTooltip="Edit the name"><pl-icon name="edit" /></button>
        <button plButton variant="icon" plTooltip="Settings"><pl-icon name="settings" /></button>
        <button plButton variant="icon" plTooltip="More actions"><pl-icon name="more_horiz" /></button>
      </div>
    `,
  }),
}
