import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { DialogModule, DialogService, TagListComponent, TagService } from '@platon/core/browser'
import { Level, Topic } from '@platon/core/common'
import { firstValueFrom } from 'rxjs'

@Component({
  standalone: true,
  selector: 'app-admin-tags',
  templateUrl: './tags.page.html',
  styleUrls: ['./tags.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, DialogModule, TagListComponent],
})
export class AdminTagsPage implements OnInit {
  protected topics: Topic[] = []
  protected levels: Level[] = []

  constructor(
    private readonly tagService: TagService,
    private readonly dialogService: DialogService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  async ngOnInit(): Promise<void> {
    const [topics, levels] = await Promise.all([
      firstValueFrom(this.tagService.listTopics()),
      firstValueFrom(this.tagService.listLevels()),
    ])
    this.topics = topics
    this.levels = levels
    this.changeDetectorRef.markForCheck()
  }

  async deleteTag(tag: Topic | Level, type: 'topic' | 'level') {
    try {
      await firstValueFrom(type === 'level' ? this.tagService.deleteLevel(tag) : this.tagService.deleteTopic(tag))
      if (type === 'level') {
        this.levels = this.levels.filter((item) => item.id !== tag.id)
      } else {
        this.topics = this.topics.filter((item) => item.id !== tag.id)
      }
    } catch {
      this.dialogService.error(
        'Une erreur est survenue lors de la suppression du tag, veuillez réessayer un peu plus tard !'
      )
    } finally {
      this.changeDetectorRef.markForCheck()
    }
  }

  async createTag(name: string, type: 'topic' | 'level') {
    try {
      const tag = await firstValueFrom(
        type === 'level' ? this.tagService.createLevel({ name }) : this.tagService.createTopic({ name })
      )
      if (type === 'level') {
        this.levels = [...this.levels, tag].sort((a, b) => a.name.localeCompare(b.name))
      } else {
        this.topics = [...this.topics, tag].sort((a, b) => a.name.localeCompare(b.name))
      }
    } catch {
      this.dialogService.error(
        'Une erreur est survenue lors de la suppression du tag, veuillez réessayer un peu plus tard !'
      )
    } finally {
      this.changeDetectorRef.markForCheck()
    }
  }
}
