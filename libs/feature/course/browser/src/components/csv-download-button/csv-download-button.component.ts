import { CommonModule } from '@angular/common'
import { FormsModule } from '@angular/forms'
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core'

import { firstValueFrom } from 'rxjs'

import { NzButtonModule } from 'ng-zorro-antd/button'
import { NzDropDownModule } from 'ng-zorro-antd/dropdown'
import { NzIconModule } from 'ng-zorro-antd/icon'
import { NzToolTipModule } from 'ng-zorro-antd/tooltip'
import { NzMenuModule } from 'ng-zorro-antd/menu'
import { NzCheckboxModule } from 'ng-zorro-antd/checkbox'

import { Activity, ActivityMember } from '@platon/feature/course/common'
import { ResultService } from '@platon/feature/result/browser'
import { UserResults } from '@platon/feature/result/common'
import { CourseService } from '../../api/course.service'

@Component({
  standalone: true,
  selector: 'course-csv-download-button',
  templateUrl: './csv-download-button.component.html',
  styleUrls: ['./csv-download-button.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    NzButtonModule,
    NzIconModule,
    NzToolTipModule,
    NzDropDownModule,
    NzMenuModule,
    NzCheckboxModule,
  ],
})
export class CsvDownloadButtonComponent implements OnInit {
  @Input() courseId!: string
  @Input() activities!: Activity[]
  @Input() type!: 'activity' | 'course'
  @Input() name!: string

  groups: { id: string; name: string; groupId: string; courseId: string; checked: boolean }[] = []
  activityMembers: ActivityMember[] = []
  hasToCheckGroups = false

  constructor(private readonly resultService: ResultService, private readonly courseService: CourseService) {}

  async ngOnInit(): Promise<void> {
    let groups = (await firstValueFrom(this.courseService.listGroups(this.courseId))).resources

    const nbCourseGroups = groups.length
    if (nbCourseGroups > 0) {
      this.hasToCheckGroups = true
    }

    if (this.activities.length === 1) {
      this.activityMembers = (
        await firstValueFrom(this.courseService.searchActivityMembers(this.activities[0]))
      ).resources

      const activityGroups = (await firstValueFrom(this.courseService.searchActivityGroups(this.activities[0].id)))
        .resources

      let hasToDisplayAllGroups = true
      if (activityGroups.length > 0) {
        hasToDisplayAllGroups = false
        groups = groups.filter((group) => activityGroups.some((activityGroup) => activityGroup.groupId === group.id))
      }

      if (this.activityMembers.length > 0 && hasToDisplayAllGroups) {
        groups = []
      }

      if (this.activityMembers.length > 0) {
        groups.push({
          id: 'all',
          name: 'Autres étudiants',
          groupId: '',
          courseId: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
    }

    if (groups.length === nbCourseGroups) {
      groups.push({
        id: 'all',
        name: 'Autres Étudiants',
        groupId: '',
        courseId: '',
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    this.groups = groups.map((group) => ({ ...group, checked: true }))
  }

  toggleAllCheckboxes() {
    const allChecked = this.groups.every((group) => group.checked)
    this.groups.forEach((group) => (group.checked = !allChecked))
  }

  isAllChecked() {
    return this.groups.every((group) => group.checked)
  }

  getExcelColumnLetter(colIndex: number): string {
    let column = ''
    while (colIndex >= 0) {
      column = String.fromCharCode((colIndex % 26) + 65) + column
      colIndex = Math.floor(colIndex / 26) - 1
    }
    return column
  }

  async downloadCSV() {
    let isGroupAllChecked, checkedMembers, uncheckedMembers
    if (this.hasToCheckGroups) {
      isGroupAllChecked = this.groups.some((group) => group.checked && group.id === 'all')
      checkedMembers = (
        await firstValueFrom(
          this.courseService.listGroupsMembers(
            this.courseId,
            this.groups.filter((group) => group.checked && group.id !== 'all').map((group) => group.groupId)
          )
        )
      ).resources
      uncheckedMembers = (
        await firstValueFrom(
          this.courseService.listGroupsMembers(
            this.courseId,
            this.groups.filter((group) => !group.checked && group.id !== 'all').map((group) => group.groupId)
          )
        )
      ).resources
    }

    let csvHeader = 'username;firstname;lastname;email'
    const csvContent: { [key: string]: string } = {}
    const sum_begin = csvHeader.split(';').length

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
        if (this.hasToCheckGroups && !checkedMembers?.some((member) => member.user?.id === student.id)) {
          if (!isGroupAllChecked || uncheckedMembers?.some((member) => member.user?.id === student.id)) {
            continue
          }
        }
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

    const sum_end = csvHeader.split(';').length - 1
    csvHeader += ';TOTAL'

    Object.values(csvContent).forEach(
      (line, index) =>
        (csvHeader += `\n${line};\
          =SUM(${this.getExcelColumnLetter(sum_begin)}${index + 2}:\
          ${this.getExcelColumnLetter(sum_end)}${index + 2})`)
    )

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
