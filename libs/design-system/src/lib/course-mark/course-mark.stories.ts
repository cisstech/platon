import type { Meta, StoryObj } from '@storybook/angular'
import { COURSE_HUES } from '../hue/course-hue'
import { CourseMark } from './course-mark'

const meta: Meta<CourseMark> = {
  title: 'Components/Course mark',
  component: CourseMark,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<CourseMark>

export const Hues: Story = {
  name: 'Every hue, both sizes',
  render: () => ({
    props: { hues: COURSE_HUES },
    template: `
      <div class="story-marks">
        @for (hue of hues; track hue) {
        <pl-course-mark monogram="AP1" [hue]="hue" />
        <pl-course-mark monogram="AP1" [hue]="hue" size="sm" />
        }
      </div>
    `,
  }),
}
