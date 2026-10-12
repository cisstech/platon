import { ChangeDetectionStrategy, Component, inject } from '@angular/core'
import { ActivatedRoute, RouterModule } from '@angular/router'
import { TemplateSelectionComponent } from '@platon/feature/resource/browser'
import { ResourceTypes } from '@platon/feature/resource/common'
import { NzButtonModule } from 'ng-zorro-antd/button'

/** The gallery of the exercise templates, which the Create menu of the new interface opens. */
@Component({
  selector: 'app-templates',
  templateUrl: './templates.page.html',
  styleUrls: ['./templates.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterModule, NzButtonModule, TemplateSelectionComponent],
})
export class TemplatesPage {
  private readonly parent = inject(ActivatedRoute).snapshot.queryParamMap.get('parent')

  /** Writing without a template creates the exercise in the circle the gallery was opened from. */
  protected readonly withoutTemplate = {
    type: ResourceTypes.EXERCISE,
    ...(this.parent ? { parent: this.parent } : {}),
  }
}
