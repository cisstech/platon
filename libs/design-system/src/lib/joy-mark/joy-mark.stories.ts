import { type Meta, type StoryObj } from '@storybook/angular'
import { JoyMark } from './joy-mark'

const meta: Meta<JoyMark> = {
  title: 'Components/Joy mark',
  component: JoyMark,
  tags: ['autodocs'],
  render: () => ({
    template: `
      <h1 class="story-title">
        <pl-joy-mark />Welcome to PLaTon, Inès
      </h1>
    `,
  }),
}

export default meta
type Story = StoryObj<JoyMark>

export const Welcome: Story = {}
