import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { DetailsPage } from './details.page';
import { DetailsPageRoutingModule } from './details-routing.module';

@NgModule({
  imports: [CommonModule, FormsModule, IonicModule, DetailsPageRoutingModule],
  declarations: [DetailsPage],
})
export class DetailsPageModule {}
