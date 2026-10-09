import { RouterLink, provideRouter, withHashLocation } from '@angular/router'
import { type Meta, type StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { Page } from '../page/page'
import { PageHeader } from '../page/page-header'
import { SkipLink } from '../skip-link/skip-link'
import { Cover, CoverBrand, CoverCredit, CoverFoot, CoverItem, CoverNav, CoverProfile } from './cover'

const meta: Meta<Cover> = {
  title: 'Components/Cover',
  component: Cover,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    applicationConfig({ providers: [provideRouter([{ path: '**', children: [] }], withHashLocation())] }),
    moduleMetadata({
      imports: [
        Button,
        CoverBrand,
        CoverCredit,
        CoverFoot,
        CoverItem,
        CoverNav,
        CoverProfile,
        Icon,
        Page,
        PageHeader,
        RouterLink,
        SkipLink,
      ],
    }),
  ],
}

export default meta
type Story = StoryObj<Cover>

interface Frame {
  readonly create?: 'cover' | 'cover-quiet'
  readonly teacher?: boolean
  readonly admin?: boolean
  readonly corrections?: number
  readonly person: string
  readonly account: string
}

const frame = ({ create, teacher, admin, corrections, person, account }: Frame) => {
  const [firstName, lastName] = person.split(' ')
  return `
    <a plSkipLink>Skip to content</a>
    <div class="story-shell">
      <pl-cover>
        <a plCoverBrand routerLink="/" institution="Université Gustave Eiffel">PLaTon</a>
        ${create ? `<button plButton plCoverAction variant="${create}"><pl-icon name="add" />Create</button>` : ''}
        <pl-cover-nav label="Main navigation">
          <a plCoverItem routerLink="/" [routerLinkActiveOptions]="{ exact: true }" icon="home">Home</a>
          <a plCoverItem routerLink="/announcements" icon="campaign">Announcements</a>
          <a plCoverItem routerLink="/courses" icon="school">Courses</a>
          ${
            corrections !== undefined
              ? `<a plCoverItem routerLink="/corrections" icon="rate_review" [count]="${corrections}" countLabel="copies to correct">Corrections</a>`
              : ''
          }
          ${
            teacher
              ? `<a plCoverItem routerLink="/resources" icon="folder_open">Resources</a>
                 <a plCoverItem routerLink="/tests" icon="fact_check">Entrance tests</a>`
              : ''
          }
          ${admin ? `<a plCoverItem routerLink="/admin" icon="shield_person">Administration</a>` : ''}
        </pl-cover-nav>
        <pl-cover-foot>
          ${teacher ? `<a plCoverItem href="/docs" target="_blank" icon="help">Documentation</a>` : ''}
          <button plCoverProfile [person]="{ firstName: '${firstName}', lastName: '${lastName}' }" detail="${account}">${person}</button>
          <a plCoverCredit href="https://github.com/cisstech/platon">Free software, by <strong>cisstech</strong></a>
        </pl-cover-foot>
      </pl-cover>
      <div class="story-shell__page">
        <pl-page><pl-page-header heading="Hello ${firstName}" description="Monday 28 September." /></pl-page>
      </div>
    </div>
  `
}

export const Student: Story = {
  render: () => ({ template: frame({ person: 'Inès Benali', account: 'Student account' }) }),
}

export const StudentWhoCorrects: Story = {
  name: 'Student who corrects',
  render: () => ({ template: frame({ person: 'Inès Benali', account: 'Student account', corrections: 2 }) }),
}

export const Teacher: Story = {
  render: () => ({
    template: frame({
      person: 'Karim Haddad',
      account: 'Teacher account',
      create: 'cover',
      teacher: true,
      corrections: 2,
    }),
  }),
}

export const QuietCreate: Story = {
  name: 'Teacher, quiet Create',
  render: () => ({
    template: frame({
      person: 'Karim Haddad',
      account: 'Teacher account',
      create: 'cover-quiet',
      teacher: true,
      corrections: 0,
    }),
  }),
}

export const Administrator: Story = {
  render: () => ({
    template: frame({
      person: 'Claire Morel',
      account: 'Administrator account',
      create: 'cover',
      teacher: true,
      admin: true,
      corrections: 12,
    }),
  }),
}

export const Panel: Story = {
  name: 'Panel, on a narrow screen',
  render: () => ({
    template: `
      <div class="story-panel">
        <pl-cover layout="panel">
          <a plCoverBrand routerLink="/" institution="Université Gustave Eiffel">PLaTon</a>
          <button plButton plCoverClose variant="cover-icon" size="lg" aria-label="Close the navigation">
            <pl-icon name="close" />
          </button>
          <button plButton plCoverAction variant="cover"><pl-icon name="add" />Create</button>
          <pl-cover-nav label="Main navigation">
            <a plCoverItem routerLink="/" [routerLinkActiveOptions]="{ exact: true }" icon="home">Home</a>
            <a plCoverItem routerLink="/announcements" icon="campaign">Announcements</a>
            <a plCoverItem routerLink="/courses" icon="school">Courses</a>
          </pl-cover-nav>
          <pl-cover-foot>
            <button plCoverProfile [person]="{ firstName: 'Karim', lastName: 'Haddad' }" detail="Teacher account">
              Karim Haddad
            </button>
            <a plCoverCredit href="https://github.com/cisstech/platon">Free software, by <strong>cisstech</strong></a>
          </pl-cover-foot>
        </pl-cover>
      </div>
    `,
  }),
}
