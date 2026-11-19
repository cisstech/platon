import type { Meta, StoryObj } from '@storybook/angular'

const meta: Meta = {
  title: 'Foundations/Prose',
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj

export const Content: Story = {
  name: 'Rich content, every block',
  render: () => ({
    template: `
      <div class="pl-prose">
        <p>PLaTon will be down on <strong>Sunday, October 4</strong>, from 7 to 9 am, while the
          <a href="#">server that runs the exercises</a> is updated.</p>
        <h2>What changes</h2>
        <ul>
          <li>Attempts under way at 7 am are saved.
            <ul><li>They resume where they stopped.</li></ul>
          </li>
          <li>No graded activity takes place then.</li>
        </ul>
        <ol><li>Save your work.</li><li>Come back at 9 am.</li></ol>
        <h3>Before you leave</h3>
        <ul class="checklist">
          <li class="checklist-item checked"><span class="pl-visually-hidden">Done: </span>Hand in Lab 3</li>
          <li class="checklist-item"><span class="pl-visually-hidden">To do: </span>Read the correction of Quiz 2</li>
        </ul>
        <blockquote><p>A short pause, for a faster player.</p><cite>The PLaTon team</cite></blockquote>
        <pre><code>def mean(values):
    return sum(values) / len(values)</code></pre>
        <table><tbody>
          <tr><td>Sunday</td><td>7 to 9 am</td></tr>
          <tr><td>Monday</td><td>Normal service</td></tr>
        </tbody></table>
        <hr>
        <p>Questions? Write to your teacher.</p>
      </div>
    `,
  }),
}
