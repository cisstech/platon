import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { Empty } from './empty'

const meta: Meta<Empty> = {
  title: 'Components/Empty',
  component: Empty,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Button, Icon] })],
  argTypes: {
    glyph: { control: 'select', options: [undefined, 'course', 'activity', 'exercise', 'circle', 'paper'] },
    tone: { control: 'inline-radio', options: ['neutral', 'danger'] },
    level: { control: 'inline-radio', options: [2, 3] },
  },
  args: { heading: 'No course yet', compact: false, tone: 'neutral', level: 2 },
  render: (args) => ({
    props: args,
    template: `
      <pl-empty [heading]="heading" [glyph]="glyph" [icon]="icon" [tone]="tone" [level]="level" [compact]="compact" [code]="code">
        <p>A course gathers your students and your activities, arranged in sections.</p>
        <button plButton variant="secondary" plEmptyAction><pl-icon name="add" />Create a course</button>
      </pl-empty>
    `,
  }),
}

export default meta
type Story = StoryObj<Empty>

export const Illustration: Story = { name: 'With the blank paper' }

export const Compact: Story = { name: 'Compact, inside a zone', args: { compact: true, level: 3 } }

export const Glyph: Story = { name: 'With the glyph of the object', args: { glyph: 'course' } }

export const Neutral: Story = {
  name: 'With an icon, nothing to create',
  render: () => ({
    template: `
      <pl-empty heading="Nothing to correct" icon="task_alt">
        <p>The copies to correct show here as soon as a student submits one.</p>
      </pl-empty>
    `,
  }),
}

export const Error: Story = {
  name: 'With an icon, an error',
  render: () => ({
    template: `
      <pl-empty role="alert" heading="The members could not be loaded" icon="cloud_off" tone="danger" code="Error 503">
        <p>Your connection works, PLaTon is not answering. Nothing is lost.</p>
        <button plButton variant="primary" plEmptyAction><pl-icon name="replay" />Try again</button>
      </pl-empty>
    `,
  }),
}
