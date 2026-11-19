import { type Meta, type StoryObj } from '@storybook/angular'
import { COURSE_HUES } from '../hue/course-hue'
import { Progress } from './progress'

const meta: Meta<Progress> = {
  title: 'Components/Progress',
  component: Progress,
  tags: ['autodocs'],
  args: { value: 34, max: 59, hue: 'lagoon', label: 'Your progress in Algorithms 1' },
  render: (args) => ({
    props: args,
    template: `<div class="story-narrow"><pl-progress [value]="value" [max]="max" [hue]="hue" [label]="label" /></div>`,
  }),
}

export default meta
type Story = StoryObj<Progress>

export const Course: Story = {}

export const Hues: Story = {
  name: 'In the hue of each course, neutral without, done in warmth',
  render: () => ({
    props: { hues: COURSE_HUES },
    template: `
      <div class="story-stack story-narrow">
        @for (hue of hues; track hue) {
        <pl-progress [value]="$index + 2" [max]="10" [hue]="hue" [label]="'Progress, ' + hue" />
        }
        <pl-progress [value]="3" [max]="8" label="Progress without a course" />
        <pl-progress [value]="40" [max]="40" hue="raspberry" [done]="true" label="Course finished" />
      </div>
    `,
  }),
}
