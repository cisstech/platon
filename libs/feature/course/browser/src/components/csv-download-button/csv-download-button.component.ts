import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input } from '@angular/core'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'

import { Activity } from '@platon/feature/course/common'

import { ResultService } from '@platon/feature/result/browser'
import { firstValueFrom } from 'rxjs'
import { UserResults } from '@platon/feature/result/common'

@Component({
  standalone: true,
  selector: 'course-csv-download-button',
  templateUrl: './csv-download-button.component.html',
  styleUrls: ['./csv-download-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, NzIconModule, NzButtonModule, NzToolTipModule],
})
export class CsvDownloadButtonComponent {
  @Input() activities!: Activity[]
  @Input() type!: 'activity' | 'course'
  @Input() name!: string

  constructor(private readonly resultService: ResultService) {}

  async downloadCSV() {
    let csvHeader = 'username;firstname;lastname;email'
    const csvContent: { [key: string]: string } = {}

    for (const item of this.activities) {
      // Get data

      const [data] = await Promise.all([firstValueFrom(this.resultService.activityResults(item.id))])
      const results: UserResults[] = data.users

      // Generate the CSV header

      let activity_title = item.title
      activity_title = activity_title.replace(/"/g, '""')
      Object.values(results[0].exercises).forEach((exercise) => {
        let exercise_title = exercise.title
        exercise_title = exercise_title.replace(/"/g, '""')
        csvHeader += `;"(${activity_title}) ${exercise_title}"`
      })

      // Generate the CSV content

      for (const student of results) {
        if (!csvContent[student.username]) {
          csvContent[student.username] = `${student.username};${student.firstName};${student.lastName};${student.email}`
        }
        Object.values(student.exercises).forEach((exercise) => {
          if (exercise.state === 'NOT_STARTED') {
            csvContent[student.username] += ';'
          } else {
            csvContent[student.username] += `;${exercise.grade}`
          }
        })
      }
    }

    Object.values(csvContent).forEach((line) => (csvHeader += `\n${line}`))

    // Download the file

    const element = document.createElement('a')
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(csvHeader))
    element.setAttribute('download', this.name + '_results.csv')

    element.style.display = 'none'
    document.body.appendChild(element)

    element.click()
    document.body.removeChild(element)
  }
}
