import { provideRouter, withHashLocation } from '@angular/router'
import { type Meta, type StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular'
import { CopyCard } from './copy-card'
import { CopyCardSkeleton } from './copy-card-skeleton/copy-card-skeleton'

const meta: Meta<CopyCard> = {
  title: 'Components/Copy card',
  component: CopyCard,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: [provideRouter([{ path: '**', children: [] }], withHashLocation())] }),
    moduleMetadata({ imports: [CopyCardSkeleton] }),
  ],
}

export default meta
type Story = StoryObj<CopyCard>

export const Recent: Story = {
  name: 'Graded, being corrected, without its correction',
  render: () => ({
    template: `
      <div class="story-copies">
        <pl-copy-card heading="Lab 3: conditions" context="Algorithms 1" date="Handed in on 22 September" hue="lagoon"
          [grade]="82" gradeLabel="82 out of 100" action="See the correction" actionIcon="rate_review" href="/activity" />
        <pl-copy-card heading="Midterm exam 1" context="Algorithms 1" date="Handed in on 22 September" hue="lagoon"
          state="Being corrected" stateIcon="pending" />
        <pl-copy-card heading="Quiz 2" context="Calculus 1" date="Handed in on 20 September" hue="olive"
          state="Handed in" stateIcon="task_alt" />
      </div>
    `,
  }),
}

export const Loading: Story = {
  render: () => ({
    template: `<div class="story-copies"><pl-copy-card-skeleton /><pl-copy-card-skeleton /></div>`,
  }),
}
