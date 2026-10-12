import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular'
import { Button } from '../button/button'
import { Step } from './step/step'
import { Steps } from './steps'

const meta: Meta<Steps> = {
  title: 'Components/Steps',
  component: Steps,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Button, Step] })],
  render: () => ({
    template: `
      <pl-steps class="story-card" aria-label="To start">
        <pl-step heading="Create your course" current>
          <p>A course gathers your students and your activities, arranged in sections: weeks, chapters.</p>
          <a plButton variant="primary" plStepAction href="#">Create a course</a>
        </pl-step>
        <pl-step heading="Find or write an exercise">
          <p>The shared resources already hold exercises ready to use. You can also write one, alone or from a template.</p>
          <a plButton variant="secondary" plStepAction href="#">Browse the resources</a>
          <a plButton variant="secondary" plStepAction href="#">Start from a template</a>
        </pl-step>
        <pl-step heading="Add an activity">
          <p>An activity offers a series of exercises in a section of your course. Available once your course exists.</p>
        </pl-step>
      </pl-steps>
    `,
  }),
}

export default meta
type Story = StoryObj<Steps>

export const ToStart: Story = { name: 'Three steps, the first one now' }
