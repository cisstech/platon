import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, forwardRef } from '@angular/core'

import { MatButtonModule } from '@angular/material/button'

import { MatProgressSpinnerModule } from '@angular/material/progress-spinner'

import { ActivatedRoute, Router } from '@angular/router'
import { CasService } from '../../api/cas.service'
import { NG_VALUE_ACCESSOR } from '@angular/forms'

@Component({
  standalone: true,
  selector: 'cas-sign-in',
  templateUrl: './cas-sign-in.component.html',
  styleUrls: ['./cas-sign-in.component.scss'],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CasSignInComponent), multi: true }],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MatButtonModule, MatProgressSpinnerModule],
})
export class CasSignInComponent implements OnInit {
  protected connecting = false
  protected cases: string[] = []

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly casService: CasService,
    private readonly changeDetectorRef: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.casService.listCas().subscribe((cases) => {
      this.cases = cases.resources
      this.changeDetectorRef.markForCheck()
    })
  }

  signInWithCas(casname: string): void {
    this.connecting = true

    let next = ''
    if (this.activatedRoute.snapshot.queryParams['next'])
      next = '?next=' + this.activatedRoute.snapshot.queryParams['next']

    window.location.href = '/api/v1/cas/login/' + casname + next
  }
}
