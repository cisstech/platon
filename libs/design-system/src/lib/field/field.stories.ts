import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular'
import { Button } from '../button/button'
import { Icon } from '../icon/icon'
import { Field, FieldInput, PasswordReveal } from './field'

const meta: Meta<Field> = {
  title: 'Components/Field',
  component: Field,
  tags: ['autodocs'],
  decorators: [moduleMetadata({ imports: [Button, FieldInput, Icon, PasswordReveal] })],
}

export default meta
type Story = StoryObj<Field>

const password = (value = '', invalid = false) => `
  <pl-field label="Password">
    <a plFieldAside href="#">Forgot your password?</a>
    <input plInput type="password" autocomplete="current-password" placeholder="Your password"
      value="${value}" [invalid]="${invalid}" ${invalid ? 'aria-describedby="story-message"' : ''} />
    <button type="button" plButton variant="icon" size="sm" plPasswordReveal #reveal="plPasswordReveal"
      aria-label="Show the password">
      <pl-icon [name]="reveal.shown() ? 'visibility_off' : 'visibility'" />
    </button>
  </pl-field>
`

export const Text: Story = {
  name: 'Text, empty and filled',
  render: () => ({
    template: `
      <div class="story-form">
        <pl-field label="Username"><input plInput autocomplete="username" placeholder="firstname.lastname" /></pl-field>
        <pl-field label="Username"><input plInput autocomplete="username" value="sophie.lambert" /></pl-field>
      </div>
    `,
  }),
}

export const Password: Story = {
  name: 'Password, with its aside and its reveal button',
  render: () => ({ template: `<div class="story-form">${password('correct horse')}</div>` }),
}

export const Invalid: Story = {
  name: 'Invalid, described by the message of the page',
  render: () => ({
    template: `
      <div class="story-form">
        <pl-field label="Username">
          <input plInput autocomplete="username" value="ines.benali" [invalid]="true" aria-describedby="story-message" />
        </pl-field>
        ${password('secret', true)}
        <p id="story-message" class="story-message">Wrong username or password.</p>
      </div>
    `,
  }),
}
