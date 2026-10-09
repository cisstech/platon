import type { Meta, StoryObj } from '@storybook/angular'
import { Segmented } from './segmented'

const meta: Meta<Segmented> = {
  title: 'Components/Segmented',
  component: Segmented,
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<Segmented>

export const Theme: Story = {
  args: {
    label: 'Theme',
    value: 'light',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'Auto' },
    ],
  },
}

export const Touch: Story = {
  name: 'Touch size, 44 px',
  args: {
    label: 'Theme',
    value: 'dark',
    size: 'lg',
    options: [
      { value: 'light', label: 'Light' },
      { value: 'dark', label: 'Dark' },
      { value: 'system', label: 'Auto' },
    ],
  },
}

export const Filters: Story = {
  args: {
    label: 'Activities',
    value: 'all',
    options: [
      { value: 'all', label: 'All' },
      { value: 'open', label: 'Open' },
      { value: 'upcoming', label: 'Upcoming' },
      { value: 'closed', label: 'Closed' },
    ],
  },
}

export const IconOnly: Story = {
  name: 'Icons only',
  args: {
    label: 'Display',
    value: 'sections',
    options: [
      { value: 'sections', label: 'Sections', icon: 'grid_view', iconOnly: true },
      { value: 'table', label: 'Table', icon: 'list', iconOnly: true },
    ],
  },
}
