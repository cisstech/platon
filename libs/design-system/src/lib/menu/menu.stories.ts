import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular'
import { Avatar } from '../avatar/avatar'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { Menu, MenuGroup, MenuHeader, MenuItem, MenuSeparator, MenuTrigger } from './menu'

const meta: Meta<Menu> = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
  decorators: [
    moduleMetadata({ imports: [Avatar, Button, Icon, MenuGroup, MenuHeader, MenuItem, MenuSeparator, MenuTrigger] }),
  ],
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
        <pl-menu-item value="course" glyph="course" description="Your students' space, with your activities in sections: weeks, chapters.">Course</pl-menu-item>
        <pl-menu-item value="activity" glyph="activity" description="A series of exercises to do in a course, with dates and, if you want, a grade.">Activity</pl-menu-item>
        <pl-menu-item value="exercise" glyph="exercise" description="A question graded automatically. Start from a template or write it in code.">Exercise</pl-menu-item>
        <pl-menu-item value="circle" glyph="circle" description="A shared space for the resources of a team.">Circle</pl-menu-item>
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
        <pl-menu-group label="Theme">
          <pl-menu-item value="light" role="menuitemradio" [checked]="true">Light</pl-menu-item>
          <pl-menu-item value="dark" role="menuitemradio" [checked]="false">Dark</pl-menu-item>
          <pl-menu-item value="system" role="menuitemradio" [checked]="false">Auto</pl-menu-item>
        </pl-menu-group>
        <pl-menu-separator />
        <pl-menu-item value="logout" icon="logout">Sign out</pl-menu-item>
      </pl-menu>
    `,
  }),
}

export const Actions: Story = {
  name: 'Actions with a destructive entry',
  render: () => ({
    template: `
      <button plButton variant="icon" [plMenuTrigger]="actions" aria-label="Actions of the section">
        <pl-icon name="more_horiz" />
      </button>
      <pl-menu #actions="ngMenu" aria-label="Actions of the section">
        <pl-menu-item value="rename" icon="edit">Rename the section</pl-menu-item>
        <pl-menu-item value="move" icon="drag_indicator">Move the section</pl-menu-item>
        <pl-menu-separator />
        <pl-menu-item value="delete" icon="delete" tone="danger">Delete the section</pl-menu-item>
      </pl-menu>
    `,
  }),
}
