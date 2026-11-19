import type { Meta, StoryObj } from '@storybook/angular'
import { Glyph } from './glyph'

const meta: Meta<Glyph> = {
  title: 'Components/Glyph',
  component: Glyph,
  tags: ['autodocs'],
  argTypes: {
    name: { control: 'inline-radio', options: ['course', 'activity', 'exercise', 'circle', 'paper'] },
    size: { control: 'inline-radio', options: [1, 2] },
  },
  args: { name: 'course', size: 2 },
}

export default meta
type Story = StoryObj<Glyph>

export const Default: Story = {}

export const All: Story = {
  name: 'The five glyphs',
  render: () => ({
    template: `
      <div class="story-row">
        <pl-glyph name="course" [size]="2" label="Course" />
        <pl-glyph name="activity" [size]="2" label="Activity" />
        <pl-glyph name="exercise" [size]="2" label="Exercise" />
        <pl-glyph name="circle" [size]="2" label="Circle" />
        <pl-glyph name="paper" [size]="2" label="Answer sheet" />
      </div>
      <div class="story-row">
        <pl-glyph name="course" />
        <pl-glyph name="activity" />
        <pl-glyph name="exercise" />
        <pl-glyph name="circle" />
        <pl-glyph name="paper" />
      </div>
    `,
  }),
}
