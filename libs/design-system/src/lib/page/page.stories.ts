import { provideRouter, withHashLocation } from '@angular/router'
import { RouterLink } from '@angular/router'
import { type Meta, type StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular'
import { Alert } from '../alert/alert'
import { Button } from '../button/button'
import { Empty } from '../empty/empty'
import { Icon } from '../icon/icon'
import { Skeleton } from '../skeleton/skeleton'
import { Tooltip } from '../tooltip/tooltip'
import { Page } from './page'
import { PageFigure, PageHeader } from './page-header'
import { PageTab, PageTabs } from './page-tabs'

const meta: Meta<Page> = {
  title: 'Components/Page',
  component: Page,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    applicationConfig({ providers: [provideRouter([{ path: '**', children: [] }], withHashLocation())] }),
    moduleMetadata({
      imports: [Alert, Button, Empty, Icon, PageFigure, PageHeader, PageTab, PageTabs, RouterLink, Skeleton, Tooltip],
    }),
  ],
}

export default meta
type Story = StoryObj<Page>

const courseHeader = `
  <pl-page-header
    heading="Algorithms and programming 1"
    description="First year, first semester. The basics of programming in Python."
    [crumbs]="[{ label: 'Courses', link: '/courses' }, { label: 'Algorithms and programming 1' }]"
  >
    <button plButton variant="icon" plTooltip="Add to favorites" plPageTitleAction><pl-icon name="star" /></button>
    <button plButton variant="secondary" plPageActions><pl-icon name="share" />Share</button>
    <button plButton variant="primary" plPageActions><pl-icon name="add" />Add an activity</button>
    <pl-page-figure icon="groups" [value]="48">students</pl-page-figure>
    <pl-page-figure icon="person" [value]="6">teachers</pl-page-figure>
    <pl-page-figure icon="event">Until 18 December</pl-page-figure>
    <pl-page-tabs label="Course tabs">
      <a plPageTab routerLink="/" icon="grid_view" [routerLinkActiveOptions]="{ exact: true }">Overview</a>
      <a plPageTab routerLink="/members" icon="groups" [count]="54">Members</a>
      <a plPageTab routerLink="/challenges" icon="emoji_events" [count]="1">Challenges</a>
    </pl-page-tabs>
  </pl-page-header>
`

export const Header: Story = {
  name: 'Full header',
  render: () => ({ template: `<pl-page>${courseHeader}</pl-page>` }),
}

export const Minimal: Story = {
  name: 'Minimal header',
  render: () => ({
    template: `
      <pl-page>
        <pl-page-header heading="Courses">
          <button plButton variant="primary" plPageActions><pl-icon name="add" />Create a course</button>
        </pl-page-header>
      </pl-page>
    `,
  }),
}

export const Form: Story = {
  name: 'Form width, 760 px',
  render: () => ({
    template: `
      <pl-page width="form">
        <pl-page-header
          heading="My account"
          description="What other people see of you, and how you sign in."
          [crumbs]="[{ label: 'Settings', link: '/settings' }, { label: 'My account' }]"
        />
        <div class="story-stack">
          <pl-skeleton shape="heading" width="40%" />
          <pl-skeleton width="90%" />
          <pl-skeleton width="70%" />
        </div>
      </pl-page>
    `,
  }),
}

const skeletonRows = `
  <div class="story-stack">
    <pl-skeleton shape="heading" width="60%" />
    <pl-skeleton width="40%" />
    <pl-skeleton shape="heading" width="45%" />
    <pl-skeleton width="40%" />
    <pl-skeleton shape="button" />
  </div>
`

export const Loading: Story = {
  name: 'Loading, after 300 ms',
  render: () => ({
    template: `
      <pl-page busy>
        <pl-page-header heading="Hello Inès" description="Monday 28 September." />
        ${skeletonRows}
      </pl-page>
    `,
  }),
}

export const Slow: Story = {
  name: 'Loading, after 10 s',
  render: () => ({
    template: `
      <pl-page busy>
        <pl-page-header heading="Hello Inès" description="Monday 28 September." />
        <div class="story-stack">
          <pl-alert role="status" icon="hourglass_empty" heading="Loading is taking longer than usual.">
            <p>We keep trying, you have nothing to do.</p>
          </pl-alert>
          ${skeletonRows}
        </div>
      </pl-page>
    `,
  }),
}

export const Empty_: Story = {
  name: 'Empty, nothing yet',
  render: () => ({
    template: `
      <pl-page>
        <pl-page-header heading="Courses">
          <button plButton variant="primary" plPageActions><pl-icon name="add" />Create a course</button>
        </pl-page-header>
        <pl-empty heading="No course yet">
          <p>A course gathers your students and your activities, arranged in sections. Create one, or ask a colleague to add you as a teacher of theirs.</p>
          <button plButton variant="secondary" plEmptyAction><pl-icon name="add" />Create a course</button>
        </pl-empty>
      </pl-page>
    `,
  }),
}

export const Filtered: Story = {
  name: 'Empty, no result',
  render: () => ({
    template: `
      <pl-page>
        <pl-page-header heading="Resources" />
        <pl-empty heading="No resource for « recursion »" icon="search">
          <p>The filter <strong>Mine only</strong> sets aside 12 resources that match.</p>
          <button plButton variant="secondary" plEmptyAction><pl-icon name="close" />Remove the filter</button>
        </pl-empty>
      </pl-page>
    `,
  }),
}

export const ZoneError: Story = {
  name: 'Zone error',
  render: () => ({
    template: `
      <pl-page>
        ${courseHeader}
        <pl-empty role="alert" heading="The activities of the course could not be loaded" icon="cloud_off" tone="danger" compact>
          <p>This course is not empty: the server did not answer while loading its activities. Your answers already submitted are saved.</p>
          <button plButton variant="primary" plEmptyAction><pl-icon name="replay" />Try again</button>
        </pl-empty>
      </pl-page>
    `,
  }),
}

export const PageError: Story = {
  name: 'Page error',
  render: () => ({
    template: `
      <pl-page>
        <pl-page-header heading="Hello Inès" description="Monday 28 September." />
        <pl-empty role="alert" heading="Your home could not be loaded" icon="cloud_off" tone="danger" code="Error 503">
          <p>Your connection works, PLaTon is not answering. Your activities and the answers you already submitted are saved.</p>
          <button plButton variant="primary" plEmptyAction><pl-icon name="replay" />Try again</button>
        </pl-empty>
      </pl-page>
    `,
  }),
}

export const Offline: Story = {
  name: 'Page error, offline',
  render: () => ({
    template: `
      <pl-page>
        <pl-page-header heading="Hello Inès" description="Monday 28 September." />
        <pl-empty role="alert" heading="Your home could not be loaded" icon="wifi_off">
          <p>Your device seems to be offline. Check the network, then try again.</p>
          <button plButton variant="primary" plEmptyAction><pl-icon name="replay" />Try again</button>
        </pl-empty>
      </pl-page>
    `,
  }),
}
