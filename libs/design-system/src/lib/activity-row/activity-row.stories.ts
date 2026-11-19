import { provideRouter, withHashLocation } from '@angular/router'
import { type Meta, type StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { ActivityList } from './activity-list/activity-list'
import { ActivityRow } from './activity-row'
import { ActivityRowActions } from './activity-row-actions'
import { ActivityRowSkeleton } from './activity-row-skeleton/activity-row-skeleton'

const meta: Meta<ActivityRow> = {
  title: 'Components/Activity row',
  component: ActivityRow,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: [provideRouter([{ path: '**', children: [] }], withHashLocation())] }),
    moduleMetadata({ imports: [ActivityList, ActivityRowActions, ActivityRowSkeleton, Button, Icon] }),
  ],
}

export default meta
type Story = StoryObj<ActivityRow>

export const ToDo: Story = {
  name: 'To do, the most urgent first, then soon',
  render: () => ({
    template: `
      <div class="story-card">
        <pl-activity-list aria-label="To do">
          <pl-activity-row heading="Quiz: complexity of algorithms" context="Algorithms 1" icon="quiz" hue="lagoon"
            due="Closes tonight at 11:59 pm" dueTone="warning" dueIcon="schedule" [done]="5" [total]="6"
            progressText="5 of 6" progressHint="exercises done" action="Resume" href="/activity" button="primary" />
          <pl-activity-row heading="Lab 4: loops and arrays" context="Algorithms 1" icon="code" hue="lagoon"
            due="Closes Thursday at 6 pm" dueIcon="schedule" [done]="3" [total]="8" progressText="3 of 8"
            progressHint="exercises done" action="Resume" href="/activity" />
          <pl-activity-row heading="Challenge: sorting" context="Algorithms 1" icon="emoji_events" hue="lagoon"
            due="No deadline" [done]="2" [total]="5" progressText="2 of 5" progressHint="exercises done"
            action="Resume" href="/activity" />
          <pl-activity-row heading="Sequences: practice" context="Calculus 1" icon="functions" hue="olive"
            due="No deadline" [done]="0" [total]="12" progressText="0 of 12" progressHint="exercises done"
            action="Start" href="/activity" />
        </pl-activity-list>
        <h3 id="story-soon">Soon</h3>
        <pl-activity-list aria-labelledby="story-soon">
          <pl-activity-row heading="Continuous assessment 2" context="Calculus 1" icon="history_edu" hue="olive"
            due="Opens Wednesday at 10 am" dueTone="info" dueIcon="event" detail="45 min, one attempt" tag="Graded"
            tagIcon="grading" action="Read the rules" href="/activity" />
        </pl-activity-list>
      </div>
    `,
  }),
}

export const Late: Story = {
  name: 'A deadline passed',
  render: () => ({
    template: `
      <div class="story-card">
        <pl-activity-list aria-label="To do">
          <pl-activity-row heading="Lab 2: functions" context="Algorithms 1" icon="code" hue="lagoon"
            due="Late" dueTone="danger" dueIcon="error" [done]="4" [total]="7" progressText="4 of 7"
            progressHint="exercises done" action="Resume" href="/activity" />
        </pl-activity-list>
      </div>
    `,
  }),
}

export const Loading: Story = {
  render: () => ({
    template: `
      <div class="story-card"><pl-activity-row-skeleton /><pl-activity-row-skeleton /><pl-activity-row-skeleton /></div>
    `,
  }),
}

export const Narrow: Story = {
  name: 'On a phone',
  render: () => ({
    template: `
      <div class="story-card story-phone">
        <pl-activity-list aria-label="To do">
          <pl-activity-row heading="Quiz: complexity of algorithms" context="Algorithms 1" icon="quiz" hue="lagoon"
            due="Closes tonight at 11:59 pm" dueTone="warning" dueIcon="schedule" [done]="5" [total]="6"
            progressText="5 of 6" progressHint="exercises done" action="Resume" href="/activity" button="primary" />
          <pl-activity-row heading="Lab 4: loops and arrays" context="Algorithms 1" icon="code" hue="lagoon"
            due="Closes Thursday at 6 pm" dueIcon="schedule" [done]="3" [total]="8" progressText="3 of 8"
            progressHint="exercises done" action="Resume" href="/activity" />
        </pl-activity-list>
      </div>
    `,
  }),
}

export const Teaching: Story = {
  name: 'Teaching: running, then gestures to make',
  render: () => ({
    template: `
      <div class="story-card">
        <pl-activity-list aria-label="Running">
          <pl-activity-row heading="Quiz: complexity of algorithms" context="Algorithms 1" icon="quiz" hue="lagoon"
            due="Closes tonight at 11:59 pm" dueTone="warning" dueIcon="schedule" detail="provisional mean 74 / 100"
            [done]="251" [total]="302" progressText="251 of 302 started" href="/monitor" />
        </pl-activity-list>
        <h3 id="story-gestures">To do</h3>
        <pl-activity-list aria-labelledby="story-gestures">
          <pl-activity-row heading="Project 1: sign-up form" context="Web programming" icon="code" hue="cornflower"
            detail="last handed in on 26 September" progressText="2 copies to correct out of 2" action="Correct"
            href="/correction" button="secondary" />
          <pl-activity-row heading="Lab 5: recursive functions" context="Algorithms 1" icon="assignment" hue="lagoon"
            due="Open, without dates" dueIcon="info" detail="23 students started" action="Plan" href="/settings"
            button="secondary" />
        </pl-activity-list>
      </div>
    `,
  }),
}

export const Teacher: Story = {
  name: 'For a teacher: its state, the row opening its monitoring, its actions apart',
  render: () => ({
    template: `
      <div class="story-card">
        <pl-activity-list aria-label="Week 5">
          <pl-activity-row heading="Lab 5: recursive functions" icon="code" hue="lagoon" status="Open" statusTone="success"
            statusIcon="event_available" due="No dates" detail="8 exercises" href="/monitor">
            <a plButton plActivityRowActions variant="secondary" size="sm" href="#/settings"><pl-icon name="calendar_month" />Schedule</a>
            <button plButton plActivityRowActions variant="icon" size="sm" type="button" aria-label="More actions for Lab 5">
              <pl-icon name="more_horiz" /></button>
          </pl-activity-row>
          <pl-activity-row heading="Midterm 2" icon="history_edu" hue="lagoon" status="Scheduled" statusTone="info"
            statusIcon="event" due="Opens on 12 October at 8 am" detail="1 h 30, one attempt, 8 exercises" tag="Graded"
            tagIcon="grading" href="/monitor">
            <button plButton plActivityRowActions variant="icon" size="sm" type="button" aria-label="More actions for Midterm 2">
              <pl-icon name="more_horiz" /></button>
          </pl-activity-row>
          <pl-activity-row heading="Lab 3: conditions" icon="code" hue="lagoon" status="Closed" statusIcon="event_busy"
            due="Closed on 21 Sept." detail="7 exercises" href="/monitor">
            <button plButton plActivityRowActions variant="icon" size="sm" type="button" aria-label="More actions for Lab 3">
              <pl-icon name="more_horiz" /></button>
          </pl-activity-row>
        </pl-activity-list>
      </div>
    `,
  }),
}
