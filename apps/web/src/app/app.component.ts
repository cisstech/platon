import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CoreService } from '@platon/core/browser';

@Component({
  standalone: true,
  imports: [
    RouterModule,
  ],
  selector: 'platon-root',
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
