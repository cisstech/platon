import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { Level, Topic, UserRoles } from '@platon/core/common';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { firstValueFrom, Subscription } from 'rxjs';
import { ResourcePresenter } from '../../resource.presenter';

@Component({
  standalone: true,
  selector: 'app-resource-informations',
  templateUrl: './informations.component.html',
  styleUrls: ['./informations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatInputModule,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,

    NzSpinModule,
    NzFormModule,
    NzSelectModule,
  ]
})
export class ResourceInformationsComponent implements OnInit, OnDestroy {
  private readonly subscriptions: Subscription[] = [];

  protected dataSource?: DataSource;

  protected form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    desc: new FormControl('', [Validators.required]),
    topics: new FormControl([] as string[]),
    levels: new FormControl([] as string[]),
  });

  protected saving = false;
  protected context = this.presenter.defaultContext();

  protected get canEdit(): boolean {
    const { user } = this.context;
    if (!user)
      return false;
    return user.role === UserRoles.admin;
  }

  protected get canSubmit(): boolean {
    const { user } = this.context;
    if (!user)
      return false;
    return this.form.valid && this.canEdit;
  }

  constructor(
    private readonly presenter: ResourcePresenter,
    private readonly changeDetectorRef: ChangeDetectorRef,
  ) { }

  async ngOnInit(): Promise<void> {
    this.subscriptions.push(
      this.presenter.contextChange.subscribe(async context => {
        this.context = context;
        const { resource } = context;
        if (resource) {
          if (!this.dataSource) {
            const [levels, topics] = await Promise.all([
              firstValueFrom(this.presenter.availableLevels()),
              firstValueFrom(this.presenter.availableTopics())
            ]);
            this.dataSource = { levels, topics };
          }
          this.form = new FormGroup({
            name: new FormControl({ value: resource.name, disabled: !this.canEdit }, [Validators.required]),
            desc: new FormControl({ value: resource.desc || '', disabled: !this.canEdit }, [Validators.required]),
            topics: new FormControl(resource.topics.map(e => e.id)),
            levels: new FormControl(resource.levels.map(e => e.id)),
          });
        }

        this.changeDetectorRef.markForCheck();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  protected async saveChanges(): Promise<void> {
    try {
      this.saving = true;
      const { value } = this.form;
      await this.presenter.update({
        name: value.name as string,
        desc: value.desc as string,
        topics: value.topics as string[],
        levels: value.levels as string[]
      });
    } finally {
      this.saving = false;
      this.changeDetectorRef.markForCheck();
    }
  }

  protected trackByValue(_: number, item: unknown): unknown {
    return item;
  }
}

interface DataSource {
  topics: Topic[]
  levels: Level[]
}
