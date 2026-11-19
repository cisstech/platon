import { provideRouter, withHashLocation } from '@angular/router'
import { type Meta, type StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular'
import { ActivityList } from '../activity-row/activity-list/activity-list'
import { ActivityRow } from '../activity-row/activity-row'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { CourseSection } from './course-section'

const meta: Meta<CourseSection> = {
  title: 'Components/Course section',
  component: CourseSection,
  tags: ['autodocs'],
  decorators: [
    applicationConfig({ providers: [provideRouter([{ path: '**', children: [] }], withHashLocation())] }),
    moduleMetadata({ imports: [ActivityList, ActivityRow, Button, Icon] }),
  ],
}

export default meta
type Story = StoryObj<CourseSection>

const rows = `
  <pl-activity-list aria-label="Week 5">
    <pl-activity-row heading="Lab 5: recursive functions" icon="code" hue="lagoon" due="No deadline" detail="8 exercises"
      [done]="0" [total]="8" progressText="0 of 8" progressHint="exercises done" action="Start" href="/activity"
      button="secondary" />
    <pl-activity-row heading="Challenge: sorting" icon="emoji_events" hue="lagoon" due="No deadline" detail="5 exercises"
      [done]="2" [total]="5" progressText="2 of 5" progressHint="exercises done" action="Resume" href="/activity"
      button="secondary" />
  </pl-activity-list>
`

export const Divider: Story = {
  name: 'A divider in the hue of the course, its actions at the end of the rule',
  render: () => ({
    template: `
      <div class="story-card story-sections">
        <pl-course-section heading="Week 5" summary="2 activities" hue="lagoon">
          <button plButton plCourseSectionActions variant="icon" size="sm" type="button" aria-label="Actions of the section Week 5">
            <pl-icon name="more_horiz" /></button>
          ${rows}
        </pl-course-section>
        <pl-course-section heading="Week 4" summary="1 activity" hue="lagoon">
          <pl-activity-list aria-label="Week 4">
            <pl-activity-row heading="Quiz: complexity of algorithms" icon="quiz" hue="lagoon"
              due="Closes tonight at 11:59 pm" dueTone="warning" dueIcon="schedule" detail="6 exercises" [done]="5"
              [total]="6" progressText="5 of 6" progressHint="exercises done" action="Resume" href="/activity"
              button="secondary" />
          </pl-activity-list>
        </pl-course-section>
      </div>
    `,
  }),
}

export const Folding: Story = {
  name: 'On a phone: dividers that fold, each saying what it holds',
  render: () => ({
    template: `
      <div class="story-card story-sections">
        <pl-course-section heading="Week 5" summary="2 activities, 2 to do" hue="lagoon" collapsible>${rows}</pl-course-section>
        <pl-course-section heading="Week 4" summary="1 activity, done" hue="olive" collapsible [expanded]="false">
          <pl-activity-list aria-label="Week 4">
            <pl-activity-row heading="Lab 4: loops and arrays" icon="code" hue="olive" due="Closed" detail="8 exercises"
              href="/activity" />
          </pl-activity-list>
        </pl-course-section>
      </div>
    `,
  }),
}
