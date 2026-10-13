import { provideRouter, withHashLocation } from '@angular/router'
import { type Meta, type StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { Progress } from '../progress/progress'
import { Binder } from './binder'
import { BinderSkeleton } from './binder-skeleton/binder-skeleton'

const meta: Meta<Binder> = {
  title: 'Components/Binder',
  component: Binder,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: [provideRouter([{ path: '**', children: [] }], withHashLocation())] }),
    moduleMetadata({ imports: [BinderSkeleton, Button, Icon, Progress] }),
  ],
}

export default meta
type Story = StoryObj<Binder>

const actions = `<button type="button" plButton variant="icon" size="sm" plBinderActions aria-label="Course actions">
  <pl-icon name="more_horiz" /></button>`

export const Teacher: Story = {
  name: 'For a teacher: the headcount',
  render: () => ({
    template: `
      <div class="story-binders">
        <pl-binder heading="Algorithms and programming 1" description="First year, semester 1. Programming basics in Python."
          monogram="AP1" hue="lagoon" href="/courses/ap1" badge="1 challenge" badgeHref="/courses/ap1/challenges" badgeIcon="emoji_events">
          ${actions}
          <p class="story-binder-line"><strong>6</strong> teachers · <strong>302</strong> students · <strong>9</strong> activities</p>
        </pl-binder>
        <pl-binder heading="Web programming" description="HTML, CSS and JavaScript, from the form to the application. A project in pairs."
          monogram="WP" hue="cornflower" href="/courses/wp">
          ${actions}
          <p class="story-binder-line"><strong>2</strong> teachers · <strong>84</strong> students · <strong>11</strong> activities</p>
        </pl-binder>
      </div>
    `,
  }),
}

export const Student: Story = {
  name: 'For a student: their progress',
  render: () => ({
    template: `
      <div class="story-binders">
        <pl-binder heading="Calculus 1" description="Sequences, limits, functions of a real variable."
          monogram="CA1" hue="olive" href="/courses/ca1">
          ${actions}
          <pl-progress [value]="16" [max]="40" hue="olive" />
          <p class="story-binder-line">16 exercises out of 40, 2 activities finished out of 5</p>
          <p class="story-binder-line">Nadia Ferrand and 3 other teachers</p>
        </pl-binder>
      </div>
    `,
  }),
}

export const Compact: Story = {
  name: 'Compact, on a narrow screen',
  render: () => ({
    template: `
      <div class="story-binders-compact">
        <pl-binder heading="Algorithms and programming 1" monogram="AP1" hue="lagoon" href="/courses/ap1" compact>
          ${actions}
          <pl-progress [value]="34" [max]="59" hue="lagoon" />
          <p class="story-binder-line">34 exercises out of 59, 4 activities finished out of 9</p>
        </pl-binder>
        <pl-binder heading="Algebra 1" monogram="AL1" hue="raspberry" href="/courses/al1" compact>
          <p class="story-binder-line">Karim Haddad and 2 other teachers</p>
        </pl-binder>
      </div>
    `,
  }),
}

export const Loading: Story = {
  name: 'On their way',
  render: () => ({
    template: `<div class="story-binders"><pl-binder-skeleton /><pl-binder-skeleton /></div>`,
  }),
}
