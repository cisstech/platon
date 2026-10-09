import { type Meta, type StoryObj, moduleMetadata } from '@storybook/angular'
import { Segmented } from '../segmented/segmented'
import { Sheet, SheetField, SheetItem } from './sheet'

const meta: Meta<Sheet> = {
  title: 'Components/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [moduleMetadata({ imports: [Segmented, SheetField, SheetItem] })],
}

export default meta
type Story = StoryObj<Sheet>

export const Profile: Story = {
  name: 'Profile on a phone',
  render: () => ({
    props: {
      themes: [
        { value: 'light', label: 'Light' },
        { value: 'dark', label: 'Dark' },
        { value: 'system', label: 'Auto' },
      ],
    },
    template: `
      <div class="story-sheet">
        <pl-sheet>
          <a plSheetItem href="#" icon="account_circle" trailing="chevron_right">My account</a>
          <a plSheetItem href="#" icon="help" trailing="open_in_new">Help</a>
          <pl-sheet-field label="Theme" icon="light_mode">
            <pl-segmented label="Theme" size="lg" value="light" [options]="themes" />
          </pl-sheet-field>
          <button plSheetItem type="button" icon="logout">Sign out</button>
        </pl-sheet>
      </div>
    `,
  }),
}
