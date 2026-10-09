import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular'
import { Button } from '../button/button'
import { Alert } from './alert'

const meta: Meta<Alert> = {
  title: 'Components/Alert',
  component: Alert,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Button] })],
  argTypes: {
    tone: { control: 'inline-radio', options: ['neutral', 'info', 'success', 'warning', 'danger'] },
  },
  args: { tone: 'neutral', icon: 'hourglass_empty', heading: 'Loading is taking longer than usual.' },
  render: (args) => ({
    props: args,
    template: `
      <pl-alert role="status" [tone]="tone" [icon]="icon" [heading]="heading">
        <p>We keep trying, you have nothing to do.</p>
      </pl-alert>
    `,
  }),
}

export default meta
type Story = StoryObj<Alert>

export const Neutral: Story = {}

export const Tones: Story = {
  render: () => ({
    template: `
      <div class="story-stack">
        <pl-alert icon="info" tone="info" heading="Grades are published on Friday.">
          <p>Students see them from 8 am.</p>
        </pl-alert>
        <pl-alert icon="check_circle" tone="success" heading="The course is ready.">
          <p>Its 48 students can open it.</p>
        </pl-alert>
        <pl-alert icon="warning" tone="warning" heading="The activity closes in 2 hours.">
          <p>Answers saved as drafts are submitted at the end.</p>
        </pl-alert>
        <pl-alert role="alert" icon="error" tone="danger" heading="The import stopped at line 12.">
          <p>The address « ines@ » is not valid.</p>
          <button plButton variant="secondary" size="sm" plAlertAction>Show the file</button>
        </pl-alert>
      </div>
    `,
  }),
}
