import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoreService } from '@platon/core/browser';
import { FeatureWebComponentModule } from '@platon/feature/webcomponent';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    FeatureWebComponentModule,
  ],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private readonly core: CoreService
  ){}

  ngOnInit(): void {
    this.core.init();
  }
}
