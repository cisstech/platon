import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ListingComponent } from './listing.component';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [CommonModule, RouterModule, MatCardModule],
  declarations: [ListingComponent],
})
export class ListingModule {
  component = ListingComponent;
}
