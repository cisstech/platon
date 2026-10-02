import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular'
import { Avatar } from '../avatar/avatar'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { Menu, MenuHeader, MenuItem, MenuSeparator, MenuTrigger } from './menu'

const meta: Meta<Menu> = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Avatar, Button, Icon, MenuHeader, MenuItem, MenuSeparator, MenuTrigger] })],
  parameters: { layout: 'padded' },
}

export default meta
type Story = StoryObj<Menu>

export const Create: Story = {
  name: 'Create menu',
  render: () => ({
    props: { chosen: '' },
    template: `
      <div class="story-cover">
        <button plButton variant="cover" [plMenuTrigger]="create"><pl-icon name="add" />Create</button>
        <span>{{ chosen && 'Chosen: ' + chosen }}</span>
      </div>
      <pl-menu #create="ngMenu" aria-label="Create" (itemSelected)="chosen = $event">
        <pl-menu-item value="course" icon="school" description="A space for your students, organized in sections.">Course</pl-menu-item>
        <pl-menu-item value="exercise" icon="code" description="From a template, without code, or in PLE.">Exercise</pl-menu-item>
        <pl-menu-item value="activity" icon="quiz" description="Exercises put together in PLA, to add to a course.">Activity</pl-menu-item>
        <pl-menu-item value="circle" icon="hub" description="A shared space for the resources of a team.">Circle</pl-menu-item>
      </pl-menu>
    `,
  }),
}

export const Profile: Story = {
  name: 'Profile menu',
  render: () => ({
    template: `
      <div class="story-cover">
        <button plButton variant="cover-quiet" [plMenuTrigger]="profile">
          <pl-avatar [person]="{ firstName: 'Karim', lastName: 'Haddad' }" />Karim Haddad
        </button>
      </div>
      <pl-menu #profile="ngMenu" aria-label="Profile" placement="below-start">
        <pl-menu-header>
          <div class="story-menu-name">Karim Haddad</div>
          <div class="story-menu-address">karim.haddad&#64;univ-eiffel.fr</div>
        </pl-menu-header>
        <pl-menu-separator />
        <pl-menu-item value="account" icon="account_circle">My account</pl-menu-item>
        <pl-menu-item value="circle" icon="folder_open">My circle</pl-menu-item>
        <pl-menu-separator />
        <pl-menu-item value="logout" icon="logout">Sign out</pl-menu-item>
      </pl-menu>
    `,
  }),
}
